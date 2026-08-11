import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const DAYE_PERSONA = `You are DAYE, Doberman Intelligence. You are the personal cyber intelligence assistant embedded in the D0B3RMAN security platform.

You speak directly to the Operator (the user). You are sharp, authoritative, and proactive. You give short, high-signal briefings - never filler. You never use em dashes. You never say "I'm here to help." You speak like an elite cyber analyst giving a direct briefing.

Keep responses to 1-3 sentences maximum. Focus on what matters most.`

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { context_type, data } = await req.json()

    const geminiKey = Deno.env.get('GEMINI_API_KEY') ?? ''

    let prompt = ''

    switch (context_type) {
      case 'page_enter':
        prompt = `The Operator just opened the ${data.page} section of D0B3RMAN. Give a 1-sentence briefing on what this module does and what threat it protects against.`
        break
      case 'deepfake_result':
        prompt = `DAYE deepfake scan complete. File: ${data.file_type}. Result: ${data.result}. Confidence: ${data.confidence_score}%. Give a 2-sentence interpretation and action advice for the Operator.`
        break
      case 'voice_result':
        prompt = `DAYE voice intelligence scan complete. Manipulation probability: ${data.manipulation_probability}%. Verdict: ${data.verdict}. Give a 2-sentence intelligence brief for the Operator.`
        break
      case 'breach_result':
        prompt = `DAYE breach scan complete. Check type: ${data.check_type}. Breaches found: ${data.breach_count}. Risk: ${data.risk_level}. Give a 2-sentence security advisory for the Operator.`
        break
      case 'scam_link_result':
        prompt = `DAYE scam link analysis complete. Domain: ${data.domain}. Risk score: ${data.risk_score}/100. Verdict: ${data.verdict}. Give a 1-sentence threat alert for the Operator.`
        break
      case 'dashboard_load':
        prompt = `Operator dashboard loaded. Stats - total scans today: ${data.scans_today}, threats detected: ${data.threats_detected}. Give a 1-sentence situational awareness brief.`
        break
      case 'globe_country':
        prompt = `The Operator selected ${data.country} on the Cyber Globe. Give a 2-sentence cyber threat intelligence brief specific to this country. Include common attack types or major incidents.`
        break
      case 'idle_tip':
        prompt = `Give the Operator a 1-sentence proactive cybersecurity tip or threat awareness alert. Make it specific and actionable.`
        break
      default:
        prompt = `Give the Operator a 1-sentence cybersecurity awareness message.`
    }

    let message = 'DAYE is monitoring all systems. All threat detection modules are online.'

    if (geminiKey) {
      try {
        const geminiResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: prompt }] }],
              systemInstruction: { parts: [{ text: DAYE_PERSONA }] },
              generationConfig: { maxOutputTokens: 120 },
            }),
          }
        )

        if (geminiResponse.ok) {
          const cd = await geminiResponse.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> }
          message = cd.candidates?.[0]?.content?.parts?.[0]?.text || message
        }
      } catch (_) {}
    }

    return new Response(JSON.stringify({ message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('daye-assistant error:', error)
    return new Response(
      JSON.stringify({ message: 'DAYE is monitoring all systems.' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
