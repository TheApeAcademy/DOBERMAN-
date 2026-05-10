import { useEffect, useState } from 'react'
import { ExternalLink } from 'lucide-react'
import type { FangsScan } from '../../lib/supabase'
import { formatRelativeTime, getRiskColor } from '../../lib/utils'

const VERDICT_COLORS = {
  malicious: '#FF3B3B',
  suspicious: '#FFB020',
  clean: '#00D46A',
  unknown: 'rgba(255,255,255,0.3)',
}

interface FangsScanHistoryProps {
  userId: string
  getHistory: () => Promise<FangsScan[]>
  onSelect: (scan: FangsScan) => void
}

export function FangsScanHistory({ userId, getHistory, onSelect }: FangsScanHistoryProps) {
  const [scans, setScans] = useState<FangsScan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getHistory().then((data) => {
      setScans(data)
      setLoading(false)
    })
  }, [userId])

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[...Array(3)].map((_, i) => (
          <div key={i} style={{ height: 44, background: 'rgba(255,255,255,0.03)', borderRadius: 10, animation: 'pulse 1.5s ease-in-out infinite' }} />
        ))}
        <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
      </div>
    )
  }

  if (scans.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '32px 0' }}>
        <p style={{ fontFamily: 'JetBrains Mono', fontSize: 12, color: 'var(--text-3)' }}>No threat analyses yet. Run your first scan above.</p>
      </div>
    )
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            {['Input', 'Type', 'Verdict', 'Risk', 'Date', ''].map((h) => (
              <th key={h} style={{ paddingBottom: 10, textAlign: 'left', fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.15em', color: 'var(--text-3)', fontWeight: 500, paddingRight: 12 }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {scans.map((scan) => {
            const riskColor = getRiskColor(scan.risk_score)
            const verdictColor = VERDICT_COLORS[scan.verdict] || 'var(--text-3)'
            return (
              <tr key={scan.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <td style={{ padding: '10px 12px 10px 0', maxWidth: 180 }}>
                  <p style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {scan.input_value?.slice(0, 40)}{scan.input_value?.length > 40 ? '...' : ''}
                  </p>
                  {scan.threat_name && (
                    <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-3)', marginTop: 2 }}>{scan.threat_name}</p>
                  )}
                </td>
                <td style={{ padding: '10px 12px 10px 0' }}>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.08em', color: 'var(--text-3)', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: 4 }}>
                    {scan.input_type?.toUpperCase()}
                  </span>
                </td>
                <td style={{ padding: '10px 12px 10px 0' }}>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, fontWeight: 600, color: verdictColor, background: `${verdictColor}18`, padding: '2px 8px', borderRadius: 5 }}>
                    {scan.verdict?.toUpperCase()}
                  </span>
                </td>
                <td style={{ padding: '10px 12px 10px 0' }}>
                  <span style={{ fontFamily: 'Bebas Neue', fontSize: 20, color: riskColor }}>{scan.risk_score}</span>
                </td>
                <td style={{ padding: '10px 12px 10px 0' }}>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-3)' }}>{formatRelativeTime(scan.created_at)}</span>
                </td>
                <td style={{ padding: '10px 0 10px 0' }}>
                  <button
                    onClick={() => onSelect(scan)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-1)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-3)' }}
                  >
                    <ExternalLink size={13} />
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
