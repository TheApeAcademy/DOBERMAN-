import { Brain, ArrowRight } from 'lucide-react'
import { dayeAskAbout } from './DayeAssistant'

interface AskDayeButtonProps {
  contextType: string
  data: Record<string, unknown>
  label?: string
}

/**
 * Drops a consistent "Ask DAYE" link onto any scan/result view. Clicking it
 * force-expands the floating DAYE bubble and feeds it this result's context,
 * so the Operator gets an immediate, relevant briefing instead of having to
 * open the bubble themselves and explain what they're looking at.
 */
export function AskDayeButton({ contextType, data, label = 'Ask DAYE about this' }: AskDayeButtonProps) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        dayeAskAbout({ context_type: contextType, data })
      }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '10px 18px',
        background: 'rgba(48,209,88,0.08)',
        border: '1px solid rgba(48,209,88,0.25)',
        borderRadius: 10,
        color: 'var(--safe)',
        fontFamily: 'Inter, sans-serif',
        fontWeight: 600,
        fontSize: 12,
        letterSpacing: '0.02em',
        cursor: 'pointer',
        transition: 'background 0.2s, border-color 0.2s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(48,209,88,0.14)'
        e.currentTarget.style.borderColor = 'rgba(48,209,88,0.4)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(48,209,88,0.08)'
        e.currentTarget.style.borderColor = 'rgba(48,209,88,0.25)'
      }}
    >
      <Brain size={13} />
      {label}
      <ArrowRight size={12} />
    </button>
  )
}
