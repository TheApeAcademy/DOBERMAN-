import { Brain, User } from 'lucide-react'
import type { ChatMessage } from '../../lib/supabase'
import { formatRelativeTime } from '../../lib/utils'

interface BrainMessageProps {
  message: ChatMessage
}

export function BrainMessage({ message }: BrainMessageProps) {
  const isUser = message.role === 'user'

  const renderContent = (content: string) => {
    // Simple markdown-like rendering for code blocks and bold
    const parts = content.split(/(```[\s\S]*?```|`[^`]+`|\*\*[^*]+\*\*)/g)
    return parts.map((part, i) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const code = part.slice(3, -3).replace(/^\w+\n/, '')
        return (
          <pre key={i} className="bg-bg-primary border border-border-color rounded-lg p-3 my-2 overflow-x-auto">
            <code className="text-accent-green font-mono text-xs">{code}</code>
          </pre>
        )
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={i} className="bg-bg-primary text-accent-blue px-1.5 py-0.5 rounded text-xs font-mono">
            {part.slice(1, -1)}
          </code>
        )
      }
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="text-text-primary font-medium">{part.slice(2, -2)}</strong>
      }
      // Handle newlines
      return part.split('\n').map((line, j) => (
        <span key={`${i}-${j}`}>
          {line}
          {j < part.split('\n').length - 1 && <br />}
        </span>
      ))
    })
  }

  if (isUser) {
    return (
      <div className="flex justify-end gap-3">
        <div className="max-w-[80%] space-y-1">
          <div className="bg-accent-blue/15 border border-accent-blue/20 rounded-xl rounded-br-sm px-4 py-3">
            <p className="text-text-primary font-body text-sm leading-relaxed">{message.content}</p>
          </div>
          {message.timestamp && (
            <p className="text-text-muted font-label text-xs text-right">{formatRelativeTime(message.timestamp)}</p>
          )}
        </div>
        <div className="w-7 h-7 rounded-full bg-accent-blue/20 flex items-center justify-center shrink-0 mt-1">
          <User size={14} className="text-accent-blue" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-3">
      <div className="w-7 h-7 rounded-full bg-green-900/30 border border-green-800/30 flex items-center justify-center shrink-0 mt-1">
        <Brain size={14} className="text-accent-green" />
      </div>
      <div className="max-w-[85%] space-y-1">
        <div className="bg-bg-secondary border border-border-color rounded-xl rounded-bl-sm px-4 py-3">
          <p className="text-text-secondary font-body text-sm leading-relaxed">
            {renderContent(message.content)}
          </p>
        </div>
        {message.timestamp && (
          <p className="text-text-muted font-label text-xs">{formatRelativeTime(message.timestamp)}</p>
        )}
      </div>
    </div>
  )
}

export function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="w-7 h-7 rounded-full bg-green-900/30 border border-green-800/30 flex items-center justify-center shrink-0">
        <Brain size={14} className="text-accent-green" />
      </div>
      <div className="bg-bg-secondary border border-border-color rounded-xl rounded-bl-sm px-4 py-3">
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-accent-green"
              style={{
                animation: 'pulse 1.4s ease-in-out infinite',
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
