import { useState, useRef, useEffect } from 'react'
import { Send, Brain, AlertCircle } from 'lucide-react'
import { BrainMessage, TypingIndicator } from './BrainMessage'
import type { ChatMessage } from '../../lib/supabase'

const STARTER_PROMPTS = [
  'How do I secure my home network?',
  'What is a deepfake and how do I spot one?',
  'My IoT camera might be compromised - what should I do?',
  'Explain phishing attacks and how to avoid them',
]

interface BrainChatProps {
  messages: ChatMessage[]
  onSend: (content: string) => void
  loading: boolean
  error: string | null
  dailyRemaining: number
  onUpgradeClick: () => void
}

export function BrainChat({ messages, onSend, loading, error, dailyRemaining, onUpgradeClick }: BrainChatProps) {
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const handleSend = () => {
    if (!input.trim() || loading || dailyRemaining <= 0) return
    onSend(input.trim())
    setInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Daily limit bar */}
      <div className="px-4 py-2 border-b border-border-color flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain size={14} className="text-accent-green" />
          <span className="text-text-muted font-label text-xs">AI Security Analyst</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-0.5">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="w-2 h-1 rounded-sm"
                style={{ background: i < dailyRemaining ? '#00D46A' : '#21262D' }}
              />
            ))}
          </div>
          <span className="text-text-muted font-label text-xs">{dailyRemaining}/10</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full space-y-6 py-8">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 mx-auto rounded-full bg-green-900/20 border border-green-800/30 flex items-center justify-center">
                <Brain size={20} className="text-accent-green" />
              </div>
              <p className="font-heading font-bold text-text-primary">DOBERMAN BRAIN</p>
              <p className="text-text-muted font-body text-sm max-w-sm">
                Your dedicated AI security analyst. Ask me anything about cybersecurity threats, vulnerabilities, and best practices.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
              {STARTER_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => onSend(prompt)}
                  disabled={dailyRemaining <= 0}
                  className="p-3 text-left bg-bg-tertiary border border-border-color rounded-lg hover:border-accent-green/30 hover:bg-green-900/10 transition-all text-xs font-body text-text-secondary"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => (
              <BrainMessage key={i} message={msg} />
            ))}
            {loading && <TypingIndicator />}
          </>
        )}

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-900/20 border border-red-800/40">
            <AlertCircle size={14} className="text-accent-red shrink-0" />
            <p className="text-accent-red font-body text-sm">{error}</p>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border-color">
        {dailyRemaining <= 0 ? (
          <button onClick={onUpgradeClick} className="w-full btn-danger py-3">
            Daily limit reached - Upgrade to Pro
          </button>
        ) : (
          <div className="flex gap-2 items-end">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask DOBERMAN anything about cybersecurity..."
                rows={1}
                className="input pr-10 resize-none overflow-hidden"
                style={{ minHeight: '42px', maxHeight: '120px' }}
                onInput={(e) => {
                  const el = e.currentTarget
                  el.style.height = 'auto'
                  el.style.height = Math.min(el.scrollHeight, 120) + 'px'
                }}
                disabled={loading}
              />
            </div>
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="w-10 h-10 rounded-lg flex items-center justify-center transition-all shrink-0"
              style={{
                background: input.trim() && !loading ? '#00D46A' : '#21262D',
                cursor: !input.trim() || loading ? 'not-allowed' : 'pointer',
              }}
            >
              <Send size={16} className={input.trim() && !loading ? 'text-black' : 'text-text-muted'} />
            </button>
          </div>
        )}
        <p className="text-text-muted font-label text-xs mt-2 text-center">
          Enter to send - Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}
