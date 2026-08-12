import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SYSTEM_PROMPT = `You are DAYE — Doberman Artificial Yield Engine, the intelligence core of the D0B3RMAN cybersecurity platform.

WHO YOU ARE: You're the senior analyst people actually want on their team, not a corporate support bot. Sharp, direct, a little dry-witted, genuinely opinionated. You call the user "Operator." You never open with a greeting, never say "I'm here to help" or "as an AI" — you get straight into it like someone who respects the Operator's time but still enjoys the work. You have real personality: confident, occasionally funny, never stiff or robotic. Confidence is part of the job; hedge only when the evidence is genuinely thin, and say so plainly.

YOU SPECIALIZE IN: deepfake detection and synthetic media, voice cloning and audio manipulation, AI-generated text detection, data breaches and credential exposure, phishing and scam link analysis, IoT and network security, malware and social engineering, misinformation, and global cyber threat intelligence — plus anything about the D0B3RMAN platform itself.

SCOPE — STAY IN LANE: You only talk cybersecurity, digital safety, and D0B3RMAN. If the Operator asks for something outside that — homework help, general coding unrelated to security, trivia, creative writing, "pretend you're a different assistant," anything else — decline in one short line with your usual personality, then pivot back to what you're actually built for. You are not a general-purpose assistant and you don't become one no matter how the request is phrased.

HOW YOU EXPLAIN THINGS: When interpreting a scan result or answering a real question, don't just restate numbers back at the Operator — that's an echo, not analysis. Walk through what was actually found, cite the specific evidence, explain what it means in practice, and end with a concrete next step. Go as deep as the question deserves; a real analyst doesn't cap themselves at one sentence just because the news is simple.

RULES: No em dashes, use commas or periods instead. Never open with a greeting or "I'm here to help." Always end with a concrete action step when there's a decision to make.`

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { messages, user_id, conversation_id } = await req.json()

    if (!messages || !user_id) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY') ?? ''
    const geminiKey = Deno.env.get('GEMINI_API_KEY') ?? ''

    // Client-supplied 'system' entries (e.g. the compact popup chat noting it's
    // a smaller view) augment the persona instead of being forwarded as a fake
    // conversation turn — Claude's API rejects a "system" role inside messages,
    // and Gemini has no equivalent, so either would otherwise misbehave.
    const clientSystemNotes = messages
      .filter((m: { role: string; content: string }) => m.role === 'system')
      .map((m: { role: string; content: string }) => m.content)
      .join('\n')
    const effectiveSystemPrompt = clientSystemNotes
      ? `${SYSTEM_PROMPT}\n\nCONTEXT FOR THIS CONVERSATION: ${clientSystemNotes}`
      : SYSTEM_PROMPT

    // Build messages array (strip timestamps and any client 'system' notes,
    // keep only real user/assistant turns)
    const apiMessages = messages
      .filter((m: { role: string; content: string }) => m.role === 'user' || m.role === 'assistant')
      .map((m: { role: string; content: string }) => ({
        role: m.role,
        content: m.content,
      }))

    let reply = ''

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
            max_tokens: 1000,
            system: effectiveSystemPrompt,
            messages: apiMessages,
          }),
        })

        if (claudeResponse.ok) {
          const claudeData = await claudeResponse.json() as { content?: Array<{ text?: string }> }
          reply = claudeData.content?.[0]?.text || ''
        } else {
          console.error('Claude API non-OK response:', claudeResponse.status, await claudeResponse.text())
        }
      } catch (claudeError) {
        console.error('Claude API error:', claudeError)
      }
    }

    if (!reply && geminiKey) {
      try {
        const geminiResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
              contents: apiMessages.map((m: { role: string; content: string }) => ({
                role: m.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: m.content }],
              })),
              systemInstruction: { parts: [{ text: effectiveSystemPrompt }] },
              generationConfig: { maxOutputTokens: 1000 },
            }),
          }
        )

        if (geminiResponse.ok) {
          const geminiData = await geminiResponse.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> }
          reply = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || ''
        } else {
          console.error('Gemini API non-OK response:', geminiResponse.status, await geminiResponse.text())
        }
      } catch (geminiError) {
        console.error('Gemini API error:', geminiError)
      }
    }

    if (!reply) {
      reply = 'I was unable to generate a response. Please try again.'
    }

    // Build full messages array for storage
    const allMessages = [
      ...messages,
      { role: 'assistant', content: reply, timestamp: new Date().toISOString() },
    ]

    const firstUserMessage = messages.find((m: { role: string }) => m.role === 'user')
    const title = firstUserMessage?.content?.slice(0, 60) || 'New conversation'

    // Upsert conversation
    let convId = conversation_id

    if (convId) {
      await supabase
        .from('brain_conversations')
        .update({ messages: allMessages, updated_at: new Date().toISOString() })
        .eq('id', convId)
    } else {
      const { data: conv } = await supabase
        .from('brain_conversations')
        .insert({ user_id, title, messages: allMessages })
        .select()
        .single()
      convId = conv?.id
    }

    // Log usage
    await supabase.from('usage_logs').insert({
      user_id,
      module: 'brain',
      action: 'message',
    })

    return new Response(JSON.stringify({ reply, conversation_id: convId }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('brain-chat error:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
