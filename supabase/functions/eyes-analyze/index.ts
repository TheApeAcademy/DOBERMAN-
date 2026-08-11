import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const DAILY_LIMIT = 3

type HFLabel = { label: string; score: number }

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
    let hfResult: HFLabel[] | null = null

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
          type HiveOutput = { status?: { response?: { output?: Array<{ classes?: Array<{ class: string; score: number }> }> } } }
          const hiveData = await hiveResponse.json() as HiveOutput
          const output = hiveData?.status?.response?.output
          if (output && Array.isArray(output) && output.length > 0) {
            const classes = output[0]?.classes || []
            const fakeClass = classes.find((c) => c.class === 'yes' || c.class === 'fake' || c.class === 'deepfake')
            const realClass = classes.find((c) => c.class === 'no' || c.class === 'real' || c.class === 'authentic')
            if (fakeClass) {
              confidenceScore = Math.round(fakeClass.score * 100)
              if (confidenceScore >= 70) result = 'fake'
              else if (confidenceScore >= 40) result = 'uncertain'
              else { result = 'authentic'; confidenceScore = 100 - confidenceScore }
              analysisSucceeded = true
            } else if (realClass) {
              const realScore = Math.round(realClass.score * 100)
              if (realScore >= 70) { result = 'authentic'; confidenceScore = realScore }
              else if (realScore >= 40) { result = 'uncertain'; confidenceScore = 100 - realScore }
              else { result = 'fake'; confidenceScore = 100 - realScore }
              analysisSucceeded = true
            }
          } else {
            console.error('Hive API returned 200 but no usable output field:', JSON.stringify(hiveData).slice(0, 500))
          }
        } else {
          const bodyText = await hiveResponse.text()
          console.error(`Hive API non-OK response: status=${hiveResponse.status}`, bodyText.slice(0, 500))
        }
      } catch (hiveError) {
        console.error('Hive API error:', hiveError)
      }
    } else {
      console.error('HIVE_API_KEY is empty or not set')
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
              const primaryBody = await hfResponse.text()
              console.error(`HuggingFace primary model non-OK: status=${hfResponse.status}`, primaryBody.slice(0, 500))
              const fallback = await callHuggingFace('prithivMLmods/Deep-Fake-Detector-v2-Model', imageBuffer, hfApiKey)
              if (fallback.ok) {
                hfResult = await fallback.json() as HFLabel[]
              } else {
                const fallbackBody = await fallback.text()
                console.error(`HuggingFace fallback model non-OK: status=${fallback.status}`, fallbackBody.slice(0, 500))
              }
            }
            if (hfResult && Array.isArray(hfResult)) {
              const fakeEntry = hfResult.find((item) => item.label.toLowerCase().includes('fake') || item.label.toLowerCase().includes('deepfake'))
              const realEntry = hfResult.find((item) => item.label.toLowerCase().includes('real') || item.label.toLowerCase().includes('authentic'))
              if (fakeEntry) {
                confidenceScore = Math.round(fakeEntry.score * 100)
                if (confidenceScore >= 70) result = 'fake'
                else if (confidenceScore >= 40) result = 'uncertain'
                else { result = 'authentic'; confidenceScore = 100 - confidenceScore }
              } else if (realEntry) {
                const realScore = Math.round(realEntry.score * 100)
                if (realScore >= 70) { result = 'authentic'; confidenceScore = realScore }
                else if (realScore >= 40) { result = 'uncertain'; confidenceScore = 100 - realScore }
                else { result = 'fake'; confidenceScore = 100 - realScore }
              } else {
                console.error('HuggingFace returned labels that matched neither fake nor real patterns:', JSON.stringify(hfResult).slice(0, 500))
              }
            } else if (hfResult) {
              console.error('HuggingFace result was not an array:', JSON.stringify(hfResult).slice(0, 500))
            }
          } else {
            console.error(`Could not fetch source file for HF analysis: status=${imageResponse.status}`, file_url)
          }
        } catch (hfError) {
          console.error('HuggingFace API error:', hfError)
        }
      } else {
        console.error('HF_API_KEY is empty or not set')
      }
    }

    // Generate explanation via Gemini
    const geminiKey = Deno.env.get('GEMINI_API_KEY') ?? ''
    let explanation = 'Analysis complete. Review the confidence score for details.'

    try {
      const geminiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    text: `You are a deepfake detection expert. AI analysis result: result="${result}", confidence=${confidenceScore}%. File type: ${file_type}.
Write a clear 2-3 sentence explanation for the user. Be direct and specific. Do not use em dashes.`,
                  },
                ],
              },
            ],
            generationConfig: { maxOutputTokens: 200 },
          }),
        }
      )

      if (geminiResponse.ok) {
        const geminiData = await geminiResponse.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> }
        explanation = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || explanation
      } else {
        const geminiBody = await geminiResponse.text()
        console.error(`Gemini API non-OK response: status=${geminiResponse.status}`, geminiBody.slice(0, 500))
      }
    } catch (geminiError) {
      console.error('Gemini API error:', geminiError)
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
        hive_raw: hfResult,
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
