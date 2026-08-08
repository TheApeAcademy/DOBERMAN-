import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const DAILY_LIMIT = 3

type HFLabel = { label: string; score: number }
type HiveClass = { class: string; score: number }
type HiveOutput = { classes?: HiveClass[]; time?: number; [key: string]: unknown }

const GENERATOR_KEYWORDS: Record<string, string> = {
  midjourney: 'Midjourney',
  dalle: 'DALL-E',
  dalle2: 'DALL-E',
  dalle3: 'DALL-E',
  stablediffusion: 'Stable Diffusion',
  sdxl: 'Stable Diffusion XL',
  firefly: 'Adobe Firefly',
  adobefirefly: 'Adobe Firefly',
  sora: 'Sora',
  runway: 'Runway',
  runwayml: 'Runway',
  kling: 'Kling',
  veo: 'Veo',
  imagen: 'Imagen',
  flux: 'Flux',
  ideogram: 'Ideogram',
  stylegan: 'StyleGAN',
  novelai: 'NovelAI',
  leonardo: 'Leonardo AI',
  craiyon: 'Craiyon',
}

const DEEPFAKE_KEYWORDS = ['deepfake', 'faceswap', 'fakeface', 'manipulatedface', 'facemanipulation']
const AI_GEN_KEYWORDS = ['aigenerated', 'generated', 'synthetic', 'artificial']
const GENERIC_FAKE_KEYWORDS = ['yes', 'fake']
const GENERIC_AUTHENTIC_KEYWORDS = ['no', 'real', 'authentic']

function normalize(key: string): string {
  return key.toLowerCase().replace(/[^a-z0-9]/g, '')
}

function collectClasses(hiveResult: Record<string, unknown>): HiveClass[] {
  const output = (hiveResult as { status?: { response?: { output?: HiveOutput[] } } })?.status?.response?.output
  if (!Array.isArray(output)) return []
  return output.flatMap((o) => o?.classes || [])
}

function extractAttribution(classes: HiveClass[]) {
  const candidates = classes
    .map((c) => {
      const norm = normalize(c.class)
      const display = GENERATOR_KEYWORDS[norm]
      return display ? { model: display, confidence: Math.round(c.score * 1000) / 10 } : null
    })
    .filter((c): c is { model: string; confidence: number } => c !== null)
    .sort((a, b) => b.confidence - a.confidence)

  const top = candidates.length > 0 && candidates[0].confidence >= 15 ? candidates[0] : null

  return { top, candidates: candidates.slice(0, 4) }
}

function extractProbabilities(classes: HiveClass[]) {
  let aiProbability: number | null = null
  let deepfakeProbability: number | null = null

  for (const c of classes) {
    const norm = normalize(c.class)
    const score = Math.round(c.score * 1000) / 10

    if (DEEPFAKE_KEYWORDS.includes(norm)) {
      deepfakeProbability = Math.max(deepfakeProbability ?? 0, score)
    } else if (AI_GEN_KEYWORDS.includes(norm)) {
      aiProbability = Math.max(aiProbability ?? 0, score)
    }
  }

  // Fallback: some Hive tasks return a single generic binary classifier
  // (yes/no, fake/real) rather than a distinct AI-generation head. Only use
  // it if we didn't already find a more specific signal.
  if (aiProbability === null && deepfakeProbability === null) {
    for (const c of classes) {
      const norm = normalize(c.class)
      const score = Math.round(c.score * 1000) / 10
      if (GENERIC_FAKE_KEYWORDS.includes(norm)) {
        aiProbability = Math.max(aiProbability ?? 0, score)
      } else if (GENERIC_AUTHENTIC_KEYWORDS.includes(norm)) {
        aiProbability = Math.max(aiProbability ?? 0, 100 - score)
      }
    }
  }

  return { aiProbability, deepfakeProbability }
}

