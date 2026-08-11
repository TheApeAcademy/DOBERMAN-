import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const DAILY_LIMIT = 5
const MAX_CONTENT_LENGTH = 8000

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { content, user_id } = await req.json()

    if (!content || typeof content !== 'string' || !content.trim() || !user_id) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const trimmedContent = content.trim()
    const wordCount = trimmedContent.split(/\s+/).filter(Boolean).length

    if (wordCount < 20) {
      return new Response(JSON.stringify({ error: 'Need at least 20 words for a reliable read — short snippets don\'t carry enough signal.' }), {
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
      .eq('module', 'text')
      .gte('created_at', today.toISOString())

    if ((count || 0) >= DAILY_LIMIT) {
      return new Response(
        JSON.stringify({ error: 'Daily scan limit reached. Upgrade to Pro for more scans.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const analysisText = trimmedContent.slice(0, MAX_CONTENT_LENGTH)

    const prompt = `You are a forensic linguist specializing in AI-generated text detection. Analyze the following text for signs it was written by an LLM rather than a human.

Look for real signals, not vibes:
- Statistical uniformity: unusually even sentence length and rhythm, low burstiness
- Predictable, "safe" word choices with low perplexity (an LLM tends toward the statistically expected next word)
- Structural tells: formulaic paragraph openers, excessive hedging ("it's important to note", "in today's world"), overuse of transition words, tricolon lists, summary-then-elaborate patterns
- Absence of genuine idiosyncrasy: no typos, no odd tangents, no inconsistent voice, no specific unverifiable personal detail
- Conversely: real human markers like irregular rhythm, genuine specificity, inconsistent register, typos, or a distinctive personal voice push toward human-written

Text to analyze (${wordCount} words):
"""
${analysisText}
"""

Return ONLY valid JSON, no markdown, no extra text:
{
  "ai_probability": <integer 0-100, probability this was AI-generated>,
  "verdict": "<human|likely_human|uncertain|likely_ai|ai_generated>",
  "signals": [<3-6 short strings naming the SPECIFIC signals you actually found in THIS text, not generic advice>],
  "explanation": "<3-5 sentences explaining your reasoning, citing specific phrases or patterns from the text where possible>"
}`

    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY') ?? ''
    const geminiKey = Deno.env.get('GEMINI_API_KEY') ?? ''

    let rawText = ''

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
            max_tokens: 700,
            messages: [{ role: 'user', content: prompt }],
          }),
        })

        if (claudeResponse.ok) {
          const claudeData = await claudeResponse.json() as { content?: Array<{ text?: string }> }
          rawText = claudeData.content?.[0]?.text || ''
        } else {
          console.error('Claude API non-OK response:', claudeResponse.status, await claudeResponse.text())
        }
      } catch (claudeError) {
        console.error('Claude API error:', claudeError)
      }
    }

    if (!rawText && geminiKey) {
      try {
        const geminiResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: prompt }] }],
              generationConfig: { maxOutputTokens: 700, responseMimeType: 'application/json' },
            }),
          }
        )

        if (geminiResponse.ok) {
          const geminiData = await geminiResponse.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> }
          rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || ''
        } else {
          console.error('Gemini API non-OK response:', geminiResponse.status, await geminiResponse.text())
        }
      } catch (geminiError) {
        console.error('Gemini API error:', geminiError)
      }
    }

    if (!rawText) {
      return new Response(
        JSON.stringify({ error: 'Text analysis is temporarily unavailable. Please try again shortly.' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let parsed: {
      ai_probability: number
      verdict: string
      signals: string[]
      explanation: string
    }

    try {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error('No JSON found in response')
      parsed = JSON.parse(jsonMatch[0])
    } catch {
      return new Response(
        JSON.stringify({ error: 'Failed to parse analysis results. Please try again.' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const validVerdicts = ['human', 'likely_human', 'uncertain', 'likely_ai', 'ai_generated']
    const verdict = validVerdicts.includes(parsed.verdict) ? parsed.verdict : 'uncertain'
    const aiProbability = typeof parsed.ai_probability === 'number'
      ? Math.max(0, Math.min(100, Math.round(parsed.ai_probability)))
      : 50

    const { data: scan, error: dbError } = await supabase
      .from('text_scans')
      .insert({
        user_id,
        content_excerpt: analysisText.slice(0, 500),
        word_count: wordCount,
        ai_probability: aiProbability,
        verdict,
        signals: Array.isArray(parsed.signals) ? parsed.signals.slice(0, 6) : [],
        explanation: parsed.explanation || 'Analysis complete. Review the signals for details.',
      })
      .select()
      .single()

    if (dbError) throw dbError

    await supabase.from('usage_logs').insert({
      user_id,
      module: 'text',
      action: 'scan',
    })

    return new Response(JSON.stringify({ scan }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('text-analyze error:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
