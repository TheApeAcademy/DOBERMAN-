import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const DAILY_LIMIT = 3

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

    // Route to the correct Hive endpoint by file type
    type HiveClass = { class: string; score: number }
    type HiveOutput = { classes?: HiveClass[] }
    type HiveStatus = { response?: { output?: HiveOutput[] } }

    const isAudio = file_type === 'audio'
    const hiveApiKey = Deno.env.get('HIVE_API_KEY') ?? ''
    const hiveEndpoint = isAudio
      ? 'https://api.thehive.ai/api/v2/task/ai-generated-audio-detection'
      : 'https://api.thehive.ai/api/v2/task/ai-generated-and-deepfake-content-detection'

    let hiveResult: Record<string, unknown> = {}
    let confidenceScore = 50
    let result: 'authentic' | 'fake' | 'uncertain' = 'uncertain'

    try {
      const hiveResponse = await fetch(hiveEndpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${hiveApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: file_url }),
      })

      if (hiveResponse.ok) {
        hiveResult = await hiveResponse.json() as Record<string, unknown>

        const statusArr = (hiveResult as { status?: HiveStatus[] })?.status
        const output = Array.isArray(statusArr) ? statusArr[0]?.response?.output : undefined

        if (output && Array.isArray(output) && output.length > 0) {
          // Aggregate fake score across all frames (videos return one per frame)
          let totalFakeScore = 0
          let frameCount = 0
          for (const frame of output) {
            const classes = frame?.classes || []
            // Audio: ai_generated_audio | Image/Video: ai_generated, ai_generated_visual, yes_deepfake
            const fakeClass = classes.find((c: HiveClass) =>
              c.class === 'ai_generated_audio' ||
              c.class === 'ai_generated' ||
              c.class === 'ai_generated_visual' ||
              c.class === 'yes_deepfake'
            )
            if (fakeClass !== undefined) {
              totalFakeScore += fakeClass.score
              frameCount++
            }
          }
          if (frameCount > 0) {
            const avgFakeScore = totalFakeScore / frameCount
            confidenceScore = Math.round(avgFakeScore * 100)
            if (confidenceScore >= 70) result = 'fake'
            else if (confidenceScore >= 40) result = 'uncertain'
            else {
              result = 'authentic'
              confidenceScore = 100 - confidenceScore
            }
          }
        }
      }
    } catch (hiveError) {
      console.error('Hive API error:', hiveError)
    }

    // Call Claude to generate explanation
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
              content: `You are a deepfake detection expert. The AI media analysis returned: result="${result}", confidence=${confidenceScore}%.
File type: ${file_type}.
Write a clear, 2-3 sentence explanation of what this means for the user. Be direct and specific. Do not use em dashes. Do not use hedging language.`,
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

    // Save to database
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
        hive_raw: hiveResult,
      })
      .select()
      .single()

    if (dbError) throw dbError

    // Log usage
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
