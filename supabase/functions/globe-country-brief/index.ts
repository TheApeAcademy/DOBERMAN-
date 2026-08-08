import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Cache briefs for 24h so repeat selections of the same country don't burn a
// Claude call every time — see supabase/migrations/005_globe_country_briefs.sql
const CACHE_TTL_MS = 24 * 60 * 60 * 1000

const DAYE_PERSONA = `You are DAYE, Doberman Intelligence. You are the personal cyber intelligence assistant embedded in the D0B3RMAN security platform.

You speak directly to the Operator (the user). You are sharp, authoritative, and proactive. You give short, high-signal briefings - never filler. You never use em dashes. You never say "I'm here to help." You speak like an elite cyber analyst giving a direct briefing.`

interface CountryBrief {
  threatLevel: number
  threatLabel: 'LOW' | 'ELEVATED' | 'HIGH' | 'CRITICAL'
  overview: string
  good: string
  bad: string
  ugly: string
  aware: string
  recommended: string
}

function fallbackBrief(): CountryBrief {
  return {
    threatLevel: 0,
    threatLabel: 'UNKNOWN' as CountryBrief['threatLabel'],
    overview: 'DAYE could not generate a live brief for this region. Try again shortly.',
    good: 'Live analysis unavailable right now.',
    bad: 'Live analysis unavailable right now.',
    ugly: 'Live analysis unavailable right now.',
    aware: 'Live analysis unavailable right now.',
    recommended: 'Retry the selection in a moment, or check the global live feed for this region in the meantime.',
  }
}

function extractJson(raw: string): unknown {
  // Strip markdown code fences if Claude wraps the JSON despite instructions.
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i)
  const candidate = fenced ? fenced[1] : raw
  const jsonMatch = candidate.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('No JSON object found in model output')
  return JSON.parse(jsonMatch[0])
}

function isValidBrief(value: unknown): value is CountryBrief {
  if (!value || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  const stringFields = ['overview', 'good', 'bad', 'ugly', 'aware', 'recommended']
  return (
    typeof v.threatLevel === 'number' &&
    typeof v.threatLabel === 'string' &&
    stringFields.every((f) => typeof v[f] === 'string' && v[f])
  )
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { code, name } = await req.json()

    if (!code || !name) {
      return new Response(JSON.stringify({ error: 'Missing required fields: code, name' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Check the cache first.
    try {
      const { data: cached } = await supabase
        .from('globe_country_briefs')
        .select('brief, updated_at')
        .eq('code', code)
        .maybeSingle()

      if (cached?.brief && cached.updated_at) {
        const age = Date.now() - new Date(cached.updated_at).getTime()
        if (age < CACHE_TTL_MS) {
          return new Response(JSON.stringify(cached.brief), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        }
      }
    } catch (_) {
      // Cache lookup failing shouldn't block a fresh generation.
    }

    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY') ?? ''

    if (!anthropicKey) {
      return new Response(JSON.stringify(fallbackBrief()), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const prompt = `Generate a live cyber threat intelligence brief for ${name} (ISO code ${code}) for the D0B3RMAN Cyber Globe.

Return STRICT JSON only. No markdown code fences. No prose before or after the JSON. Exactly this shape:
{
  "threatLevel": <number 1-10, one decimal>,
  "threatLabel": "LOW" | "ELEVATED" | "HIGH" | "CRITICAL",
  "overview": "<2-4 sentences: this country's overall cyber threat landscape>",
  "good": "<2-4 sentences: genuine defensive strengths - agencies, frameworks, capabilities>",
  "bad": "<2-4 sentences: structural weaknesses or chronic vulnerabilities>",
  "ugly": "<2-4 sentences: the most severe known incidents or realistic worst-case exposure>",
  "aware": "<2-4 sentences: what an Operator with exposure to this country should watch for>",
  "recommended": "<2-4 sentences: concrete, actionable defensive recommendations>"
}

Base this on realistic, general knowledge of this country's cyber threat environment (known APT activity, sectors of concern, government cyber posture, notable incident history). If you are not confident about specific claims for a small or low-profile nation, keep the brief accurate, general, and honest rather than inventing specifics. Do not fabricate precise statistics (breach counts, dollar figures, percentages) — describe threats qualitatively instead.`

    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 900,
        system: DAYE_PERSONA,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!claudeResponse.ok) {
      throw new Error(`Claude API error: ${claudeResponse.status}`)
    }

    const claudeData = await claudeResponse.json() as { content?: Array<{ text?: string }> }
    const rawText = claudeData.content?.[0]?.text || ''

    let brief: CountryBrief
    try {
      const parsed = extractJson(rawText)
      if (!isValidBrief(parsed)) throw new Error('Model output did not match expected shape')
      brief = parsed
    } catch (parseError) {
      console.error('globe-country-brief parse error:', parseError, rawText)
      return new Response(JSON.stringify(fallbackBrief()), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 2. Upsert into the cache for next time.
    try {
      await supabase.from('globe_country_briefs').upsert({
        code,
        name,
        brief,
        updated_at: new Date().toISOString(),
      })
    } catch (cacheError) {
      console.error('globe-country-brief cache write error:', cacheError)
      // Non-fatal — still return the freshly generated brief.
    }

    return new Response(JSON.stringify(brief), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('globe-country-brief error:', error)
    return new Response(JSON.stringify(fallbackBrief()), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
