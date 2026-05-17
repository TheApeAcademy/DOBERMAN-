import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const DAILY_LIMIT = 3

async function sha1(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message)
  const hashBuffer = await crypto.subtle.digest('SHA-1', msgBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, user_id } = await req.json()

    if (!email || !user_id) {
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
      .eq('module', 'breach')
      .gte('created_at', today.toISOString())

    if ((count || 0) >= DAILY_LIMIT) {
      return new Response(
        JSON.stringify({ error: 'Daily breach check limit reached (3/day).' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Call HIBP API
    const hibpKey = Deno.env.get('HIBP_API_KEY') ?? ''
    const hibpResponse = await fetch(
      `https://haveibeenpwned.com/api/v3/breachedaccount/${encodeURIComponent(email)}?truncateResponse=false`,
      {
        headers: {
          'hibp-api-key': hibpKey,
          'user-agent': 'DOBERMAN-Security-Platform',
        },
      }
    )

    let breaches: unknown[] = []
    if (hibpResponse.status === 200) {
      breaches = await hibpResponse.json()
    } else if (hibpResponse.status === 404) {
      breaches = []
    } else {
      throw new Error(`HIBP API error: ${hibpResponse.status}`)
    }

    // Default safe values
    let riskScore = 0
    let summary = 'No breaches found. Your email does not appear in any known public data breaches.'
    let actionPlan: string[] = [
      'Enable two-factor authentication on all accounts',
      'Use a unique, strong password for each service',
      'Use a password manager to generate and store credentials',
      'Monitor your accounts regularly for suspicious activity',
      'Sign up for breach notifications at haveibeenpwned.com',
    ]

    if (breaches.length > 0) {
      const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY') ?? ''
      const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': anthropicKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 500,
          messages: [
            {
              role: 'user',
              content: `You are DOBERMAN's Security Analyst. The user's email was found in these data breaches: ${JSON.stringify(breaches.slice(0, 10))}.
Provide: 1) an overall risk score 0-100 based on severity and data types exposed, 2) a 2-3 sentence plain-English summary, 3) exactly 5 prioritized action steps.
Return ONLY valid JSON, no markdown: { "risk_score": number, "summary": string, "action_plan": string[] }`,
            },
          ],
        }),
      })

      if (claudeResponse.ok) {
        const claudeData = await claudeResponse.json() as { content?: Array<{ text?: string }> }
        const text = claudeData.content?.[0]?.text || '{}'
        try {
          const parsed = JSON.parse(text) as { risk_score?: number; summary?: string; action_plan?: string[] }
          riskScore = typeof parsed.risk_score === 'number' ? parsed.risk_score : Math.min(100, breaches.length * 15)
          summary = parsed.summary || summary
          actionPlan = Array.isArray(parsed.action_plan) ? parsed.action_plan : actionPlan
        } catch {
          riskScore = Math.min(100, breaches.length * 15)
        }
      }
    }

    const emailHash = await sha1(email.toLowerCase())

    await supabase.from('breach_checks').insert({
      user_id,
      email_hash: emailHash,
      breach_count: breaches.length,
      risk_score: riskScore,
      summary,
      action_plan: actionPlan,
      breaches,
    })

    await supabase.from('usage_logs').insert({
      user_id,
      module: 'breach',
      action: 'check',
    })

    return new Response(
      JSON.stringify({ breaches, risk_score: riskScore, summary, action_plan: actionPlan }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('breach-check error:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
