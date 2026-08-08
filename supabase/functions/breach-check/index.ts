import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const DAILY_LIMIT = 3

async function sha1Hex(text: string): Promise<string> {
  const data = new TextEncoder().encode(text)
  const hashBuffer = await crypto.subtle.digest('SHA-1', data)
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase()
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { type, value, user_id } = await req.json()

    if (!type || !value || !user_id) {
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
        JSON.stringify({ error: 'Daily scan limit reached. Upgrade to Pro for unlimited scans.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const HIBP_KEY = Deno.env.get('HIBP_API_KEY') ?? ''
    let result: Record<string, unknown> = {}

    if (type === 'password') {
      const hash = await sha1Hex(value)
      const prefix = hash.slice(0, 5)
      const suffix = hash.slice(5)

      const pwdRes = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
        headers: { 'Add-Padding': 'true' },
      })
      const pwdText = await pwdRes.text()
      const lines = pwdText.split('\n')
      const match = lines.find((l) => l.toUpperCase().startsWith(suffix))
      const occurrences = match ? parseInt(match.split(':')[1].trim()) : 0

      result = {
        type: 'password',
        breached: occurrences > 0,
        occurrences,
        severity: occurrences === 0 ? 'none' : occurrences < 10 ? 'low' : occurrences < 1000 ? 'medium' : 'critical',
        message: occurrences === 0
          ? 'This password has not been found in any known data breach.'
          : `This password has appeared ${occurrences.toLocaleString()} time${occurrences !== 1 ? 's' : ''} in known data breaches. Change it immediately.`,
        recommendations: occurrences > 0 ? [
          'Change this password on all sites where it is used',
          'Use a password manager to generate unique passwords',
          'Enable two-factor authentication wherever possible',
        ] : [
          'Continue using unique passwords for each account',
          'Store passwords in a secure password manager',
        ],
      }
    } else if (type === 'email') {
      if (!HIBP_KEY) {
        result = {
          type: 'email',
          breached: false,
          unavailable: true,
          severity: 'unavailable',
          message: 'Live email breach checking is not configured yet (missing HIBP API key) — this check could not run against real data.',
          recommendations: [],
        }
      } else {
        const hibpRes = await fetch(
          `https://haveibeenpwned.com/api/v3/breachedaccount/${encodeURIComponent(value)}?truncateResponse=false`,
          {
            headers: {
              'hibp-api-key': HIBP_KEY,
              'user-agent': 'D0B3RMAN-Cybersecurity-App',
            },
          }
        )

        let breaches: unknown[] = []
        if (hibpRes.status === 200) {
          breaches = await hibpRes.json()
        }

        result = {
          type: 'email',
          breached: breaches.length > 0,
          breach_count: breaches.length,
          breaches: (breaches as Array<Record<string, unknown>>).map((b) => ({
            name: b.Name,
            domain: b.Domain,
            breach_date: b.BreachDate,
            data_classes: b.DataClasses,
            description: b.Description,
            is_verified: b.IsVerified,
          })),
          severity: breaches.length === 0 ? 'none' : breaches.length < 3 ? 'medium' : 'critical',
          message: breaches.length === 0
            ? 'Good news — this email was not found in any known data breach.'
            : `This email appeared in ${breaches.length} data breach${breaches.length !== 1 ? 'es' : ''}. Review the details below.`,
          recommendations: breaches.length > 0 ? [
            'Change passwords on all listed services',
            'Enable two-factor authentication on each breached account',
            'Check if any breached passwords were reused elsewhere',
            'Monitor your accounts for suspicious activity',
          ] : [
            'Keep monitoring with regular breach checks',
            'Use unique passwords for every service',
          ],
        }
      }
    } else if (type === 'phone') {
      result = {
        type: 'phone',
        breached: false,
        unavailable: true,
        severity: 'unavailable',
        sources: [],
        message: 'Phone number breach checking is not yet connected to a live data source — no verified breach databases currently support this lookup.',
        recommendations: [],
      }
    }

    await supabase.from('usage_logs').insert({
      user_id,
      module: 'breach',
      action: `breach_check_${type}`,
    })

    await supabase.from('breach_scans').insert({
      user_id,
      scan_type: type,
      query: type === 'password' ? '[REDACTED]' : value,
      result: JSON.stringify(result),
    })

    return new Response(JSON.stringify({ scan: result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Scan failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
