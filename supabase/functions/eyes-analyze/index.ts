import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const HIVE_ENDPOINT = 'https://api.thehive.ai/api/v3/hive/ai-generated-and-deepfake-content-detection'

type HFLabel = { label: string; score: number }
type HiveClass = { class: string; value: number }
type HiveOutput = { extra?: { name: string; value: number }[]; classes?: HiveClass[] }

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

function normalize(key: string): string {
  return key.toLowerCase().replace(/[^a-z0-9]/g, '')
}

function collectClasses(hiveResult: Record<string, unknown>): HiveClass[] {
  const output = (hiveResult as { output?: HiveOutput[] })?.output
  if (!Array.isArray(output)) return []
  return output.flatMap((o) => o?.classes || [])
}

function extractAttribution(classes: HiveClass[]) {
  const candidates = classes
    .map((c) => {
      const norm = normalize(c.class)
      const display = GENERATOR_KEYWORDS[norm]
      return display ? { model: display, confidence: Math.round(c.value * 1000) / 10 } : null
    })
    .filter((c): c is { model: string; confidence: number } => c !== null)
    .sort((a, b) => b.confidence - a.confidence)

  // Always surface the best guess if Hive returned one at all — the
  // frontend labels anything below its own confidence bar as "low
  // confidence" rather than hiding it outright.
  const top = candidates.length > 0 ? candidates[0] : null

  return { top, candidates: candidates.slice(0, 4) }
}

// All classes Hive returned above a noise floor, sorted by score — gives
// the explanation model (and the UI's technical panel) real named signals
// to point to instead of just the two aggregate probabilities.
function extractTopSignals(classes: HiveClass[], limit = 8) {
  return classes
    .map((c) => ({ class: c.class, value: Math.round(c.value * 1000) / 10 }))
    .filter((c) => c.value >= 1)
    .sort((a, b) => b.value - a.value)
    .slice(0, limit)
}

function extractProbabilities(classes: HiveClass[]) {
  let aiProbability: number | null = null
  let deepfakeProbability: number | null = null

  for (const c of classes) {
    const norm = normalize(c.class)
    const value = Math.round(c.value * 1000) / 10

    // Mutually-exclusive heads: "ai_generated" (visual) and
    // "ai_generated_audio" (audio track) each sum to 1 with their
    // "not_*" counterpart, so we only need the positive class's value.
    if (norm === 'aigenerated' || norm === 'aigeneratedaudio') {
      aiProbability = Math.max(aiProbability ?? 0, value)
    } else if (norm === 'deepfake') {
      deepfakeProbability = Math.max(deepfakeProbability ?? 0, value)
    }
  }

  return { aiProbability, deepfakeProbability }
}

function extractC2pa(hiveResult: Record<string, unknown>) {
  const candidates: unknown[] = [
    hiveResult?.c2pa,
    hiveResult?.content_credentials,
    hiveResult?.provenance,
    (hiveResult?.metadata as Record<string, unknown> | undefined)?.c2pa,
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
  return fetch(`https://router.huggingface.co/hf-inference/models/${model}`, {
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

    let confidenceScore = 50
    let result: 'authentic' | 'fake' | 'uncertain' = 'uncertain'
    let analysisSucceeded = false
    let hiveResult: Record<string, unknown> = {}
    let hfResult: HFLabel[] | null = null
    let aiProbability: number | null = null
    let deepfakeProbability: number | null = null
    let attribution: { model: string; confidence: number } | null = null
    let attributionCandidates: { model: string; confidence: number }[] = []
    let topSignals: { class: string; value: number }[] = []
    let c2pa = { present: false, valid: null as boolean | null, data: null as Record<string, unknown> | null }

    // ── HIVE AI (primary — V3 Playground key, stored as HIVE_API_KEY) ──
    const hiveApiKey = Deno.env.get('HIVE_API_KEY') ?? ''
    if (hiveApiKey) {
      try {
        const hiveResponse = await fetch(HIVE_ENDPOINT, {
          method: 'POST',
          headers: {
            'authorization': `Bearer ${hiveApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            media_metadata: true,
            input: [{ media_url: file_url }],
          }),
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
          topSignals = extractTopSignals(classes)

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
        } else {
          console.error('Hive API non-ok response:', hiveResponse.status, await hiveResponse.text())
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
    // model_attribution.model is null, and must never invent a named
    // signal that isn't in top_signals).
    const evidence = {
      ai_probability: aiProbability !== null ? aiProbability / 100 : null,
      deepfake_probability: deepfakeProbability !== null ? deepfakeProbability / 100 : null,
      c2pa_present: c2pa.present,
      c2pa_valid: c2pa.valid,
      watermark: { type: null, status: 'not_checked' },
      model_attribution: attribution
        ? { model: attribution.model, confidence: attribution.confidence / 100, source: 'hive' }
        : { model: null, confidence: null, source: null },
      other_attribution_candidates: attributionCandidates.slice(1).map((c) => ({ model: c.model, confidence: c.confidence / 100 })),
      // Named detector signals Hive returned (class name + score 0-100),
      // strongest first. Not all of these are meaningful — only cite ones
      // that are actually high or that materially explain the verdict.
      top_signals: topSignals,
    }

    // Generate explanation via Claude, falling back to Gemini if no
    // ANTHROPIC_API_KEY is configured on this project.
    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY') ?? ''
    const geminiKey = Deno.env.get('GEMINI_API_KEY') ?? ''
    let explanation = 'Analysis complete. Review the confidence score for details.'

    const explanationPrompt = `You are a deepfake and synthetic-media forensic analyst. You are given structured evidence only — do not add facts beyond it, never name a generator unless model_attribution.model is non-null, and never cite a named signal that isn't in top_signals or other_attribution_candidates.

File type: ${file_type}
Overall verdict: ${result} (${Math.round(confidenceScore)}%)
Evidence: ${JSON.stringify(evidence)}

Write a clear, 3-5 sentence forensic-style explanation for the user covering, in order:
1. The verdict and confidence.
2. The one or two specific top_signals that most explain the score (name the signal and its %, e.g. "the diffusion-model signal scored 82%") — skip this if top_signals is empty.
3. Whether C2PA provenance was found and valid (only mention this if c2pa_present is true).
4. Generator attribution: if model_attribution.model is null, say "Generator attribution unavailable." If it's non-null but confidence is below 0.15, phrase it as a tentative, low-confidence guess (e.g. "there is a weak signal suggesting..."). If confidence is 0.15 or above, state it plainly. Mention other_attribution_candidates only if there is more than one and they are worth noting as alternates.

Do not use em dashes. Do not use hedging language beyond what's called for in step 4.`

    let explanationGenerated = false

    if (anthropicKey) {
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
            messages: [{ role: 'user', content: explanationPrompt }],
          }),
        })

        if (claudeResponse.ok) {
          const claudeData = await claudeResponse.json() as { content?: Array<{ text?: string }> }
          explanation = claudeData.content?.[0]?.text || explanation
          explanationGenerated = true
        }
      } catch (claudeError) {
        console.error('Claude API error:', claudeError)
      }
    }

    if (!explanationGenerated && geminiKey) {
      try {
        const geminiResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: explanationPrompt }] }],
              generationConfig: { maxOutputTokens: 250 },
            }),
          }
        )

        if (geminiResponse.ok) {
          const geminiData = await geminiResponse.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> }
          explanation = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || explanation
        } else {
          console.error('Gemini API non-OK response:', geminiResponse.status, await geminiResponse.text())
        }
      } catch (geminiError) {
        console.error('Gemini API error:', geminiError)
      }
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
