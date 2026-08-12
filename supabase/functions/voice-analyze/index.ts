import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

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


    // Detect file format from name/url for context
    const nameLower = (file_name || file_url).toLowerCase()
    const format = nameLower.endsWith('.mp3') ? 'MP3'
      : nameLower.endsWith('.wav') ? 'WAV'
      : nameLower.endsWith('.ogg') ? 'OGG'
      : nameLower.endsWith('.m4a') ? 'M4A'
      : nameLower.endsWith('.aac') ? 'AAC'
      : nameLower.endsWith('.flac') ? 'FLAC'
      : 'audio'

    // Analyze with Hive's v3 AI-generated/deepfake model, which also scores
    // an audio track (ai_generated_audio / not_ai_generated_audio classes) —
    // see supabase/functions/eyes-analyze for the same endpoint used on images.
    const hiveApiKey = Deno.env.get('HIVE_API_KEY') ?? ''
    let hiveResult: Record<string, unknown> = {}
    let rawManipulationScore = 50
    let hiveSucceeded = false

    if (hiveApiKey) {
      try {
        const hiveResponse = await fetch(
          'https://api.thehive.ai/api/v3/hive/ai-generated-and-deepfake-content-detection',
          {
            method: 'POST',
            headers: {
              'authorization': `Bearer ${hiveApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ media_metadata: true, input: [{ media_url: file_url }] }),
          }
        )

        if (hiveResponse.ok) {
          hiveResult = await hiveResponse.json() as Record<string, unknown>
          const output = (hiveResult as { output?: Array<{ classes?: Array<{ class: string; value: number }> }> })?.output
          const classes = output?.flatMap((o) => o?.classes || []) || []
          const audioClass = classes.find((c) => c.class === 'ai_generated_audio')
          const notAudioClass = classes.find((c) => c.class === 'not_ai_generated_audio')
          if (audioClass) {
            rawManipulationScore = Math.round(audioClass.value * 100)
            hiveSucceeded = true
          } else if (notAudioClass) {
            rawManipulationScore = Math.round((1 - notAudioClass.value) * 100)
            hiveSucceeded = true
          } else {
            console.error('Hive API returned 200 but no audio class labels:', JSON.stringify(hiveResult).slice(0, 500))
          }
        } else {
          console.error('Hive API non-OK response:', hiveResponse.status, await hiveResponse.text())
        }
      } catch (hiveError) {
        console.error('Hive API error:', hiveError)
      }
    }

    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY') ?? ''
    const geminiKey = Deno.env.get('GEMINI_API_KEY') ?? ''
    let manipulationProbability = rawManipulationScore
    let cloneIndicators: string[] = []
    let emotionalManipulationScore = 0
    let verdict = 'uncertain'
    let dayeAnalysis = ''

    const analysisPrompt = `You are DAYE, Doberman Intelligence voice analysis system. A voice audio file has been submitted for AI/deepfake detection analysis.

File: ${file_name || 'audio file'} (${format} format)
Hive AI manipulation score: ${hiveSucceeded ? `${rawManipulationScore}% (0=authentic, 100=AI-generated)` : 'unavailable — the live detector could not be reached, so no measured score exists. Do not invent one.'}

Based on this data, provide a voice intelligence assessment. Respond ONLY in valid JSON:
{
  "manipulation_probability": <0-100 integer>,
  "clone_indicators": [<array of up to 4 specific voice clone/AI indicators as short strings, or empty if likely authentic>],
  "emotional_manipulation_score": <0-100 integer, how much this audio is designed to manipulate emotions>,
  "verdict": "<authentic|likely_authentic|uncertain|likely_ai|certain_ai>",
  "daye_analysis": "<2-3 sentence intelligence brief from DAYE to the Operator about this voice file. Reference specific findings.>"
}`

    function applyParsedAnalysis(text: string): boolean {
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) return false
      const parsed = JSON.parse(jsonMatch[0])
      manipulationProbability = typeof parsed.manipulation_probability === 'number' ? parsed.manipulation_probability : rawManipulationScore
      cloneIndicators = Array.isArray(parsed.clone_indicators) ? parsed.clone_indicators : []
      emotionalManipulationScore = typeof parsed.emotional_manipulation_score === 'number' ? parsed.emotional_manipulation_score : 0
      verdict = parsed.verdict || 'uncertain'
      dayeAnalysis = parsed.daye_analysis || ''
      return true
    }

    let analysisGenerated = false

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
            max_tokens: 400,
            messages: [{ role: 'user', content: analysisPrompt }],
          }),
        })

        if (claudeResponse.ok) {
          const cd = await claudeResponse.json() as { content?: Array<{ text?: string }> }
          analysisGenerated = applyParsedAnalysis(cd.content?.[0]?.text || '')
        }
      } catch (claudeError) {
        console.error('Claude API error:', claudeError)
      }
    }

    if (!analysisGenerated && geminiKey) {
      try {
        const geminiResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: analysisPrompt }] }],
              generationConfig: { maxOutputTokens: 400, responseMimeType: 'application/json' },
            }),
          }
        )

        if (geminiResponse.ok) {
          const gd = await geminiResponse.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> }
          applyParsedAnalysis(gd.candidates?.[0]?.content?.parts?.[0]?.text || '')
        } else {
          console.error('Gemini API non-OK response:', geminiResponse.status, await geminiResponse.text())
        }
      } catch (geminiError) {
        console.error('Gemini API error:', geminiError)
      }
    }

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
