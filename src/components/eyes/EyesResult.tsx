import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, XCircle, AlertCircle, ChevronDown, ChevronUp, Brain } from 'lucide-react'
import type { EyesScan } from '../../lib/supabase'

interface EyesResultProps {
  scan: EyesScan
}

const resultConfig = {
  authentic: {
    icon: CheckCircle,
    color: '#1A9F57',
    bg: 'rgba(26,159,87,0.06)',
    border: 'rgba(26,159,87,0.18)',
    label: 'AUTHENTIC',
    desc: 'This media appears genuine and unmanipulated.',
  },
  fake: {
    icon: XCircle,
    color: '#E5292A',
    bg: 'rgba(229,41,42,0.06)',
    border: 'rgba(229,41,42,0.18)',
    label: 'LIKELY FAKE',
    desc: 'Significant manipulation indicators detected.',
  },
  uncertain: {
    icon: AlertCircle,
    color: '#CC7A00',
    bg: 'rgba(204,122,0,0.06)',
    border: 'rgba(204,122,0,0.18)',
    label: 'UNCERTAIN',
    desc: 'Inconclusive — manual review recommended.',
  },
}

export function EyesResult({ scan }: EyesResultProps) {
  const [expanded, setExpanded] = useState(false)
  const navigate = useNavigate()
  const config = resultConfig[scan.result] || resultConfig.uncertain
  const Icon = config.icon
  const trustScore = Math.round(scan.confidence_score)

  const handleAskDoberman = () => {
    const msg = `I just ran a deepfake analysis on a file called "${scan.file_name}" (${scan.file_type}). The verdict was "${config.label}" with a confidence score of ${trustScore}/100. The analyst report said: "${scan.explanation}". Can you help me understand what this means and what I should do next?`
    navigate('/brain', { state: { prefill: msg } })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* Verdict */}
      <div style={{ padding: '18px 20px', borderRadius: 14, background: config.bg, border: `1px solid ${config.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <Icon size={22} style={{ color: config.color, flexShrink: 0 }} />
          <div>
            <p style={{ fontFamily: 'Bebas Neue', fontSize: 26, letterSpacing: '0.1em', color: config.color, lineHeight: 1 }}>{config.label}</p>
            <p style={{ fontFamily: 'Syne', fontSize: 12, color: '#6B6B70', marginTop: 2 }}>{config.desc}</p>
          </div>
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.14em', color: '#8E8E93', textTransform: 'uppercase' }}>Trust Score</span>
            <span style={{ fontFamily: 'Bebas Neue', fontSize: 28, lineHeight: 1, color: config.color }}>{trustScore}</span>
          </div>
          <div style={{ height: 5, background: 'rgba(0,0,0,0.08)', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${trustScore}%`, background: config.color, borderRadius: 3, transition: 'width 0.6s ease' }} />
          </div>
        </div>
      </div>

      {/* Analyst report */}
      <div style={{ padding: '16px 18px', borderRadius: 14, background: '#FAFAFA', border: '1px solid rgba(0,0,0,0.06)' }}>
        <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.16em', color: '#8E8E93', textTransform: 'uppercase', marginBottom: 10 }}>Analyst Report</p>
        <p style={{ fontFamily: 'Syne', fontSize: 13, color: '#44454B', lineHeight: 1.7 }}>{scan.explanation}</p>
        <button
          onClick={() => setExpanded(!expanded)}
          style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 10, background: 'none', border: 'none', fontFamily: 'JetBrains Mono', fontSize: 10, color: '#8E8E93', letterSpacing: '0.06em' }}
        >
          {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          {expanded ? 'COLLAPSE' : 'HOW IT WORKS'}
        </button>
        {expanded && (
          <div style={{ marginTop: 10, padding: '12px 14px', background: '#F5F5F7', borderRadius: 10, border: '1px solid rgba(0,0,0,0.05)' }}>
            <p style={{ fontFamily: 'Syne', fontSize: 12, color: '#6B6B70', lineHeight: 1.7, marginBottom: 8 }}>
              D0B3RMAN analyzes media for synthetic manipulation markers — facial landmark inconsistencies, unnatural blinking, lighting artifacts, and audio-visual sync issues characteristic of AI-generated content.
            </p>
            <p style={{ fontFamily: 'Syne', fontSize: 12, color: '#6B6B70', lineHeight: 1.7 }}>
              Scores above 70 indicate high confidence. Between 40-70 is uncertain. Below 40 suggests authentic. Always seek additional verification in high-stakes situations.
            </p>
          </div>
        )}
      </div>

      {/* File metadata */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {[
          { label: 'File', value: scan.file_name },
          { label: 'Type', value: scan.file_type?.toUpperCase() },
          { label: 'Verdict', value: config.label },
          { label: 'Score', value: `${trustScore} / 100` },
        ].map(({ label, value }) => (
          <div key={label} style={{ padding: '12px 14px', background: '#FAFAFA', borderRadius: 10, border: '1px solid rgba(0,0,0,0.05)' }}>
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.12em', color: '#8E8E93', textTransform: 'uppercase', marginBottom: 4 }}>{label}</p>
            <p style={{ fontFamily: 'Syne', fontSize: 13, fontWeight: 600, color: '#0F0F0F', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Ask DOBERMAN */}
      <button onClick={handleAskDoberman} className="ask-doberman-btn" style={{ width: '100%', justifyContent: 'center', padding: '12px 18px' }}>
        <Brain size={14} />
        DISCUSS WITH DOBERMAN INTELLIGENCE
      </button>
    </div>
  )
}
