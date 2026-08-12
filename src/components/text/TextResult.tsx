import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react'
import { AskDayeButton } from '../daye/AskDayeButton'
import type { TextScan } from '../../lib/supabase'

const TEXT_VERDICT_CONFIG = {
  human: { color: '#30D158', icon: CheckCircle, label: 'HUMAN-WRITTEN' },
  likely_human: { color: '#30D158', icon: CheckCircle, label: 'LIKELY HUMAN' },
  uncertain: { color: '#FF9500', icon: AlertTriangle, label: 'UNCERTAIN' },
  likely_ai: { color: '#FF9500', icon: AlertTriangle, label: 'LIKELY AI-GENERATED' },
  ai_generated: { color: '#FF2D2D', icon: XCircle, label: 'AI-GENERATED' },
}

export function TextResult({ scan }: { scan: TextScan }) {
  const config = TEXT_VERDICT_CONFIG[scan.verdict] || TEXT_VERDICT_CONFIG.uncertain
  const TIcon = config.icon

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <TIcon size={20} style={{ color: config.color }} />
          <span style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, sans-serif', fontSize: 24, letterSpacing: '0.1em', color: config.color }}>{config.label}</span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, sans-serif', fontSize: 36, letterSpacing: '0.05em', color: config.color, lineHeight: 1 }}>{scan.ai_probability}</p>
          <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-3)', letterSpacing: '0.1em' }}>AI PROBABILITY</p>
        </div>
      </div>

      <div style={{ height: 3, background: 'var(--void-4)', borderRadius: 2 }}>
        <div style={{ height: '100%', borderRadius: 2, background: config.color, width: `${scan.ai_probability}%`, boxShadow: `0 0 8px ${config.color}50` }} />
      </div>

      {scan.signals && scan.signals.length > 0 && (
        <div>
          <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.15em', color: 'var(--text-3)', marginBottom: 10 }}>SIGNALS DETECTED</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {scan.signals.map((sig, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <AlertTriangle size={11} style={{ color: 'var(--warning)', flexShrink: 0, marginTop: 2 }} />
                <span style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, sans-serif', fontSize: 12, color: 'var(--text-2)' }}>{sig}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {scan.explanation && (
        <div style={{ padding: '14px 16px', background: 'var(--ovw-0p03)', border: '1px solid var(--ovw-0p08)', borderRadius: 12 }}>
          <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.15em', color: 'var(--text-3)', marginBottom: 8 }}>DAYE ANALYST REPORT</p>
          <p style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, sans-serif', fontSize: 13, color: 'var(--text-1)', lineHeight: 1.65 }}>{scan.explanation}</p>
        </div>
      )}

      <AskDayeButton
        contextType="text_result"
        data={{
          verdict: scan.verdict,
          ai_probability: scan.ai_probability,
          word_count: scan.word_count,
          signals: scan.signals,
          existing_explanation: scan.explanation,
        }}
      />

      <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-3)', textAlign: 'center' }}>{scan.word_count} words analyzed</p>
    </div>
  )
}
