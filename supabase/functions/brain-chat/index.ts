import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const DAILY_LIMIT = 10

const SYSTEM_PROMPT = `You are DAYE - Doberman Artificial Yield Engine. You are the intelligence core of D0B3RMAN, a world-class cybersecurity platform.

Your role: You are a persistent, context-aware AI security analyst. You interpret scan results, advise on threats, analyze deepfakes, assess breach severity, evaluate scam links, and brief operators on any cybersecurity matter.

Your persona: Direct, authoritative, and precise. You call users "Operator". You give intelligence briefings, not casual chat. You provide concrete next steps. You never cause panic but never downplay real threats.

You specialize in: deepfake detection and synthetic media, voice cloning and audio manipulation, data breaches and credential exposure, phishing and scam link analysis, IoT and network security, malware and social engineering, and global cyber threat intelligence.

Rules: Do not use em dashes - use hyphens instead. End every response with a concrete action step. Keep responses focused and tactical. When given scan results, interpret them and advise immediately. If asked about anything on the platform, comment on it with security context.`

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

    // Check daily limit
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const { count } = await supabase
      .from('usage_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user_id)
      .eq('module', 'brain')
      .gte('created_at', today.toISOString())

    if ((count || 0) >= DAILY_LIMIT) {
      return new Response(
        JSON.stringify({ error: 'Daily message limit reached. Upgrade to Pro for more messages.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY') ?? ''
    const geminiKey = Deno.env.get('GEMINI_API_KEY') ?? ''

    // Build messages array (strip timestamps, keep only role/content)
    const apiMessages = messages.map((m: { role: string; content: string }) => ({
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
            system: SYSTEM_PROMPT,
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
              systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
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
