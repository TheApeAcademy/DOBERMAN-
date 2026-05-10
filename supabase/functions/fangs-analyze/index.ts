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
    const { input_value, input_type, threat_type, user_id } = await req.json()

    if (!user_id || !input_value) {
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
      .eq('module', 'fangs')
      .gte('created_at', today.toISOString())

    if ((count || 0) >= DAILY_LIMIT) {
      return new Response(
        JSON.stringify({ error: 'Daily scan limit reached. Upgrade to Pro for unlimited scans.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY') ?? ''

    const threatContext: Record<string, string> = {
      phishing: 'Focus on phishing indicators: lookalike domains, credential harvesting patterns, URL obfuscation, email spoofing, social engineering tactics, and known phishing kits.',
      malware: 'Focus on malware indicators: file behavior, persistence mechanisms, C2 communication patterns, obfuscation techniques, known malware families, and sandbox evasion.',
      intrusion: 'Focus on intrusion indicators: C2 infrastructure, APT TTPs (MITRE ATT&CK), lateral movement patterns, known threat actor infrastructure, and post-exploitation tools.',
      vulnerability: 'Focus on vulnerability analysis: CVE identification, CVSS scoring, affected software versions, exploit availability, patch status, and exploitation difficulty.',
      darkweb: 'Focus on dark web exposure: data breach databases, credential dumps, paste sites, dark web marketplace listings, and exposed PII or corporate data.',
      general: 'Perform a comprehensive threat analysis across all relevant threat categories.',
    }

    const prompt = `You are DOBERMAN INTELLIGENCE, an elite cybersecurity threat analyst. You think like an attacker and defend like a professional. You are precise, authoritative, and never vague.

The user has submitted the following for threat analysis:
- Input type: ${input_type}
- Threat focus: ${threat_type}
- Value to analyze: ${input_value}

${threatContext[threat_type] || threatContext.general}

Analyze this input thoroughly. Reference real CVE IDs, known malware families (Emotet, Cobalt Strike, etc.), and APT groups (APT28, Lazarus Group, etc.) where relevant. Be specific - generic answers are unacceptable.

Return ONLY valid JSON in this exact structure, no markdown, no explanation outside of it:
{
  "verdict": "malicious" | "suspicious" | "clean" | "unknown",
  "risk_score": number (0-100),
  "threat_name": string | null (e.g. "Emotet Loader", "APT29 C2", "CVE-2024-12345", null if clean),
  "description": string (2-4 sentences, precise technical analysis as DOBERMAN would deliver it),
  "indicators": [
    {
      "type": string (e.g. "domain", "ip", "hash", "behavior", "pattern", "technique"),
      "value": string (the specific indicator),
      "confidence": number (0-100),
      "description": string (why this is an indicator)
    }
  ],
  "cves": [
    {
      "id": string (e.g. "CVE-2024-1234"),
      "description": string (brief description),
      "severity": "critical" | "high" | "medium" | "low",
      "cvss": number (0.0-10.0)
    }
  ],
  "apt_groups": [string] (array of known threat actor names, empty if none),
  "recommendations": [string] (numbered action steps, specific and actionable, 3-6 items)
}`

    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2500,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!claudeResponse.ok) {
      throw new Error(`Claude API error: ${claudeResponse.status}`)
    }

    const claudeData = await claudeResponse.json() as { content?: Array<{ text?: string }> }
    const rawText = claudeData.content?.[0]?.text || ''

    let analysisData: {
      verdict: 'malicious' | 'suspicious' | 'clean' | 'unknown'
      risk_score: number
      threat_name: string | null
      description: string
      indicators: Array<{ type: string; value: string; confidence: number; description: string }>
      cves: Array<{ id: string; description: string; severity: string; cvss: number }>
      apt_groups: string[]
      recommendations: string[]
    }

    try {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error('No JSON found in response')
      analysisData = JSON.parse(jsonMatch[0])
    } catch {
      throw new Error('Failed to parse threat analysis. Please try again.')
    }

    // Save to database
    const { data: scan, error: dbError } = await supabase
      .from('fangs_scans')
      .insert({
        user_id,
        input_value,
        input_type,
        threat_type,
        verdict: analysisData.verdict,
        risk_score: analysisData.risk_score,
        threat_name: analysisData.threat_name,
        description: analysisData.description,
        indicators: analysisData.indicators || [],
        cves: analysisData.cves || [],
        apt_groups: analysisData.apt_groups || [],
        recommendations: analysisData.recommendations || [],
      })
      .select()
      .single()

    if (dbError) throw dbError

    // Log usage
    await supabase.from('usage_logs').insert({
      user_id,
      module: 'fangs',
      action: 'analyze',
    })

    return new Response(JSON.stringify({ scan }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('fangs-analyze error:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
