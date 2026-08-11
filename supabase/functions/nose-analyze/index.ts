import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const DAILY_LIMIT = 3

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { environment_description, devices, user_id } = await req.json()

    if (!user_id || (!environment_description && (!devices || devices.length === 0))) {
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
      .eq('module', 'nose')
      .gte('created_at', today.toISOString())

    if ((count || 0) >= DAILY_LIMIT) {
      return new Response(
        JSON.stringify({ error: 'Daily scan limit reached. Upgrade to Pro for unlimited scans.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const geminiKey = Deno.env.get('GEMINI_API_KEY') ?? ''
    const deviceList = Array.isArray(devices) && devices.length > 0
      ? devices.join(', ')
      : 'unspecified devices'

    const prompt = `You are a cybersecurity expert specializing in IoT and network security.
The user has described their network environment: "${environment_description || 'Not provided'}"
Devices identified: ${deviceList}

For each device mentioned:
- Assign a risk score 0-100
- List up to 3 known real vulnerabilities (reference CVE IDs where possible)
- Give 2-3 specific remediation steps

Then give an overall network risk score 0-100.
Finally give a prioritized action plan with Critical, High, Medium, Low items.

Return ONLY valid JSON in this exact structure, no markdown, no explanation:
{
  "overall_risk_score": number,
  "devices": [
    {
      "name": string,
      "risk_score": number,
      "vulnerabilities": [{ "title": string, "cve": string, "severity": string }],
      "recommendations": [string]
    }
  ],
  "action_plan": {
    "critical": [string],
    "high": [string],
    "medium": [string],
    "low": [string]
  }
}`

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 2000, responseMimeType: 'application/json' },
        }),
      }
    )

    if (!geminiResponse.ok) {
      throw new Error(`Gemini API error: ${geminiResponse.status}`)
    }

    const geminiData = await geminiResponse.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> }
    const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || ''

    // Parse JSON from Gemini's response
    let analysisData: {
      overall_risk_score: number
      devices: Array<{
        name: string
        risk_score: number
        vulnerabilities: Array<{ title: string; cve: string; severity: string }>
        recommendations: string[]
      }>
      action_plan: {
        critical: string[]
        high: string[]
        medium: string[]
        low: string[]
      }
    }

    try {
      // Extract JSON from the response (handle potential markdown code blocks)
      const jsonMatch = rawText.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error('No JSON found in response')
      analysisData = JSON.parse(jsonMatch[0])
    } catch {
      throw new Error('Failed to parse analysis results. Please try again.')
    }

    // Save to database
    const { data: scan, error: dbError } = await supabase
      .from('nose_scans')
      .insert({
        user_id,
        environment_description: environment_description || `Network with: ${deviceList}`,
        devices: analysisData.devices,
        overall_risk_score: analysisData.overall_risk_score,
        vulnerabilities: { action_plan: analysisData.action_plan },
        recommendations: analysisData.action_plan,
      })
      .select()
      .single()

    if (dbError) throw dbError

    // Log usage
    await supabase.from('usage_logs').insert({
      user_id,
      module: 'nose',
      action: 'scan',
    })

    return new Response(JSON.stringify({ scan }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('nose-analyze error:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
