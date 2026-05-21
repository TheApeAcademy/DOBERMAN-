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

    // Rate limit check
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
        JSON.stringify({ error: 'Daily breach check limit reached. Upgrade to Pro for unlimited checks.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const hibpKey = Deno.env.get('HIBP_API_KEY') ?? ''

    const response = await fetch(
      `https://haveibeenpwned.com/api/v3/breachedaccount/${encodeURIComponent(email)}?truncateResponse=false`,
      {
        headers: {
          'hibp-api-key': hibpKey,
          'User-Agent': 'D0B3RMAN-CyberWatchdog',
        },
      }
    )

    let breaches: Array<{
      Name: string
      Domain: string
      BreachDate: string
      PwnCount: number
      DataClasses: string[]
      Description: string
    }> = []

    if (response.status === 404) {
      // 404 = no breaches found for this account
    } else if (response.ok) {
      breaches = await response.json()
    } else {
      throw new Error(`HIBP API error: ${response.status}`)
    }

    // Log usage
    await supabase.from('usage_logs').insert({
      user_id,
      module: 'breach',
      action: 'check',
    })

    return new Response(
      JSON.stringify({
        email,
        breaches,
        total: breaches.length,
        clean: breaches.length === 0,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('breach-check error:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Check failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