function extractC2pa(hiveResult: Record<string, unknown>) {
  const candidates: unknown[] = [
    (hiveResult as Record<string, unknown>)?.c2pa,
    (hiveResult as Record<string, unknown>)?.content_credentials,
    (hiveResult as Record<string, unknown>)?.provenance,
    (hiveResult as { status?: { response?: Record<string, unknown> } })?.status?.response?.c2pa,
  ]

  const data = candidates.find((c) => c && typeof c === 'object' && Object.keys(c as object).length > 0) as
    | Record<string, unknown>
    | undefined

  if (!data) {
    return { present: false, valid: null as boolean | null, data: null as Record<string, unknown> | null }
  }

  const validField = data.valid ?? data.signature_valid ?? data.is_valid ?? data.signatureValid
  const valid = typeof validField === 'boolean' ? validField : typeof validField === 'string' ? /valid/i.test(validField) && !/invalid/i.test(validField) : null

  return { present: true, valid, data }
}

async function callHuggingFace(model: string, imageBuffer: ArrayBuffer, apiKey: string): Promise<Response> {
  return fetch(`https://api-inference.huggingface.co/models/${model}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/octet-stream',
    },
    body: imageBuffer,
  })
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { file_url, file_type, file_name, user_id } = await req.json()

    if (!file_url || !file_type || !user_id) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Check daily limit
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const { count } = await supabase
      .from('usage_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user_id)
      .eq('module', 'eyes')
      .gte('created_at', today.toISOString())

    if ((count || 0) >= DAILY_LIMIT) {
      return new Response(
        JSON.stringify({ error: 'Daily scan limit reached. Upgrade to Pro for unlimited scans.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let confidenceScore = 50
    let result: 'authentic' | 'fake' | 'uncertain' = 'uncertain'
    let analysisSucceeded = false
    let hiveResult: Record<string, unknown> = {}
    let hfResult: HFLabel[] | null = null
    let aiProbability: number | null = null
    let deepfakeProbability: number | null = null
    let attribution: { model: string; confidence: number } | null = null
    let attributionCandidates: { model: string; confidence: number }[] = []
    let c2pa = { present: false, valid: null as boolean | null, data: null as Record<string, unknown> | null }

    // ── HIVE AI (primary — key stored as HIVE_API_KEY) ────────────
    const hiveApiKey = Deno.env.get('HIVE_API_KEY') ?? ''
    if (hiveApiKey) {
      try {
        const hiveResponse = await fetch('https://api.thehive.ai/api/v2/task/sync', {
          method: 'POST',
          headers: {
            'Authorization': `token ${hiveApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url: file_url }),
        })

        if (hiveResponse.ok) {
          hiveResult = await hiveResponse.json() as Record<string, unknown>

          const classes = collectClasses(hiveResult)
          const probabilities = extractProbabilities(classes)
          aiProbability = probabilities.aiProbability
          deepfakeProbability = probabilities.deepfakeProbability

          const attributionResult = extractAttribution(classes)
          attribution = attributionResult.top
          attributionCandidates = attributionResult.candidates

          c2pa = extractC2pa(hiveResult)

          const primaryScore = aiProbability ?? deepfakeProbability
          if (primaryScore !== null) {
            confidenceScore = primaryScore
            if (confidenceScore >= 70) result = 'fake'
            else if (confidenceScore >= 40) result = 'uncertain'
            else {
              result = 'authentic'
              confidenceScore = 100 - confidenceScore
            }
            analysisSucceeded = true
          }
        }
      } catch (hiveError) {
        console.error('Hive API error:', hiveError)
      }
    }

    // ── HUGGINGFACE (fallback — key stored as HF_API_KEY) ──────────
    if (!analysisSucceeded) {
      const hfApiKey = Deno.env.get('HF_API_KEY') ?? ''
      if (hfApiKey) {
        try {
          const imageResponse = await fetch(file_url)
          if (imageResponse.ok) {
            const imageBuffer = await imageResponse.arrayBuffer()
            let hfResponse = await callHuggingFace('Wvolf/ViT_Deepfake_Detection', imageBuffer, hfApiKey)
            if (hfResponse.status === 503) {
              await new Promise((resolve) => setTimeout(resolve, 8000))
              hfResponse = await callHuggingFace('Wvolf/ViT_Deepfake_Detection', imageBuffer, hfApiKey)
            }
            if (hfResponse.ok) {
              hfResult = await hfResponse.json() as HFLabel[]
            } else {
              const fallback = await callHuggingFace('prithivMLmods/Deep-Fake-Detector-v2-Model', imageBuffer, hfApiKey)
              if (fallback.ok) hfResult = await fallback.json() as HFLabel[]
            }
            if (hfResult && Array.isArray(hfResult)) {
              const fakeEntry = hfResult.find((item) => item.label.toLowerCase().includes('fake') || item.label.toLowerCase().includes('deepfake'))
              const realEntry = hfResult.find((item) => item.label.toLowerCase().includes('real') || item.label.toLowerCase().includes('authentic'))
              const fakeLikelihood = fakeEntry
                ? Math.round(fakeEntry.score * 100)
                : realEntry
                ? 100 - Math.round(realEntry.score * 100)
                : null

              if (fakeLikelihood !== null) {
                aiProbability = fakeLikelihood
                confidenceScore = fakeLikelihood
                if (confidenceScore >= 70) result = 'fake'
                else if (confidenceScore >= 40) result = 'uncertain'
                else {
                  result = 'authentic'
                  confidenceScore = 100 - confidenceScore
                }
              }
            }
          }
        } catch (hfError) {
          console.error('HuggingFace API error:', hfError)
        }
      }
    }

    // Structured evidence for the explanation model. This is the only
    // input it receives — it explains these facts, it does not calculate
    // or invent new ones (e.g. it must never guess a generator when
    // model_attribution.model is null).
    const evidence = {
      ai_probability: aiProbability !== null ? aiProbability / 100 : null,
      deepfake_probability: deepfakeProbability !== null ? deepfakeProbability / 100 : null,
      c2pa_present: c2pa.present,
      c2pa_valid: c2pa.valid,
      watermark: { type: null, status: 'not_checked' },
      model_attribution: attribution
        ? { model: attribution.model, confidence: attribution.confidence / 100, source: 'hive' }
        : { model: null, confidence: null, source: null },
    }

    // Generate explanation via Claude
    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY') ?? ''
    let explanation = 'Analysis complete. Review the confidence score for details.'

    try {
      const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': anthropicKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 250,
          messages: [
            {
              role: 'user',
              content: `You are a deepfake and synthetic-media forensic analyst. You are given structured evidence only — do not add facts beyond it, and never name a generator unless model_attribution.model is non-null.

File type: ${file_type}
Overall verdict: ${result} (${Math.round(confidenceScore)}%)
Evidence: ${JSON.stringify(evidence)}

Write a clear, 2-4 sentence forensic-style explanation for the user covering: the verdict and confidence, whether C2PA provenance was found and valid (only if c2pa_present is true), and generator attribution (state "Generator attribution unavailable" if model_attribution.model is null, otherwise name the model and its confidence). Do not use em dashes. Do not use hedging language.`,
            },
          ],
        }),
      })

      if (claudeResponse.ok) {
        const claudeData = await claudeResponse.json() as { content?: Array<{ text?: string }> }
        explanation = claudeData.content?.[0]?.text || explanation
      }
    } catch (claudeError) {
      console.error('Claude API error:', claudeError)
    }

    const { data: scan, error: dbError } = await supabase
      .from('eyes_scans')
      .insert({
        user_id,
        file_name: file_name || 'uploaded_file',
        file_type,
        file_url,
        result,
        confidence_score: confidenceScore,
        explanation,
        hive_raw: Object.keys(hiveResult).length > 0 ? hiveResult : hfResult ? { huggingface: hfResult } : {},
        ai_probability: aiProbability,
        deepfake_probability: deepfakeProbability,
        c2pa_present: c2pa.present,
        c2pa_valid: c2pa.valid,
        c2pa_data: c2pa.data,
        model_attribution: {
          model: attribution?.model ?? null,
          confidence: attribution?.confidence ?? null,
          source: attribution ? 'hive' : null,
          candidates: attributionCandidates,
        },
        watermark: { type: null, status: 'not_checked' },
      })
      .select()
      .single()

    if (dbError) throw dbError

    await supabase.from('usage_logs').insert({
      user_id,
      module: 'eyes',
      action: 'scan',
    })

    return new Response(JSON.stringify({ scan }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('eyes-analyze error:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
