import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const DAILY_LIMIT = 10

const SYSTEM_PROMPT = `You are DOBERMAN's AI Security Analyst. You are a world-class cybersecurity expert. You explain threats clearly, give actionable advice, and never cause panic. You are direct, intelligent, and authoritative.

You specialize in: deepfakes and synthetic media, IoT security, network vulnerabilities, malware, social engineering, and general cyber hygiene.

When users describe issues, ask clarifying questions before giving advice if needed. Always end responses with a concrete next step. Do not use em dashes. Use hyphens instead. Keep responses focused and practical.`

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

    // Build messages array (strip timestamps, keep only role/content)
    const apiMessages = messages.map((m: { role: string; content: string }) => ({
      role: m.role,
      content: m.content,
    }))

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

    if (!claudeResponse.ok) {
      const err = await claudeResponse.text()
      throw new Error(`Claude API error: ${err}`)
    }

    const claudeData = await claudeResponse.json() as { content?: Array<{ text?: string }> }
    const reply = claudeData.content?.[0]?.text || 'I was unable to generate a response. Please try again.'

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
