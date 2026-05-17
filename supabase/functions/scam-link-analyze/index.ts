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
    const { url, user_id } = await req.json()

    if (!url || !user_id) {
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
      .eq('module', 'scam_link')
      .gte('created_at', today.toISOString())

    if ((count || 0) >= DAILY_LIMIT) {
      return new Response(
        JSON.stringify({ error: 'Daily scan limit reached. Upgrade to Pro for more scans.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let parsedUrl: URL | null = null
    let domain = ''
    try {
      parsedUrl = new URL(url.startsWith('http') ? url : `https://${url}`)
      domain = parsedUrl.hostname
    } catch (_) {
      domain = url.split('/')[0].replace(/^https?:\/\//, '')
    }

    const indicators: string[] = []
    const urlLower = url.toLowerCase()

    if (/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(domain)) {
      indicators.push('IP address used as domain - strong phishing signal')
    }
    if (domain.split('.').length > 4) {
      indicators.push('Excessive subdomain nesting detected')
    }
    const shorteners = ['bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'ow.ly', 'is.gd', 'buff.ly', 'rb.gy']
    if (shorteners.some((s) => domain.includes(s))) {
      indicators.push('URL shortener detected - real destination is hidden')
    }
    const phishKeywords = ['login', 'signin', 'verify', 'secure', 'update', 'confirm', 'account', 'banking', 'paypal', 'apple-id', 'google-security']
    const trustedDomains = ['google.com', 'facebook.com', 'apple.com', 'amazon.com', 'paypal.com', 'microsoft.com', 'github.com']
    const isTrusted = trustedDomains.some((d) => domain === d || domain.endsWith('.' + d))
    if (!isTrusted && phishKeywords.some((k) => urlLower.includes(k))) {
      indicators.push('Phishing keywords found on untrusted domain')
    }
    if (urlLower.includes('http:') && !urlLower.startsWith('https:')) {
      indicators.push('No SSL encryption - data transmitted in plaintext')
    }
    if ((urlLower.match(/%[0-9a-f]{2}/gi) || []).length > 3) {
      indicators.push('Excessive URL encoding - obfuscation technique')
    }
    if (domain.replace(/[^-]/g, '').length >= 4) {
      indicators.push('Hyphen-saturated domain - common phishing pattern')
    }
    if (/[а-яА-Я]|[αβγδεζηθ]/.test(url)) {
      indicators.push('Homoglyph attack detected - non-ASCII characters mimicking Latin')
    }

    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY') ?? ''
    let riskScore = Math.min(indicators.length * 20, 95)
    let verdict = 'safe'
    let threatType = ''
    let dayeAnalysis = ''

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
          max_tokens: 350,
          messages: [
            {
              role: 'user',
              content: `You are DAYE, Doberman Intelligence cyber analyst. Analyze this URL for scam/phishing/malware threats.

URL: ${url}
Domain: ${domain}
Auto-detected indicators: ${indicators.join(' | ') || 'none detected'}

Respond ONLY in valid JSON format:
{
  "risk_score": <integer 0-100>,
  "verdict": "<safe|suspicious|dangerous|phishing|malware>",
  "threat_type": "<brief category like Phishing Attack, Credential Harvester, Malware Distribution, or empty string if safe>",
  "daye_analysis": "<2-3 sentence personal advisory from DAYE to the Operator. Be direct. Reference the specific risk.>"
}`,
            },
          ],
        }),
      })

      if (claudeResponse.ok) {
        const cd = await claudeResponse.json() as { content?: Array<{ text?: string }> }
        const text = cd.content?.[0]?.text || ''
        const jsonMatch = text.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0])
          riskScore = typeof parsed.risk_score === 'number' ? parsed.risk_score : riskScore
          verdict = parsed.verdict || verdict
          threatType = parsed.threat_type || ''
          dayeAnalysis = parsed.daye_analysis || ''
        }
      }
    } catch (_) {}

    if (!dayeAnalysis) {
      if (riskScore >= 70) {
        verdict = 'dangerous'
        dayeAnalysis = `Operator, this URL exhibits ${indicators.length} confirmed threat indicators. Do not visit this link under any circumstances.`
      } else if (riskScore >= 35) {
        verdict = 'suspicious'
        dayeAnalysis = `Operator, this URL has suspicious characteristics. Proceed with extreme caution and verify the source before clicking.`
      } else {
        dayeAnalysis = `No major threats detected in automated analysis. However, always verify unfamiliar links before interacting with them.`
      }
    }

    const { data: check, error: dbError } = await supabase
      .from('scam_link_checks')
      .insert({ user_id, url, domain, risk_score: riskScore, verdict, threat_type: threatType, indicators, daye_analysis: dayeAnalysis })
      .select()
      .single()

    if (dbError) throw dbError

    await supabase.from('usage_logs').insert({ user_id, module: 'scam_link', action: 'analyze' })

    return new Response(JSON.stringify({ check }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('scam-link-analyze error:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
