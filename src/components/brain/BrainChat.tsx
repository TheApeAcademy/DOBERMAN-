import { useState, useRef, useEffect } from 'react'
import { Send, Zap, AlertCircle, Plus } from 'lucide-react'
import { BrainMessage, TypingIndicator } from './BrainMessage'
import type { ChatMessage } from '../../lib/supabase'

const STARTER_PROMPTS = [
  'How do I secure my home network against intrusion?',
  'What is a deepfake and how do I detect one?',
  'My IoT camera might be compromised — what should I do?',
  'Explain zero-day exploits and how they\'re weaponized',
]

interface BrainChatProps {
  messages: ChatMessage[]
  onSend: (content: string) => void
  loading: boolean
  error: string | null
  dailyRemaining: number
  onUpgradeClick: () => void
  prefillMessage?: string | null
}

export function BrainChat({ messages, onSend, loading, error, dailyRemaining, onUpgradeClick, prefillMessage }: BrainChatProps) {
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    if (prefillMessage) {
      setInput(prefillMessage)
      setTimeout(() => inputRef.current?.focus(), 150)
    }
  }, [prefillMessage])

  const handleSend = () => {
    if (!input.trim() || loading || dailyRemaining <= 0) return
    onSend(input.trim())
    setInput('')
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const hasMessages = messages.length > 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative', background: '#000' }}>

      {/* ─── WATERMARK ─────────────────────────────────────────────── */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 0,
          pointerEvents: 'none',
          zIndex: 0,
          overflow: 'hidden',
          userSelect: 'none',
        }}
      >
        {Array.from({ length: 12 }).map((_, row) => (
          <div key={row} style={{ display: 'flex', gap: 48, flexWrap: 'nowrap', whiteSpace: 'nowrap', transform: row % 2 === 0 ? 'translateX(-24px)' : 'translateX(24px)' }}>
            {Array.from({ length: 6 }).map((_, col) => (
              <span
                key={col}
                style={{
                  fontFamily: 'Bebas Neue',
                  fontSize: 13,
                  letterSpacing: '0.35em',
                  color: 'rgba(0,212,106,0.035)',
                  textTransform: 'uppercase',
                  lineHeight: 3.2,
                }}
              >
                DOBERMAN INTELLIGENCE
              </span>
            ))}
          </div>
        ))}
      </div>

      {/* ─── TOP BAR ───────────────────────────────────────────────── */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        padding: '12px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(20px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: '#000',
            border: '1px solid rgba(0,212,106,0.25)',
            overflow: 'hidden',
          }}>
            <video
              autoPlay muted loop playsInline preload="auto"
              style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
            >
              <source src="/assets/video/blob-di.mp4" type="video/mp4" />
            </video>
          </div>
          <div>
            <p style={{ fontFamily: 'Bebas Neue', fontSize: 16, letterSpacing: '0.2em', color: 'var(--safe)', lineHeight: 1 }}>
              DOBERMAN INTELLIGENCE
            </p>
            <p style={{ fontFamily: 'Inter', fontSize: 9, color: 'var(--text-3)', letterSpacing: '0.03em', marginTop: 1 }}>
              THREAT ANALYSIS · SECURITY GUIDANCE · REAL-TIME INTEL
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', gap: 2 }}>
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                style={{
                  width: 7,
                  height: 3,
                  borderRadius: 2,
                  background: i < dailyRemaining ? 'var(--safe)' : 'rgba(255,255,255,0.08)',
                  transition: 'background 0.3s',
                }}
              />
            ))}
          </div>
          <span style={{ fontFamily: 'Inter', fontSize: 10, color: 'var(--text-3)' }}>
            {dailyRemaining}/10
          </span>
        </div>
      </div>

      {/* ─── MESSAGES ──────────────────────────────────────────────── */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        position: 'relative',
        zIndex: 1,
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(255,255,255,0.08) transparent',
      }}>
        {!hasMessages ? (
          /* Empty state */
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100%',
            padding: '40px 24px',
            gap: 32,
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: 64,
                height: 64,
                borderRadius: 20,
                background: 'rgba(0,212,106,0.08)',
                border: '1px solid rgba(0,212,106,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
              }}>
                <Zap size={28} style={{ color: 'var(--safe)' }} />
              </div>
              <h2 style={{ fontFamily: 'Bebas Neue', fontSize: 28, letterSpacing: '0.2em', color: 'var(--text-1)', marginBottom: 8 }}>
                DOBERMAN INTELLIGENCE
              </h2>
              <p style={{ fontFamily: 'Inter', fontSize: 14, color: 'var(--text-3)', maxWidth: 400, lineHeight: 1.6 }}>
                Your AI-powered security analyst. Ask about threats, vulnerabilities, network defense, or anything cybersecurity.
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 10,
              width: '100%',
              maxWidth: 560,
            }}>
              {STARTER_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => onSend(prompt)}
                  disabled={dailyRemaining <= 0}
                  style={{
                    padding: '14px 16px',
                    textAlign: 'left',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 12,
                    fontFamily: 'Inter',
                    fontSize: 13,
                    color: 'var(--text-2)',
                    lineHeight: 1.5,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 8,
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLButtonElement
                    el.style.background = 'rgba(0,212,106,0.06)'
                    el.style.borderColor = 'rgba(0,212,106,0.2)'
                    el.style.color = 'var(--text-1)'
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLButtonElement
                    el.style.background = 'rgba(255,255,255,0.03)'
                    el.style.borderColor = 'rgba(255,255,255,0.08)'
                    el.style.color = 'var(--text-2)'
                  }}
                >
                  <Plus size={12} style={{ color: 'var(--text-3)', marginTop: 2, flexShrink: 0 }} />
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ maxWidth: 760, margin: '0 auto', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 4 }}>
            {messages.map((msg, i) => (
              <BrainMessage key={i} message={msg} />
            ))}
            {loading && <TypingIndicator />}

            {error && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '12px 16px',
                borderRadius: 12,
                background: 'rgba(255,59,59,0.08)',
                border: '1px solid rgba(255,59,59,0.2)',
                margin: '8px 0',
              }}>
                <AlertCircle size={14} style={{ color: 'var(--danger)', flexShrink: 0 }} />
                <p style={{ fontFamily: 'Inter', fontSize: 13, color: 'var(--danger)' }}>{error}</p>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
        {!hasMessages && <div ref={bottomRef} />}
      </div>

      {/* ─── INPUT ─────────────────────────────────────────────────── */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        padding: '16px 20px 20px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(20px)',
      }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          {dailyRemaining <= 0 ? (
            <button
              onClick={onUpgradeClick}
              style={{
                width: '100%',
                padding: '14px',
                background: 'rgba(255,59,59,0.08)',
                border: '1px solid rgba(255,59,59,0.3)',
                borderRadius: 14,
                fontFamily: 'Inter',
                fontWeight: 700,
                fontSize: 14,
                color: 'var(--danger)',
                cursor: 'pointer',
              }}
            >
              Daily limit reached — Upgrade to Pro for unlimited queries
            </button>
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: 10,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 16,
              padding: '10px 12px 10px 16px',
              transition: 'border-color 0.2s',
            }}
              onFocusCapture={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(0,212,106,0.3)' }}
              onBlurCapture={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.1)' }}
            >
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask Doberman Intelligence anything..."
                rows={1}
                style={{
                  flex: 1,
                  background: 'none',
                  border: 'none',
                  outline: 'none',
                  resize: 'none',
                  fontFamily: 'Inter',
                  fontSize: 15,
                  color: 'var(--text-1)',
                  lineHeight: 1.5,
                  minHeight: '24px',
                  maxHeight: '160px',
                  overflow: 'auto',
                  padding: 0,
                  scrollbarWidth: 'none',
                }}
                onInput={(e) => {
                  const el = e.currentTarget
                  el.style.height = 'auto'
                  el.style.height = Math.min(el.scrollHeight, 160) + 'px'
                }}
                disabled={loading}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: input.trim() && !loading ? 'var(--safe)' : 'rgba(255,255,255,0.06)',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: !input.trim() || loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  flexShrink: 0,
                }}
              >
                <Send size={15} style={{ color: input.trim() && !loading ? '#000' : 'rgba(255,255,255,0.2)' }} />
              </button>
            </div>
          )}
          <p style={{ fontFamily: 'Inter', fontSize: 10, color: 'rgba(255,255,255,0.18)', textAlign: 'center', marginTop: 8, letterSpacing: '0.05em' }}>
            Enter to send · Shift+Enter for new line · Doberman Intelligence v1
          </p>
        </div>
      </div>
    </div>
  )
}
