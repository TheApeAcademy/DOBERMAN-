import { useState } from 'react'
import { ChevronDown, ChevronRight, Shield, Download } from 'lucide-react'
import type { NoseScan, DeviceResult } from '../../lib/supabase'
import { RiskMeter } from '../ui/RiskMeter'
import { ThreatCard } from '../ui/ThreatCard'
import { getRiskColor, getRiskLabel } from '../../lib/utils'

interface NoseResultProps {
  scan: NoseScan
}

function DeviceCard({ device }: { device: DeviceResult }) {
  const [open, setOpen] = useState(false)
  const color = getRiskColor(device.risk_score)
  const label = getRiskLabel(device.risk_score)

  return (
    <div className="card overflow-hidden">
      <button
        className="w-full flex items-center justify-between p-4 hover:bg-bg-tertiary transition-colors"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-display"
            style={{ background: `${color}15`, color }}
          >
            {device.risk_score}
          </div>
          <div className="text-left">
            <p className="text-text-primary font-body text-sm font-medium">{device.name}</p>
            <p className="text-text-muted font-label text-xs mt-0.5">
              {device.vulnerabilities?.length || 0} vulnerabilities detected
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="text-xs font-label font-medium px-2 py-0.5 rounded"
            style={{ color, background: `${color}15` }}
          >
            {label}
          </span>
          {open ? <ChevronDown size={14} className="text-text-muted" /> : <ChevronRight size={14} className="text-text-muted" />}
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-border-color pt-4 page-fade">
          {device.vulnerabilities?.length > 0 && (
            <div className="space-y-2">
              <p className="text-text-muted font-label text-xs tracking-wide">VULNERABILITIES</p>
              {device.vulnerabilities.map((vuln, i) => (
                <ThreatCard
                  key={i}
                  title={vuln.title}
                  cve={vuln.cve}
                  severity={vuln.severity?.toLowerCase() as 'critical' | 'high' | 'medium' | 'low' || 'medium'}
                />
              ))}
            </div>
          )}

          {device.recommendations?.length > 0 && (
            <div className="space-y-2">
              <p className="text-text-muted font-label text-xs tracking-wide">RECOMMENDED FIXES</p>
              <div className="space-y-1.5">
                {device.recommendations.map((rec, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <Shield size={12} className="text-accent-blue mt-1 shrink-0" />
                    <p className="text-text-secondary font-body text-xs">{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function NoseResult({ scan }: NoseResultProps) {
  const actionPlan = scan.vulnerabilities as {
    action_plan?: {
      critical?: string[]
      high?: string[]
      medium?: string[]
      low?: string[]
    }
  }

  const exportReport = () => {
    const report = [
      'DOBERMAN NETWORK SECURITY REPORT',
      '='.repeat(40),
      `Date: ${new Date(scan.created_at).toLocaleString()}`,
      `Overall Risk Score: ${scan.overall_risk_score}/100`,
      '',
      'ENVIRONMENT',
      scan.environment_description,
      '',
      'DEVICE ANALYSIS',
      ...scan.devices.map((d) =>
        `\n${d.name} (Risk: ${d.risk_score})\n${d.vulnerabilities.map((v) => `  - ${v.title} (${v.cve})`).join('\n')}\n  Recommendations:\n${d.recommendations.map((r) => `    * ${r}`).join('\n')}`
      ),
    ].join('\n')

    const blob = new Blob([report], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `doberman-report-${Date.now()}.txt`
    a.click()
  }

  const severityLevels = [
    { key: 'critical', color: '#FF3B3B', items: actionPlan?.action_plan?.critical || [] },
    { key: 'high', color: '#fb923c', items: actionPlan?.action_plan?.high || [] },
    { key: 'medium', color: '#FFB020', items: actionPlan?.action_plan?.medium || [] },
    { key: 'low', color: '#00D46A', items: actionPlan?.action_plan?.low || [] },
  ]

  return (
    <div className="space-y-6 page-fade">
      {/* Overall risk */}
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <RiskMeter score={scan.overall_risk_score} size="lg" />
          <div className="flex-1 space-y-3 text-center sm:text-left">
            <div>
              <p className="font-heading font-bold text-text-primary text-lg">Network Risk Assessment</p>
              <p className="text-text-secondary font-body text-sm mt-1">
                {scan.devices?.length || 0} devices analyzed across your environment.
              </p>
            </div>
            <button onClick={exportReport} className="btn-secondary text-sm inline-flex">
              <Download size={14} />
              Export Report
            </button>
          </div>
        </div>
      </div>

      {/* Devices */}
      {scan.devices?.length > 0 && (
        <div>
          <p className="font-label text-xs text-text-muted tracking-wide mb-3">DEVICE BREAKDOWN</p>
          <div className="space-y-2">
            {scan.devices.map((device, i) => (
              <DeviceCard key={i} device={device} />
            ))}
          </div>
        </div>
      )}

      {/* Action plan */}
      <div className="card p-5">
        <p className="font-label text-xs text-text-muted tracking-wide mb-4">ACTION PLAN</p>
        <div className="space-y-4">
          {severityLevels.map(({ key, color, items }) =>
            items.length > 0 ? (
              <div key={key}>
                <p
                  className="font-label text-xs font-medium tracking-widest mb-2"
                  style={{ color }}
                >
                  {key.toUpperCase()}
                </p>
                <div className="space-y-1.5 pl-3 border-l-2" style={{ borderColor: `${color}40` }}>
                  {items.map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <Shield size={12} style={{ color }} className="mt-0.5 shrink-0" />
                      <p className="text-text-secondary font-body text-xs">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null
          )}
        </div>
      </div>
    </div>
  )
}
