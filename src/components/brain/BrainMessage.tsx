import { Zap } from 'lucide-react'
import type { ChatMessage } from '../../lib/supabase'
import { formatRelativeTime } from '../../lib/utils'

const SF = `-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif`

interface BrainMessageProps {
  message: ChatMessage
}

export function BrainMessage({ message }: BrainMessageProps) {
  const isUser = message.role === 'user'

  const renderContent = (content: string) => {
    const parts = content.split(/(```[\s\S]*?```|`[^`]+`|\*\*[^*]+\*\*)/g)
    return parts.map((part, i) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const code = part.slice(3, -3).replace(/^\w+\n/, '')
        return (
          <pre key={i} style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid var(--ovw-0p08)', borderRadius: 10, padding: '10px 12px', margin: '8px 0', overflowX: 'auto' }}>
            <code style={{ fontFamily: `'JetBrains Mono', 'SF Mono', monospace`, fontSize: 12, color: '#30D158', lineHeight: 1.5 }}>{code}</code>
          </pre>
        )
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={i} style={{ fontFamily: `'JetBrains Mono', 'SF Mono', monospace`, fontSize: 12, background: 'var(--ovw-0p06)', color: '#ABABAB', padding: '1px 6px', borderRadius: 5 }}>
            {part.slice(1, -1)}
          </code>
        )
      }
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} style={{ color: '#F5F5F7', fontWeight: 600 }}>{part.slice(2, -2)}</strong>
      }
      return part.split('\n').map((line, j, arr) => (
        <span key={`${i}-${j}`}>
          {line}
          {j < arr.length - 1 && <br />}
        </span>
      ))
    })
  }

  if (isUser) {
    return (
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
        <div style={{ maxWidth: '78%' }}>
          <div style={{
            background: 'rgba(48,209,88,0.1)',
            border: '1px solid rgba(48,209,88,0.18)',
            borderRadius: '18px 18px 4px 18px',
            padding: '10px 14px',
          }}>
            <p style={{ fontSize: 15, lineHeight: 1.5, color: 'var(--ovw-0p88)', fontFamily: SF, margin: 0 }}>
              {message.content}
            </p>
          </div>
          {message.timestamp && (
            <p style={{ fontSize: 11, color: 'var(--ovw-0p22)', textAlign: 'right', marginTop: 4, fontFamily: SF }}>
              {formatRelativeTime(message.timestamp)}
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', gap: 10 }}>
      <div style={{
        width: 28,
        height: 28,
        borderRadius: 9,
        background: 'rgba(48,209,88,0.08)',
        border: '1px solid rgba(48,209,88,0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        marginTop: 2,
      }}>
        <Zap size={13} style={{ color: '#30D158' }} />
      </div>
      <div style={{ maxWidth: '84%' }}>
        <div style={{
          background: 'var(--ovw-0p04)',
          border: '1px solid var(--ovw-0p07)',
          borderRadius: '18px 18px 18px 4px',
          padding: '10px 14px',
        }}>
          <p style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--ovw-0p75)', fontFamily: SF, margin: 0 }}>
            {renderContent(message.content)}
          </p>
        </div>
        {message.timestamp && (
          <p style={{ fontSize: 11, color: 'var(--ovw-0p22)', marginTop: 4, fontFamily: SF }}>
            {formatRelativeTime(message.timestamp)}
          </p>
        )}
      </div>
    </div>
  )
}

export function TypingIndicator() {
  return (
    <div style={{ display: 'flex', gap: 10 }}>
      <div style={{
        width: 28,
        height: 28,
        borderRadius: 9,
        background: 'rgba(48,209,88,0.08)',
        border: '1px solid rgba(48,209,88,0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Zap size={13} style={{ color: '#30D158' }} />
      </div>
      <div style={{
        background: 'var(--ovw-0p04)',
        border: '1px solid var(--ovw-0p07)',
        borderRadius: '18px 18px 18px 4px',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 5,
      }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#30D158',
              animation: 'pulse 1.4s ease-in-out infinite',
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>
    </div>
  )
}
