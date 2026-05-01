import { CheckCircle, XCircle, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import type { EyesScan } from '../../lib/supabase'
import { ConfidenceBar } from '../ui/ConfidenceBar'

interface EyesResultProps {
  scan: EyesScan
}

const resultConfig = {
  authentic: {
    icon: CheckCircle,
    color: '#00D46A',
    bg: 'rgba(0,212,106,0.08)',
    border: 'rgba(0,212,106,0.25)',
    label: 'AUTHENTIC',
    desc: 'This media appears to be genuine and unmanipulated.',
  },
  fake: {
    icon: XCircle,
    color: '#FF3B3B',
    bg: 'rgba(255,59,59,0.08)',
    border: 'rgba(255,59,59,0.25)',
    label: 'LIKELY FAKE',
    desc: 'Significant manipulation indicators detected in this media.',
  },
  uncertain: {
    icon: AlertCircle,
    color: '#FFB020',
    bg: 'rgba(255,176,32,0.08)',
    border: 'rgba(255,176,32,0.25)',
    label: 'UNCERTAIN',
    desc: 'Inconclusive results - manual review recommended.',
  },
}

export function EyesResult({ scan }: EyesResultProps) {
  const [expanded, setExpanded] = useState(false)
  const config = resultConfig[scan.result] || resultConfig.uncertain
  const Icon = config.icon
  return (
    <div className="space-y-4 page-fade">
      {/* Main result card */}
      <div
        className="rounded-xl p-6 space-y-5"
        style={{ background: config.bg, border: `1px solid ${config.border}` }}
      >
        <div className="flex items-center gap-3">
          <Icon size={24} style={{ color: config.color }} />
          <div>
            <p
              className="font-display text-3xl tracking-wider"
              style={{ color: config.color }}
            >
              {config.label}
            </p>
            <p className="text-text-secondary font-body text-sm">{config.desc}</p>
          </div>
        </div>

        {/* Trust score */}
        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <span className="text-text-secondary font-label text-xs tracking-wide">TRUST SCORE</span>
            <span
              className="font-display text-5xl leading-none"
              style={{ color: config.color }}
            >
              {Math.round(scan.confidence_score)}
            </span>
          </div>
          <ConfidenceBar
            score={scan.confidence_score}
            label="Analysis confidence"
            colorMode={scan.result === 'fake' ? 'inverse' : 'normal'}
          />
        </div>
      </div>

      {/* Explanation */}
      <div className="card p-5 space-y-3">
        <p className="font-label font-medium text-xs text-text-muted tracking-wide">ANALYST REPORT</p>
        <p className="text-text-secondary font-body text-sm leading-relaxed">
          {scan.explanation}
        </p>

        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 text-accent-blue text-xs font-label font-medium hover:underline"
        >
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {expanded ? 'Hide' : 'What does this mean?'}
        </button>

        {expanded && (
          <div className="p-4 bg-bg-tertiary rounded-lg border border-border-color space-y-2 page-fade">
            <p className="text-text-secondary font-body text-xs leading-relaxed">
              DOBERMAN uses the Hive AI Moderation system to analyze your media for synthetic manipulation markers.
              Deepfake detection works by looking for inconsistencies in facial landmarks, unnatural blinking patterns,
              lighting artifacts, audio-visual sync issues, and compression anomalies that are characteristic of
              AI-generated or AI-manipulated media.
            </p>
            <p className="text-text-secondary font-body text-xs leading-relaxed">
              A score above 70% indicates high confidence in the result. Between 40-70% indicates uncertainty,
              and below 40% suggests the media is likely authentic. Always treat uncertain results with caution
              and seek additional verification for high-stakes situations.
            </p>
          </div>
        )}
      </div>

      {/* File info */}
      <div className="card p-4">
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'File Name', value: scan.file_name },
            { label: 'Type', value: scan.file_type?.toUpperCase() },
            { label: 'Result', value: config.label },
            { label: 'Score', value: `${Math.round(scan.confidence_score)}%` },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-text-muted font-label text-xs">{label}</p>
              <p className="text-text-primary font-body text-sm mt-0.5">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
