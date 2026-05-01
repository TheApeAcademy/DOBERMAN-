import { useEffect, useState } from 'react'

interface ConfidenceBarProps {
  score: number
  label?: string
  colorMode?: 'inverse' | 'normal'
}

export function ConfidenceBar({ score, label = 'Confidence', colorMode = 'normal' }: ConfidenceBarProps) {
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => setWidth(score), 100)
    return () => clearTimeout(timer)
  }, [score])

  const getColor = () => {
    if (colorMode === 'inverse') {
      if (score >= 70) return '#FF3B3B'
      if (score >= 40) return '#FFB020'
      return '#00D46A'
    }
    if (score >= 70) return '#00D46A'
    if (score >= 40) return '#FFB020'
    return '#FF3B3B'
  }

  const color = getColor()

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-label text-text-secondary">{label}</span>
        <span className="text-xs font-body font-medium" style={{ color }}>
          {score}%
        </span>
      </div>
      <div className="h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${width}%`,
            background: color,
            boxShadow: `0 0 8px ${color}80`,
          }}
        />
      </div>
    </div>
  )
}
