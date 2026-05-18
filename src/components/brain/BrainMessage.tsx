import { User } from 'lucide-react'
import type { ChatMessage } from '../../lib/supabase'
import { formatRelativeTime } from '../../lib/utils'

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
          <pre
            key={i}
            style={{
              background: 'rgba(0,0,0,0.6)',
              border: '1px solid rgba(0,212,106,0.15)',
              borderRadius: 10,
              padding: '12px 16px',
              margin: '8px 0',
              overflowX: 'auto',
              fontFamily: 'Inter',
              fontSize: 12,
              color: 'var(--safe)',
              lineHeight: 1.6,
            }}
          >
            <code>{code}</code>
          </pre>
        )
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code
            key={i}
            style={{
              background: 'rgba(0,212,106,0.08)',
              border: '1px solid rgba(0,212,106,0.15)',
              color: 'var(--safe)',
              padding: '1px 6px',
              borderRadius: 4,
              fontFamily: 'Inter',
              fontSize: 12,
            }}
          >
            {part.slice(1, -1)}
          </code>
        )
      }
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} style={{ color: 'var(--text-1)', fontWeight: 600 }}>
            {part.slice(2, -2)}
          </strong>
        )
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
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        padding: '10px 0',
        gap: 10,
        alignItems: 'flex-start',
      }}>
        <div style={{ maxWidth: '75%' }}>
          <div style={{
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '18px 18px 4px 18px',
            padding: '12px 16px',
          }}>
            <p style={{
              fontFamily: 'Inter',
              fontSize: 14,
              color: 'var(--text-1)',
              lineHeight: 1.6,
              margin: 0,
            }}>
              {message.content}
            </p>
          </div>
          {message.timestamp && (
            <p style={{
              fontFamily: 'Inter',
              fontSize: 10,
              color: 'rgba(255,255,255,0.2)',
              textAlign: 'right',
              marginTop: 4,
            }}>
              {formatRelativeTime(message.timestamp)}
            </p>
          )}
        </div>
        <div style={{
          width: 30,
          height: 30,
          borderRadius: 8,
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          marginTop: 2,
        }}>
          <User size={14} style={{ color: 'rgba(255,255,255,0.4)' }} />
        </div>
      </div>
    )
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'flex-start',
      padding: '10px 0',
      gap: 10,
      alignItems: 'flex-start',
    }}>
      <div style={{
        width: 36,
        height: 36,
        borderRadius: 10,
        background: '#000',
        border: '1px solid rgba(0,212,106,0.25)',
        overflow: 'hidden',
        flexShrink: 0,
        marginTop: 2,
      }}>
        <video
          autoPlay muted loop playsInline preload="auto"
          style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
        >
          <source src="/assets/video/blob-di.mp4" type="video/mp4" />
        </video>
      </div>
      <div style={{ maxWidth: '80%' }}>
        <p style={{
          fontFamily: 'Inter',
          fontSize: 9,
          letterSpacing: '0.15em',
          color: 'rgba(0,212,106,0.5)',
          marginBottom: 6,
          textTransform: 'uppercase',
        }}>
          D.I. — Doberman Intelligence
        </p>
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '4px 18px 18px 18px',
          padding: '14px 18px',
        }}>
          <p style={{
            fontFamily: 'Inter',
            fontSize: 14,
            color: 'var(--text-2)',
            lineHeight: 1.7,
            margin: 0,
          }}>
            {renderContent(message.content)}
          </p>
        </div>
        {message.timestamp && (
          <p style={{
            fontFamily: 'Inter',
            fontSize: 10,
            color: 'rgba(255,255,255,0.2)',
            marginTop: 4,
          }}>
            {formatRelativeTime(message.timestamp)}
          </p>
        )}
      </div>
    </div>
  )
}

export function TypingIndicator() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'flex-start',
      padding: '10px 0',
      gap: 10,
      alignItems: 'flex-start',
    }}>
      <div style={{
        width: 36,
        height: 36,
        borderRadius: 10,
        background: '#000',
        border: '1px solid rgba(0,212,106,0.25)',
        overflow: 'hidden',
        flexShrink: 0,
      }}>
        <video
          autoPlay muted loop playsInline preload="auto"
          style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
        >
          <source src="/assets/video/blob-di.mp4" type="video/mp4" />
        </video>
      </div>
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '4px 18px 18px 18px',
        padding: '14px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
      }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: 'var(--safe)',
              animation: 'di-pulse 1.4s ease-in-out infinite',
              animationDelay: `${i * 0.2}s`,
              opacity: 0.6,
            }}
          />
        ))}
        <style>{`@keyframes di-pulse { 0%,80%,100%{transform:scale(0.8);opacity:0.4} 40%{transform:scale(1.1);opacity:1} }`}</style>
      </div>
    </div>
  )
}
