import { useEffect, useState } from 'react'
import { ExternalLink } from 'lucide-react'
import type { NoseScan } from '../../lib/supabase'
import { formatRelativeTime, getRiskColor, getRiskLabel } from '../../lib/utils'

interface NoseScanHistoryProps {
  userId: string
  getHistory: () => Promise<NoseScan[]>
  onSelect: (scan: NoseScan) => void
}

export function NoseScanHistory({ userId, getHistory, onSelect }: NoseScanHistoryProps) {
  const [scans, setScans] = useState<NoseScan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getHistory().then((data) => {
      setScans(data)
      setLoading(false)
    })
  }, [userId])

  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-12 bg-bg-tertiary rounded animate-pulse" />
        ))}
      </div>
    )
  }

  if (scans.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-text-muted font-body text-sm">No scans yet. Analyze your first network above.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border-color">
            {['Environment', 'Risk Score', 'Risk Level', 'Date', ''].map((h) => (
              <th key={h} className="pb-3 text-left text-text-muted font-label text-xs tracking-wide font-medium px-2 first:pl-0">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border-color">
          {scans.map((scan) => {
            const color = getRiskColor(scan.overall_risk_score)
            const label = getRiskLabel(scan.overall_risk_score)
            return (
              <tr key={scan.id} className="hover:bg-bg-tertiary/50 transition-colors">
                <td className="py-3 px-2 pl-0">
                  <p className="text-text-primary font-body text-sm max-w-48 truncate">
                    {scan.environment_description?.slice(0, 50) || 'Network scan'}...
                  </p>
                </td>
                <td className="py-3 px-2">
                  <span className="font-display text-xl" style={{ color }}>
                    {scan.overall_risk_score}
                  </span>
                </td>
                <td className="py-3 px-2">
                  <span
                    className="text-xs font-label font-medium px-2 py-0.5 rounded"
                    style={{ color, background: `${color}15` }}
                  >
                    {label}
                  </span>
                </td>
                <td className="py-3 px-2">
                  <span className="text-text-muted font-label text-xs">{formatRelativeTime(scan.created_at)}</span>
                </td>
                <td className="py-3 px-2">
                  <button
                    onClick={() => onSelect(scan)}
                    className="text-text-muted hover:text-purple-400 transition-colors"
                  >
                    <ExternalLink size={14} />
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
