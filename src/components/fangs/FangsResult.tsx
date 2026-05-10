import { useState } from 'react'
import { Shield, AlertTriangle, CheckCircle, HelpCircle, Download, ChevronDown, ChevronRight, Users } from 'lucide-react'
import type { FangsScan, ThreatIndicator, CVEReference } from '../../lib/supabase'
import { RiskMeter } from '../ui/RiskMeter'
import { formatDate } from '../../lib/utils'

const VERDICT_CONFIG = {
  malicious: { color: '#FF3B3B', bg: 'rgba(255,59,59,0.08)', border: 'rgba(255,59,59,0.25)', icon: AlertTriangle, label: 'MALICIOUS' },
  suspicious: { color: '#FFB020', bg: 'rgba(255,176,32,0.08)', border: 'rgba(255,176,32,0.25)', icon: AlertTriangle, label: 'SUSPICIOUS' },
  clean: { color: '#00D46A', bg: 'rgba(0,212,106,0.08)', border: 'rgba(0,212,106,0.25)', icon: CheckCircle, label: 'CLEAN' },
  unknown: { color: 'rgba(255,255,255,0.5)', bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.12)', icon: HelpCircle, label: 'UNKNOWN' },
}

const SEVERITY_COLOR: Record<string, string> = {
  critical: '#FF3B3B',
  high: '#fb923c',
  medium: '#FFB020',
  low: '#00D46A',
}

function IndicatorRow({ indicator }: { indicator: ThreatIndicator }) {
  const [open, setOpen] = useState(false)
  const confColor = indicator.confidence >= 80 ? '#FF3B3B' : indicator.confidence >= 50 ? '#FFB020' : '#00D46A'

  return (
    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 8, marginBottom: 8 }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{ width: '100%', background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '4px 0' }}
      >
        <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.1em', color: 'var(--text-3)', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: 4, flexShrink: 0, textTransform: 'uppercase' }}>
          {indicator.type}
        </span>
        <span style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--text-1)', flex: 1, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {indicator.value}
        </span>
        <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: confColor, flexShrink: 0 }}>
          {indicator.confidence}%
        </span>
        {open ? <ChevronDown size={12} style={{ color: 'var(--text-3)', flexShrink: 0 }} /> : <ChevronRight size={12} style={{ color: 'var(--text-3)', flexShrink: 0 }} />}
      </button>
      {open && indicator.description && (
        <p style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--text-2)', lineHeight: 1.6, paddingLeft: 8, marginTop: 6 }}>
          {indicator.description}
        </p>
      )}
    </div>
  )
}

function CVERow({ cve }: { cve: CVEReference }) {
  const color = SEVERITY_COLOR[cve.severity?.toLowerCase()] || 'var(--text-3)'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color, fontWeight: 600, flexShrink: 0 }}>{cve.id}</span>
      <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-2)', flex: 1 }}>{cve.description}</span>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2, flexShrink: 0 }}>
        <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color, background: `${color}18`, padding: '1px 5px', borderRadius: 4 }}>
          {cve.severity?.toUpperCase()}
        </span>
        {cve.cvss > 0 && (
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-3)' }}>CVSS {cve.cvss}</span>
        )}
      </div>
    </div>
  )
}

interface FangsResultProps {
  scan: FangsScan
}

