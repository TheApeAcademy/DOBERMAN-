import { useEffect, useState } from 'react'
import { getRiskColor, getRiskLabel } from '../../lib/utils'

interface RiskMeterProps {
  score: number
  size?: 'sm' | 'md' | 'lg'
  label?: string
}

export function RiskMeter({ score, size = 'md', label }: RiskMeterProps) {
  const [displayed, setDisplayed] = useState(0)
  const color = getRiskColor(score)
  const riskLabel = label || getRiskLabel(score)

  useEffect(() => {
    let start = 0
    const step = score / 60
    const timer = setInterval(() => {
      start += step
      if (start >= score) {
        setDisplayed(score)
        clearInterval(timer)
      } else {
        setDisplayed(Math.floor(start))
      }
    }, 16)
    return () => clearInterval(timer)
  }, [score])

  const sizes = {
    sm: { outer: 80, stroke: 6, text: 'text-xl', sub: 'text-xs' },
    md: { outer: 120, stroke: 8, text: 'text-3xl', sub: 'text-sm' },
    lg: { outer: 160, stroke: 10, text: 'text-5xl', sub: 'text-base' },
  }

  const { outer, stroke, text, sub } = sizes[size]
  const radius = (outer - stroke * 2) / 2
  const circumference = 2 * Math.PI * radius
  const progress = circumference - (displayed / 100) * circumference

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: outer, height: outer }}>
        <svg width={outer} height={outer} className="rotate-[-90deg]">
          <circle
            cx={outer / 2}
            cy={outer / 2}
            r={radius}
            fill="none"
            stroke="#21262D"
            strokeWidth={stroke}
          />
          <circle
            cx={outer / 2}
            cy={outer / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={progress}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.05s linear', filter: `drop-shadow(0 0 6px ${color}60)` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`${text} font-display text-text-primary leading-none`} style={{ color }}>
            {displayed}
          </span>
          <span className={`${sub} font-label text-text-muted leading-none mt-1`}>/ 100</span>
        </div>
      </div>
      <span
        className="font-label font-medium text-xs tracking-widest px-3 py-1 rounded"
        style={{ color, background: `${color}20`, border: `1px solid ${color}40` }}
      >
        {riskLabel}
      </span>
    </div>
  )
}
