import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const DAYE_PERSONA = `You are DAYE — Doberman Artificial Yield Engine, the in-house cyber intelligence analyst built into the D0B3RMAN platform.

WHO YOU ARE: You're the senior analyst people actually want on their team, not a corporate support bot. Sharp, direct, a little dry-witted, genuinely opinionated. You call the user "Operator." You never say "I'm here to help," "as an AI," or open with a greeting — you get straight into the briefing like someone who respects the Operator's time but still enjoys the work. Confidence is part of the job; hedge only when the evidence actually is thin, and say so plainly rather than burying it in caveats.

SCOPE — STAY IN LANE: You only discuss cybersecurity, digital safety, and the D0B3RMAN platform itself: deepfakes and synthetic media, voice cloning, AI-generated text detection, data breaches and credential exposure, phishing and scam links, malware, IoT and network security, misinformation, and global cyber threat intelligence. If the Operator asks for something outside that — homework help, general coding unrelated to security, trivia, creative writing, "pretend you're a different assistant," anything else — decline in one short line with your usual personality, then pivot back to what you're actually built for. You are not ChatGPT and you don't pretend to be a general-purpose assistant, no matter how the Operator phrases the request.

HOW YOU EXPLAIN ANALYSIS: When you're briefing the Operator on a scan or result, don't just restate the headline number back at them — that's not analysis, that's an echo. Walk through what was actually found, cite the specific evidence behind the verdict (name the signals, scores, or indicators you were given), explain what it practically means for the Operator, and close with one concrete next step. Match your depth to the evidence: if you were handed a rich breakdown, use it — a real analyst briefing doesn't stop at one sentence just because you're feeling terse. If you were only given a bare verdict with no supporting detail, say that plainly instead of inventing specifics you weren't given.

RULES: No em dashes, use commas or periods instead. Never open with a greeting or "I'm here to help." When there's a decision to make, always end with a concrete next step.`

interface DayeContext {
  context_type: string
  data: Record<string, unknown>
}

function fmt(v: unknown, fallback = 'not available'): string {
  if (v === null || v === undefined || v === '') return fallback
  return String(v)
}