export function FangsResult({ scan }: FangsResultProps) {
  const config = VERDICT_CONFIG[scan.verdict] || VERDICT_CONFIG.unknown
  const VerdictIcon = config.icon

  const exportReport = () => {
    const lines = [
      'D0B3RMAN THREAT ANALYSIS REPORT',
      '='.repeat(40),
      `Date: ${formatDate(scan.created_at)}`,
      `Verdict: ${scan.verdict.toUpperCase()}`,
      `Risk Score: ${scan.risk_score}/100`,
      `Threat Name: ${scan.threat_name || 'N/A'}`,
      `Input: [${scan.input_type.toUpperCase()}] ${scan.input_value}`,
      '',
      'ANALYSIS',
      scan.description,
    ]

    if (scan.indicators?.length) {
      lines.push('', 'INDICATORS OF COMPROMISE')
      scan.indicators.forEach((ind) => {
        lines.push(`  [${ind.type}] ${ind.value} (${ind.confidence}% confidence)`)
        if (ind.description) lines.push(`    ${ind.description}`)
      })
    }

    if (scan.cves?.length) {
      lines.push('', 'CVE REFERENCES')
      scan.cves.forEach((c) => lines.push(`  ${c.id} [${c.severity}] CVSS ${c.cvss} - ${c.description}`))
    }

    if (scan.apt_groups?.length) {
      lines.push('', 'ATTRIBUTED THREAT ACTORS')
      scan.apt_groups.forEach((g) => lines.push(`  - ${g}`))
    }

    if (scan.recommendations?.length) {
      lines.push('', 'ACTION PLAN')
      scan.recommendations.forEach((r, i) => lines.push(`  ${i + 1}. ${r}`))
    }

    const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `doberman-threat-${Date.now()}.txt`
    a.click()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Verdict header */}
      <div style={{ padding: '20px 24px', borderRadius: 16, background: config.bg, border: `1px solid ${config.border}`, display: 'flex', alignItems: 'center', gap: 20 }}>
        <RiskMeter score={scan.risk_score} size="md" />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <VerdictIcon size={16} style={{ color: config.color }} />
            <span style={{ fontFamily: 'Bebas Neue', fontSize: 28, letterSpacing: '0.1em', color: config.color }}>{config.label}</span>
          </div>
          {scan.threat_name && (
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: 11, letterSpacing: '0.1em', color: 'var(--text-2)', marginBottom: 6 }}>
              {scan.threat_name}
            </p>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.1em', color: 'var(--text-3)', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: 4 }}>
              {scan.input_type.toUpperCase()}
            </span>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.1em', color: 'var(--text-3)', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: 4 }}>
              {scan.threat_type.toUpperCase()}
            </span>
          </div>
        </div>
        <button
          onClick={exportReport}
          style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 12px', color: 'var(--text-3)', fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.1em', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}
        >
          <Download size={12} />
          EXPORT
        </button>
      </div>

      {/* Description */}
      <div style={{ padding: '16px 18px', borderRadius: 14, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.15em', color: 'var(--text-3)', marginBottom: 10, textTransform: 'uppercase' }}>Analysis</p>
        <p style={{ fontFamily: 'Syne', fontSize: 13, color: 'var(--text-2)', lineHeight: 1.7 }}>{scan.description}</p>
      </div>

      {/* Indicators of Compromise */}
      {scan.indicators?.length > 0 && (
        <div style={{ padding: '16px 18px', borderRadius: 14, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.15em', color: 'var(--text-3)', marginBottom: 12, textTransform: 'uppercase' }}>
            Indicators of Compromise ({scan.indicators.length})
          </p>
          {scan.indicators.map((ind, i) => <IndicatorRow key={i} indicator={ind} />)}
        </div>
      )}

      {/* CVE References */}
      {scan.cves?.length > 0 && (
        <div style={{ padding: '16px 18px', borderRadius: 14, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.15em', color: 'var(--text-3)', marginBottom: 12, textTransform: 'uppercase' }}>
            CVE References ({scan.cves.length})
          </p>
          {scan.cves.map((cve, i) => <CVERow key={i} cve={cve} />)}
        </div>
      )}

      {/* APT Groups */}
      {scan.apt_groups?.length > 0 && (
        <div style={{ padding: '16px 18px', borderRadius: 14, background: 'rgba(255,45,45,0.04)', border: '1px solid rgba(255,45,45,0.15)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Users size={13} style={{ color: 'var(--danger)' }} />
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.15em', color: 'var(--danger)', textTransform: 'uppercase' }}>
              Attributed Threat Actors
            </p>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {scan.apt_groups.map((group, i) => (
              <span key={i} style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--danger)', background: 'rgba(255,45,45,0.08)', border: '1px solid rgba(255,45,45,0.2)', padding: '4px 12px', borderRadius: 6 }}>
                {group}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Action Plan */}
      {scan.recommendations?.length > 0 && (
        <div style={{ padding: '16px 18px', borderRadius: 14, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.15em', color: 'var(--text-3)', marginBottom: 12, textTransform: 'uppercase' }}>Action Plan</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {scan.recommendations.map((rec, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <span style={{ fontFamily: 'Bebas Neue', fontSize: 18, lineHeight: 1.1, color: 'var(--text-3)', flexShrink: 0, width: 20, textAlign: 'right' }}>{i + 1}</span>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, flex: 1 }}>
                  <Shield size={12} style={{ color: 'var(--chrome-mid)', marginTop: 2, flexShrink: 0 }} />
                  <p style={{ fontFamily: 'Syne', fontSize: 13, color: 'var(--text-2)', lineHeight: 1.55 }}>{rec}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
