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
    const { file_url, file_name, user_id } = await req.json()

    if (!file_url || !user_id) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const { count } = await supabase
      .from('usage_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user_id)
      .eq('module', 'voice')
      .gte('created_at', today.toISOString())

    if ((count || 0) >= DAILY_LIMIT) {
      return new Response(
        JSON.stringify({ error: 'Daily voice scan limit reached. Upgrade to Pro for more scans.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Detect file format from name/url for context
    const nameLower = (file_name || file_url).toLowerCase()
    const format = nameLower.endsWith('.mp3') ? 'MP3'
      : nameLower.endsWith('.wav') ? 'WAV'
      : nameLower.endsWith('.ogg') ? 'OGG'
      : nameLower.endsWith('.m4a') ? 'M4A'
      : nameLower.endsWith('.aac') ? 'AAC'
      : nameLower.endsWith('.flac') ? 'FLAC'
      : 'audio'

    // Analyze with Hive if available (for audio deepfake detection)
    const hiveApiKey = Deno.env.get('HIVE_API_KEY') ?? ''
    let hiveResult: Record<string, unknown> = {}
    let rawManipulationScore = 50

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
          const output = (hiveResult as { status?: { response?: { output?: Array<{ classes?: Array<{ class: string; score: number }> }> } } })
            ?.status?.response?.output
          if (output && Array.isArray(output) && output.length > 0) {
            const classes = output[0]?.classes || []
            const fakeClass = classes.find((c: { class: string }) =>
              c.class === 'yes' || c.class === 'fake' || c.class === 'ai_generated'
            )
            if (fakeClass) rawManipulationScore = Math.round(fakeClass.score * 100)
          }
        }
      } catch (_) {}
    }

    const geminiKey = Deno.env.get('GEMINI_API_KEY') ?? ''
    let manipulationProbability = rawManipulationScore
    let cloneIndicators: string[] = []
    let emotionalManipulationScore = 0
    let verdict = 'uncertain'
    let dayeAnalysis = ''

    try {
      const geminiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    text: `You are DAYE, Doberman Intelligence voice analysis system. A voice audio file has been submitted for AI/deepfake detection analysis.

File: ${file_name || 'audio file'} (${format} format)
Hive AI manipulation score: ${rawManipulationScore}% (0=authentic, 100=AI-generated)

Based on this data, provide a voice intelligence assessment. Respond ONLY in valid JSON:
{
  "manipulation_probability": <0-100 integer>,
  "clone_indicators": [<array of up to 4 specific voice clone/AI indicators as short strings, or empty if likely authentic>],
  "emotional_manipulation_score": <0-100 integer, how much this audio is designed to manipulate emotions>,
  "verdict": "<authentic|likely_authentic|uncertain|likely_ai|certain_ai>",
  "daye_analysis": "<2-3 sentence intelligence brief from DAYE to the Operator about this voice file. Reference specific findings.>"
}`,
                  },
                ],
              },
            ],
            generationConfig: { maxOutputTokens: 400, responseMimeType: 'application/json' },
          }),
        }
      )

      if (geminiResponse.ok) {
        const cd = await geminiResponse.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> }
        const text = cd.candidates?.[0]?.content?.parts?.[0]?.text || ''
        const jsonMatch = text.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0])
          manipulationProbability = typeof parsed.manipulation_probability === 'number' ? parsed.manipulation_probability : rawManipulationScore
          cloneIndicators = Array.isArray(parsed.clone_indicators) ? parsed.clone_indicators : []
          emotionalManipulationScore = typeof parsed.emotional_manipulation_score === 'number' ? parsed.emotional_manipulation_score : 0
          verdict = parsed.verdict || 'uncertain'
          dayeAnalysis = parsed.daye_analysis || ''
        }
      }
    } catch (_) {}

    if (!dayeAnalysis) {
      dayeAnalysis = manipulationProbability >= 70
        ? `Operator, this voice file shows strong AI generation markers. The probability of synthetic voice cloning is ${manipulationProbability}%. Treat this audio as untrusted.`
        : `Operator, voice analysis complete with ${manipulationProbability}% manipulation probability. ${manipulationProbability < 30 ? 'Audio appears authentic.' : 'Moderate risk indicators present - verify the source.'}`
    }

    const trustScore = Math.max(0, 100 - manipulationProbability)

    const { data: scan, error: dbError } = await supabase
      .from('voice_scans')
      .insert({
        user_id,
        file_name: file_name || 'voice_file',
        file_url,
        manipulation_probability: manipulationProbability,
        clone_indicators: cloneIndicators,
        emotional_manipulation_score: emotionalManipulationScore,
        verdict,
        daye_analysis: dayeAnalysis,
        trust_score: trustScore,
      })
      .select()
      .single()

    if (dbError) throw dbError

    await supabase.from('usage_logs').insert({ user_id, module: 'voice', action: 'scan' })

    return new Response(JSON.stringify({ scan }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('voice-analyze error:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
