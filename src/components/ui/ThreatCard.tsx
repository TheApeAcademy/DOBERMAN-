import { AlertTriangle, Shield, AlertCircle, Info } from 'lucide-react'

type Severity = 'critical' | 'high' | 'medium' | 'low'

interface ThreatCardProps {
  title: string
  description?: string
  severity: Severity
  cve?: string
  recommendations?: string[]
}

const severityConfig: Record<Severity, { icon: typeof AlertTriangle; color: string; bg: string; border: string; label: string }> = {
  critical: {
    icon: AlertTriangle,
    color: '#FF3B3B',
    bg: 'rgba(255,59,59,0.08)',
    border: 'rgba(255,59,59,0.25)',
    label: 'CRITICAL',
  },
  high: {
    icon: AlertCircle,
    color: '#fb923c',
    bg: 'rgba(251,146,60,0.08)',
    border: 'rgba(251,146,60,0.25)',
    label: 'HIGH',
  },
  medium: {
    icon: AlertCircle,
    color: '#FFB020',
    bg: 'rgba(255,176,32,0.08)',
    border: 'rgba(255,176,32,0.25)',
    label: 'MEDIUM',
  },
  low: {
    icon: Info,
    color: '#00D46A',
    bg: 'rgba(0,212,106,0.08)',
    border: 'rgba(0,212,106,0.25)',
    label: 'LOW',
  },
}

export function ThreatCard({ title, description, severity, cve, recommendations }: ThreatCardProps) {
  const config = severityConfig[severity]
  const Icon = config.icon

  return (
    <div
      className="rounded-lg p-4 space-y-3"
      style={{
        background: config.bg,
        border: `1px solid ${config.border}`,
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <Icon size={16} style={{ color: config.color, marginTop: 2, flexShrink: 0 }} />
          <div>
            <p className="text-text-primary font-body text-sm font-medium">{title}</p>
            {cve && (
              <span className="text-xs font-label font-medium" style={{ color: config.color }}>
                {cve}
              </span>
            )}
          </div>
        </div>
        <span
          className="text-xs font-label font-medium px-2 py-0.5 rounded shrink-0"
          style={{ color: config.color, background: `${config.color}20` }}
        >
          {config.label}
        </span>
      </div>

      {description && (
        <p className="text-text-secondary text-xs font-body leading-relaxed pl-7">{description}</p>
      )}

      {recommendations && recommendations.length > 0 && (
        <div className="pl-7 space-y-1">
          {recommendations.map((rec, i) => (
            <div key={i} className="flex items-start gap-2">
              <Shield size={12} className="text-accent-blue mt-0.5 shrink-0" />
              <p className="text-text-secondary text-xs font-body">{rec}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
