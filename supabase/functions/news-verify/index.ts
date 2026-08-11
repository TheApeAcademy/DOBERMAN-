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
    const { content, user_id } = await req.json()

    if (!content || !user_id) {
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
      .eq('module', 'news')
      .gte('created_at', today.toISOString())

    if ((count || 0) >= DAILY_LIMIT) {
      return new Response(
        JSON.stringify({ error: 'Daily verification limit reached. Upgrade to Pro for more verifications.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const geminiKey = Deno.env.get('GEMINI_API_KEY') ?? ''

    const prompt = `You are DOBERMAN's News Verification Analyst. A senior journalist with 20 years of fact-checking experience and deep knowledge of misinformation tactics.

Analyze this claim or article for credibility:
"${content}"

Be rigorous. Look for:
- Emotional manipulation language
- Missing sources or vague attribution
- Claims that contradict known facts
- Sensationalist framing
- Known misinformation patterns

Return ONLY valid JSON. No extra text. No markdown:
{
  "credibility_score": <number 0-100>,
  "verdict": "<CREDIBLE|MISLEADING|LIKELY_FALSE|UNVERIFIABLE>",
  "summary": "<2-3 sentence plain English verdict>",
  "red_flags": ["<flag 1>", "<flag 2>"],
  "positive_signals": ["<signal 1>"],
  "source_quality": "<HIGH|MEDIUM|LOW|UNKNOWN>",
  "recommendation": "<one concrete action the user should take>"
}`

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 1000, responseMimeType: 'application/json' },
        }),
      }
    )

    if (!geminiResponse.ok) {
      throw new Error(`Gemini API error: ${geminiResponse.status}`)
    }

    const geminiData = await geminiResponse.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> }
    const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || ''

    let result: {
      credibility_score: number
      verdict: string
      summary: string
      red_flags: string[]
      positive_signals: string[]
      source_quality: string
      recommendation: string
    }

    try {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error('No JSON found in response')
      result = JSON.parse(jsonMatch[0])
    } catch {
      throw new Error('Failed to parse analysis results. Please try again.')
    }

    const { error: dbError } = await supabase
      .from('news_checks')
      .insert({
        user_id,
        content,
        credibility_score: result.credibility_score,
        verdict: result.verdict,
        summary: result.summary,
        red_flags: result.red_flags,
        positive_signals: result.positive_signals,
        source_quality: result.source_quality,
        recommendation: result.recommendation,
      })

    if (dbError) throw dbError

    await supabase.from('usage_logs').insert({
      user_id,
      module: 'news',
      action: 'verify',
    })

    return new Response(JSON.stringify({ result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('news-verify error:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
