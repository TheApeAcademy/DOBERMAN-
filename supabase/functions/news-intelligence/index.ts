import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const DAILY_LIMIT = 10

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { article_url, article_title, article_description, user_id, message } = await req.json()

    if (!article_url || !user_id) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get existing conversation
    const { data: conversation } = await supabase
      .from('news_conversations')
      .select('*')
      .eq('user_id', user_id)
      .eq('article_url', article_url)
      .maybeSingle()

    const existingMessages: Array<{ role: string; content: string }> = conversation?.messages || []

    // If no message (initial load) and conversation already exists, return it
    if (!message && existingMessages.length > 0) {
      return new Response(JSON.stringify({ messages: existingMessages }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Check daily limit before generating new response
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const { count } = await supabase
      .from('usage_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user_id)
      .eq('module', 'news_intelligence')
      .gte('created_at', today.toISOString())

    if ((count || 0) >= DAILY_LIMIT) {
      return new Response(
        JSON.stringify({ error: 'Daily intelligence limit reached (10/day).' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const systemPrompt = `You are DOBERMAN's Intelligence Analyst. You analyze cybersecurity news and answer questions about articles.
Provide tangible, actionable advice. Reference specific details from the article context.
Be direct and concise. Do not use em dashes.

Article context:
Title: ${article_title || 'Unknown'}
Description: ${article_description || 'No description available'}
URL: ${article_url}`

    const userMessage = message || 'Give me an intelligence briefing on this article. What are the key security implications and what should I know?'

    const geminiContents = [
      ...existingMessages,
      { role: 'user', content: userMessage },
    ].map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }))

    const geminiKey = Deno.env.get('GEMINI_API_KEY') ?? ''
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          contents: geminiContents,
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig: { maxOutputTokens: 600 },
        }),
      }
    )

    if (!geminiResponse.ok) {
      throw new Error('Gemini API failed')
    }

    const geminiData = await geminiResponse.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> }
    const aiResponse = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || 'Analysis unavailable.'

    const updatedMessages = [
      ...existingMessages,
      { role: 'user', content: userMessage },
      { role: 'assistant', content: aiResponse },
    ]

    if (conversation) {
      await supabase
        .from('news_conversations')
        .update({ messages: updatedMessages, updated_at: new Date().toISOString() })
        .eq('id', conversation.id)
    } else {
      await supabase.from('news_conversations').insert({
        user_id,
        article_url,
        article_title,
        messages: updatedMessages,
      })
    }

    await supabase.from('usage_logs').insert({
      user_id,
      module: 'news_intelligence',
      action: 'query',
    })

    return new Response(JSON.stringify({ messages: updatedMessages }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('news-intelligence error:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
