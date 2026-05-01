import { useEffect, useState } from 'react'
import { Image, Video, Music, ExternalLink } from 'lucide-react'
import type { EyesScan } from '../../lib/supabase'
import { formatRelativeTime, getResultLabel } from '../../lib/utils'

interface EyesScanHistoryProps {
  userId: string
  getHistory: () => Promise<EyesScan[]>
  onSelect: (scan: EyesScan) => void
}

export function EyesScanHistory({ userId, getHistory, onSelect }: EyesScanHistoryProps) {
  const [scans, setScans] = useState<EyesScan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getHistory().then((data) => {
      setScans(data)
      setLoading(false)
    })
  }, [userId])

  const TypeIcon = ({ type }: { type: string }) => {
    if (type === 'image') return <Image size={14} className="text-text-muted" />
    if (type === 'video') return <Video size={14} className="text-text-muted" />
    return <Music size={14} className="text-text-muted" />
  }

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
        <p className="text-text-muted font-body text-sm">No scans yet. Upload your first file above.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border-color">
            {['File', 'Type', 'Result', 'Score', 'Date', ''].map((h) => (
              <th key={h} className="pb-3 text-left text-text-muted font-label text-xs tracking-wide font-medium px-2 first:pl-0">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border-color">
          {scans.map((scan) => {
            const { label, color } = getResultLabel(scan.result)
            return (
              <tr key={scan.id} className="hover:bg-bg-tertiary/50 transition-colors">
                <td className="py-3 px-2 pl-0">
                  <p className="text-text-primary font-body text-sm max-w-32 truncate">{scan.file_name}</p>
                </td>
                <td className="py-3 px-2">
                  <TypeIcon type={scan.file_type} />
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
                  <span className="font-body text-sm" style={{ color }}>
                    {Math.round(scan.confidence_score)}%
                  </span>
                </td>
                <td className="py-3 px-2">
                  <span className="text-text-muted font-label text-xs">{formatRelativeTime(scan.created_at)}</span>
                </td>
                <td className="py-3 px-2">
                  <button
                    onClick={() => onSelect(scan)}
                    className="text-text-muted hover:text-accent-blue transition-colors"
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