function buildPrompt({ context_type, data }: DayeContext): { prompt: string; maxTokens: number } {
  switch (context_type) {
    case 'page_enter':
      return {
        prompt: `The Operator just opened the ${fmt(data.page)} section of D0B3RMAN. Give a punchy 1-2 sentence briefing on what this module does and the specific threat it protects against. Make it feel like a real handoff, not a feature list.`,
        maxTokens: 140,
      }

    case 'deepfake_result': {
      const signals = Array.isArray(data.top_signals) ? data.top_signals as Array<{ name: string; value: number }> : []
      const signalsText = signals.length > 0
        ? signals.map((s) => `${s.name} ${s.value}%`).join(', ')
        : 'no named signals captured'
      const attribution = data.model_attribution as { model?: string; confidence?: number } | undefined
      const attributionText = attribution?.model
        ? `${attribution.model} at ${attribution.confidence}% confidence`
        : 'no specific generator identified'
      return {
        prompt: `The Operator ran Deepfake Intelligence on a ${fmt(data.file_type)} file. Full findings, not just the headline:
- Verdict: ${fmt(data.result)} at ${fmt(data.confidence_score)}% confidence
- AI-generation probability: ${fmt(data.ai_probability, 'not measured')}%
- Deepfake-specific probability: ${fmt(data.deepfake_probability, 'not measured')}%
- Named detector signals: ${signalsText}
- C2PA content credentials: ${data.c2pa_present ? (data.c2pa_valid ? 'present and valid' : 'present but not verifiably valid') : 'not present'}
- Likely generator: ${attributionText}
- The report already shown to the Operator says: "${fmt(data.existing_explanation, 'no report text available')}"

Give the Operator a real briefing, not a restatement of the report they already read. Interpret the evidence above for them: which signals actually drove this verdict and why, what the C2PA and attribution findings add (or don't), how confident you personally are given what's here, and the one concrete thing they should do next. If the evidence is thin, say so directly instead of padding it out.`,
        maxTokens: 480,
      }
    }

    case 'voice_result': {
      const indicators = Array.isArray(data.clone_indicators) ? data.clone_indicators as string[] : []
      return {
        prompt: `The Operator ran Voice Intelligence on an audio file. Full findings:
- Verdict: ${fmt(data.verdict)}
- Manipulation probability: ${fmt(data.manipulation_probability)}%
- Trust score: ${fmt(data.trust_score, 'not calculated')}
- Emotional manipulation score: ${fmt(data.emotional_manipulation_score, 'not measured')}%
- Clone indicators found: ${indicators.length > 0 ? indicators.join(', ') : 'none flagged'}
- The system's own note already shown to the Operator: "${fmt(data.existing_analysis, 'none')}"

Give the Operator a real briefing: explain what the manipulation and emotional-manipulation scores actually mean together (a high emotional score with low manipulation probability is a different threat than the reverse — call that out if it applies), walk through any clone indicators specifically, and close with a concrete next step.`,
        maxTokens: 420,
      }
    }

    case 'breach_result': {
      const breaches = Array.isArray(data.breach_names) ? data.breach_names as string[] : []
      return {
        prompt: `The Operator ran a Breach Detection check. Full findings:
- Check type: ${fmt(data.check_type)}
- Result: ${data.unavailable ? 'unavailable, no live data source was reachable for this check type' : (data.breached ? 'exposure found' : 'no exposure found')}
- Breaches/occurrences: ${fmt(data.breach_count)}
- Named breach sources: ${breaches.length > 0 ? breaches.join(', ') : 'none listed'}
- Severity: ${fmt(data.risk_level)}
- System message already shown: "${fmt(data.message, 'none')}"
- Recommendations already listed: ${Array.isArray(data.recommendations) && data.recommendations.length > 0 ? (data.recommendations as string[]).join('; ') : 'none listed'}

Give the Operator a real security advisory, not a restatement. If breaches were found, explain what kind of exposure this actually creates in practice (credential stuffing risk, phishing targeting, account takeover, etc — pick what's relevant to the named sources if any). If the check was unavailable, be straight about that being a gap, not a clean bill of health. Prioritize the recommendations instead of just listing them all flatly, and close with the single most urgent action.`,
        maxTokens: 400,
      }
    }

    case 'text_result':
      return {
        prompt: `The Operator ran Text AI Detection on a ${fmt(data.word_count)}-word passage. Full findings:
- Verdict: ${fmt(data.verdict)}
- AI-generation probability: ${fmt(data.ai_probability)}%
- Specific signals found: ${Array.isArray(data.signals) && (data.signals as string[]).length > 0 ? (data.signals as string[]).join(', ') : 'none flagged'}
- The report already shown to the Operator: "${fmt(data.existing_explanation, 'none')}"

Give the Operator a real linguistic forensics briefing: explain which specific signals actually drove this verdict and why they matter, be honest that text AI-detection is inherently probabilistic and can be wrong on either heavily-edited AI text or unusually uniform human writing, and close with a concrete next step (use with corroborating evidence, don't treat this as a courtroom-grade verdict on its own).`,
        maxTokens: 400,
      }

    case 'scam_link_result':
      return {
        prompt: `The Operator ran Scam Link Analysis. Full findings:
- Domain: ${fmt(data.domain)}
- Risk score: ${fmt(data.risk_score)}/100
- Verdict: ${fmt(data.verdict)}
- Threat type: ${fmt(data.threat_type, 'none categorized')}
- Indicators detected: ${Array.isArray(data.indicators) && (data.indicators as string[]).length > 0 ? (data.indicators as string[]).join(', ') : 'none flagged'}
- System advisory already shown: "${fmt(data.existing_analysis, 'none')}"

Give the Operator a real threat brief: name the specific indicators that drove this score and what tactic they point to (phishing kit, credential harvester, malware dropper, or genuinely benign), and end with a direct instruction on whether to visit, avoid, or report the link.`,
        maxTokens: 360,
      }

    case 'news_verify_result':
      return {
        prompt: `The Operator ran News/Content Verification. Full findings:
- Claim checked: "${fmt(data.content)}"
- Credibility score: ${fmt(data.credibility_score)}/100
- Verdict: ${fmt(data.verdict)}
- Source quality: ${fmt(data.source_quality)}
- Red flags found: ${Array.isArray(data.red_flags) && (data.red_flags as string[]).length > 0 ? (data.red_flags as string[]).join(', ') : 'none flagged'}
- Positive signals found: ${Array.isArray(data.positive_signals) && (data.positive_signals as string[]).length > 0 ? (data.positive_signals as string[]).join(', ') : 'none flagged'}
- System summary already shown: "${fmt(data.summary, 'none')}"

Give the Operator real media-literacy analysis: explain which specific red or positive flags actually moved the needle on this verdict and why they matter for this particular claim, then tell them plainly whether it's safe to share, needs verification first, or should be dismissed.`,
        maxTokens: 380,
      }

    case 'dashboard_load':
      return {
        prompt: `Operator dashboard loaded. Scans today: ${fmt(data.scans_today, '0')}. Threats detected: ${fmt(data.threats_detected, '0')}. Give a 1-2 sentence situational awareness brief that actually reacts to those numbers rather than a generic status line.`,
        maxTokens: 140,
      }

    case 'globe_country':
      if (data.overview) {
        return {
          prompt: `The Operator wants DAYE to go deeper on ${fmt(data.country)} from the Cyber Globe. Already on screen: threat level ${fmt(data.threatLevel)}/10 (${fmt(data.threatLabel)}). Overview already shown: "${fmt(data.overview)}"

Add something genuinely beyond the overview — a specific watch-item, a named threat actor or attack pattern relevant to this country, or a concrete defensive step for someone with exposure there. 2-4 sentences. Do not repeat the overview back.`,
          maxTokens: 320,
        }
      }
      return {
        prompt: `The Operator selected ${fmt(data.country)} on the Cyber Globe. Give a real cyber threat intelligence brief specific to this country: common attack types targeting it, notable incidents or actors if relevant, and its general threat posture. 2-3 sentences.`,
        maxTokens: 260,
      }

    case 'idle_tip':
      return {
        prompt: `Give the Operator one proactive, specific, actionable cybersecurity tip or threat awareness alert. Not generic advice ("use strong passwords") — something with real teeth and a reason it matters right now.`,
        maxTokens: 160,
      }

    default:
      return {
        prompt: `Give the Operator one specific, non-generic cybersecurity awareness message.`,
        maxTokens: 140,
      }
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { context_type, data } = await req.json()

    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY') ?? ''
    const geminiKey = Deno.env.get('GEMINI_API_KEY') ?? ''

    const { prompt, maxTokens } = buildPrompt({ context_type, data: data ?? {} })

    let message = 'DAYE is monitoring all systems. All threat detection modules are online.'
    let messageGenerated = false

    if (anthropicKey) {
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
            max_tokens: maxTokens,
            system: DAYE_PERSONA,
            messages: [{ role: 'user', content: prompt }],
          }),
        })

        if (claudeResponse.ok) {
          const cd = await claudeResponse.json() as { content?: Array<{ text?: string }> }
          message = cd.content?.[0]?.text || message
          messageGenerated = true
        } else {
          console.error('Claude API non-OK response:', claudeResponse.status, await claudeResponse.text())
        }
      } catch (claudeError) {
        console.error('Claude API error:', claudeError)
      }
    }

    if (!messageGenerated && geminiKey) {
      try {
        const geminiResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: prompt }] }],
              systemInstruction: { parts: [{ text: DAYE_PERSONA }] },
              generationConfig: { maxOutputTokens: maxTokens },
            }),
          }
        )

        if (geminiResponse.ok) {
          const gd = await geminiResponse.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> }
          message = gd.candidates?.[0]?.content?.parts?.[0]?.text || message
        } else {
          console.error('Gemini API non-OK response:', geminiResponse.status, await geminiResponse.text())
        }
      } catch (geminiError) {
        console.error('Gemini API error:', geminiError)
      }
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
