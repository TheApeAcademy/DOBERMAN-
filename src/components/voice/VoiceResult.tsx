import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react'
import { AskDayeButton } from '../daye/AskDayeButton'
import type { VoiceScan } from '../../lib/supabase'

const VOICE_VERDICT_CONFIG = {
  authentic: { color: '#30D158', icon: CheckCircle, label: 'AUTHENTIC' },
  likely_authentic: { color: '#30D158', icon: CheckCircle, label: 'LIKELY AUTHENTIC' },
  uncertain: { color: '#FF9500', icon: AlertTriangle, label: 'UNCERTAIN' },
  likely_ai: { color: '#FF9500', icon: AlertTriangle, label: 'LIKELY AI GENERATED' },
  certain_ai: { color: '#FF2D2D', icon: XCircle, label: 'AI GENERATED' },
}

export function VoiceResult({ scan }: { scan: VoiceScan }) {
  const config = VOICE_VERDICT_CONFIG[scan.verdict] || VOICE_VERDICT_CONFIG.uncertain
  const VIcon = config.icon

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <VIcon size={20} style={{ color: config.color }} />
          <span style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, sans-serif', fontSize: 24, letterSpacing: '0.1em', color: config.color }}>{config.label}</span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, sans-serif', fontSize: 36, letterSpacing: '0.05em', color: config.color, lineHeight: 1 }}>{scan.trust_score}</p>
          <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-3)', letterSpacing: '0.1em' }}>TRUST SCORE</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={{ padding: '14px', background: 'var(--ovw-0p03)', border: '1px solid var(--ovw-0p07)', borderRadius: 12 }}>
          <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-3)', letterSpacing: '0.12em', marginBottom: 6 }}>MANIPULATION PROBABILITY</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, sans-serif', fontSize: 28, color: config.color }}>{scan.manipulation_probability}</span>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--text-3)' }}>%</span>
          </div>
        </div>
        <div style={{ padding: '14px', background: 'var(--ovw-0p03)', border: '1px solid var(--ovw-0p07)', borderRadius: 12 }}>
          <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-3)', letterSpacing: '0.12em', marginBottom: 6 }}>EMOTIONAL MANIPULATION</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, sans-serif', fontSize: 28, color: scan.emotional_manipulation_score >= 60 ? 'var(--danger)' : 'var(--text-2)' }}>
              {scan.emotional_manipulation_score}
            </span>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--text-3)' }}>%</span>
          </div>
        </div>
      </div>

      <div style={{ height: 3, background: 'var(--void-4)', borderRadius: 2 }}>
        <div style={{ height: '100%', borderRadius: 2, background: config.color, width: `${scan.manipulation_probability}%`, boxShadow: `0 0 8px ${config.color}50` }} />
      </div>

      {scan.clone_indicators && scan.clone_indicators.length > 0 && (
        <div>
          <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.15em', color: 'var(--text-3)', marginBottom: 10 }}>VOICE CLONE INDICATORS</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {scan.clone_indicators.map((ind, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <AlertTriangle size={11} style={{ color: 'var(--warning)', flexShrink: 0, marginTop: 2 }} />
                <span style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, sans-serif', fontSize: 12, color: 'var(--text-2)' }}>{ind}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {scan.daye_analysis && (
        <div style={{ padding: '14px 16px', background: 'var(--ovw-0p03)', border: '1px solid var(--ovw-0p08)', borderRadius: 12 }}>
          <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.15em', color: 'var(--text-3)', marginBottom: 8 }}>DAYE VOICE INTELLIGENCE</p>
          <p style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, sans-serif', fontSize: 13, color: 'var(--text-1)', lineHeight: 1.65 }}>{scan.daye_analysis}</p>
        </div>
      )}

      <AskDayeButton
        contextType="voice_result"
        data={{
          verdict: scan.verdict,
          manipulation_probability: scan.manipulation_probability,
          trust_score: scan.trust_score,
          emotional_manipulation_score: scan.emotional_manipulation_score,
          clone_indicators: scan.clone_indicators,
          existing_analysis: scan.daye_analysis,
        }}
      />

      <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-3)', textAlign: 'center' }}>{scan.file_name}</p>
    </div>
  )
}
