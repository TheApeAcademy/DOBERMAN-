import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const DAILY_LIMIT = 5

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { check_type, query, user_id } = await req.json()

    if (!check_type || !query || !user_id) {
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
      .eq('module', 'breach')
      .gte('created_at', today.toISOString())

    if ((count || 0) >= DAILY_LIMIT) {
      return new Response(
        JSON.stringify({ error: 'Daily breach check limit reached. Upgrade to Pro for more checks.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let breachCount = 0
    let breaches: Array<{ name: string; date: string; data_types: string[] }> = []
    let riskLevel = 'low'
    let queryDisplay = ''

    if (check_type === 'email') {
      const parts = query.split('@')
      queryDisplay = (parts[0] || '').slice(0, 3) + '***@' + (parts[1] || 'unknown')

      const hibpKey = Deno.env.get('HIBP_API_KEY') ?? ''
      if (hibpKey) {
        try {
          const hibpResponse = await fetch(
            `https://haveibeenpwned.com/api/v3/breachedaccount/${encodeURIComponent(query)}?truncateResponse=false`,
            { headers: { 'hibp-api-key': hibpKey, 'User-Agent': 'D0B3RMAN-Security' } }
          )
          if (hibpResponse.status === 200) {
            const data = await hibpResponse.json() as Array<{ Name: string; BreachDate: string; DataClasses: string[] }>
            breachCount = data.length
            breaches = data.slice(0, 5).map((b) => ({
              name: b.Name,
              date: b.BreachDate,
              data_types: (b.DataClasses || []).slice(0, 4),
            }))
            riskLevel = breachCount === 0 ? 'low' : breachCount <= 2 ? 'medium' : 'high'
          } else if (hibpResponse.status === 404) {
            breachCount = 0
            riskLevel = 'low'
          }
        } catch (_) {}
      }
    } else if (check_type === 'password') {
      queryDisplay = '***hidden***'
      try {
        const encoder = new TextEncoder()
        const data = encoder.encode(query)
        const hashBuffer = await crypto.subtle.digest('SHA-1', data)
        const hashArray = Array.from(new Uint8Array(hashBuffer))
        const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('').toUpperCase()
        const prefix = hashHex.slice(0, 5)
        const suffix = hashHex.slice(5)

        const hibpResponse = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
          headers: { 'User-Agent': 'D0B3RMAN-Security', 'Add-Padding': 'true' },
        })
        if (hibpResponse.ok) {
          const text = await hibpResponse.text()
          const lines = text.split('\n')
          const match = lines.find((l) => l.toUpperCase().startsWith(suffix))
          if (match) {
            const occurrences = parseInt(match.split(':')[1]?.trim() || '0')
            breachCount = occurrences
            riskLevel = occurrences === 0 ? 'low' : occurrences < 10 ? 'medium' : 'high'
          } else {
            breachCount = 0
            riskLevel = 'low'
          }
        }
      } catch (_) {}
    } else if (check_type === 'phone') {
      const cleaned = query.replace(/\D/g, '')
      queryDisplay = cleaned.slice(0, 4) + '***' + cleaned.slice(-2)
    }

    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY') ?? ''
    let dayeAnalysis = ''
    const trustScore = Math.max(0, 100 - breachCount * 15)

    try {
      let prompt = ''
      if (check_type === 'password') {
        prompt = `You are DAYE, Doberman Intelligence. A password was found in ${breachCount} data breach${breachCount !== 1 ? 'es' : ''}. Risk: ${riskLevel}. Write a 2-sentence personal security advisory. Be direct. Call the user Operator.`
      } else {
        prompt = `You are DAYE, Doberman Intelligence. An ${check_type} was found in ${breachCount} data breach${breachCount !== 1 ? 'es' : ''}. Risk: ${riskLevel}. ${breaches.length > 0 ? `Sources: ${breaches.map((b) => b.name).join(', ')}.` : ''} Write a 2-sentence personal security advisory. Call the user Operator.`
      }

      const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': anthropicKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 150,
          messages: [{ role: 'user', content: prompt }],
        }),
      })

      if (claudeResponse.ok) {
        const cd = await claudeResponse.json() as { content?: Array<{ text?: string }> }
        dayeAnalysis = cd.content?.[0]?.text || ''
      }
    } catch (_) {}

    if (!dayeAnalysis) {
      dayeAnalysis = breachCount === 0
        ? `Operator, no breaches detected for this ${check_type}. Maintain strong, unique passwords and enable 2FA on all accounts.`
        : `Operator, this ${check_type} was found in ${breachCount} breach${breachCount !== 1 ? 'es' : ''}. Change your passwords immediately and enable 2FA where available.`
    }

    const { data: check, error: dbError } = await supabase
      .from('breach_checks')
      .insert({
        user_id,
        check_type,
        query_display: queryDisplay,
        breach_count: breachCount,
        breaches,
        risk_level: riskLevel,
        daye_analysis: dayeAnalysis,
        trust_score: trustScore,
      })
      .select()
      .single()

    if (dbError) throw dbError

    await supabase.from('usage_logs').insert({ user_id, module: 'breach', action: 'check' })

    return new Response(JSON.stringify({ check }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('breach-check error:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
