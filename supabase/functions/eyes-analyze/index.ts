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
            let hfResult: HFLabel[] | null = null
            if (hfResponse.ok) {
              hfResult = await hfResponse.json() as HFLabel[]
            } else {
              const fallback = await callHuggingFace('prithivMLmods/Deep-Fake-Detector-v2-Model', imageBuffer, hfApiKey)
              if (fallback.ok) hfResult = await fallback.json() as HFLabel[]
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
              }
            }
          }
        } catch (hfError) {
          console.error('HuggingFace API error:', hfError)
        }
      }
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
          max_tokens: 200,
          messages: [
            {
              role: 'user',
              content: `You are a deepfake detection expert. AI analysis result: result="${result}", confidence=${confidenceScore}%. File type: ${file_type}.
Write a clear 2-3 sentence explanation for the user. Be direct and specific. Do not use em dashes.`,
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
