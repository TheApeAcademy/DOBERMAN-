import { useState, useRef, useEffect } from 'react'
import { ArrowUp, Mic, Paperclip, Zap, AlertCircle } from 'lucide-react'
import { BrainMessage, TypingIndicator } from './BrainMessage'
import type { ChatMessage } from '../../lib/supabase'

const SF = `-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif`

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
}

export function BrainChat({ messages, onSend, loading, error }: BrainChatProps) {
  const [input, setInput] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const handleSend = () => {
    if (!input.trim() || loading) return
    onSend(input.trim())
    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleMic = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) return
    if (isRecording) {
      recognitionRef.current?.stop()
      return
    }
    const r = new SR()
    r.continuous = false
    r.interimResults = false
    r.lang = 'en-US'
    recognitionRef.current = r
    r.onresult = (ev: any) => {
      const t = ev.results[0][0].transcript
      setInput(prev => prev ? `${prev} ${t}` : t)
    }
    r.onend = () => setIsRecording(false)
    r.start()
    setIsRecording(true)
  }

  const canSend = !!input.trim() && !loading

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', fontFamily: SF }}>

      {/* Usage indicator */}
      <div style={{
        padding: '10px 18px',
        borderBottom: '1px solid var(--ovw-0p05)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Zap size={11} style={{ color: '#30D158' }} />
          <span style={{ fontSize: 11, color: 'var(--ovw-0p3)', fontWeight: 500, letterSpacing: '0.01em' }}>
            Doberman Intelligence
          </span>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {messages.length === 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            gap: 22,
            padding: '20px 0',
          }}>
            <div style={{
              width: 58,
              height: 58,
              borderRadius: 18,
              background: 'rgba(48,209,88,0.07)',
              border: '1px solid rgba(48,209,88,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Zap size={24} style={{ color: '#30D158' }} />
            </div>

            <span style={{
              fontSize: 20,
              fontWeight: 600,
              color: 'var(--ovw-0p85)',
              letterSpacing: '-0.03em',
              textAlign: 'center',
            }}>
              Doberman Intelligence
            </span>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, width: '100%', maxWidth: 400 }}>
              {STARTER_PROMPTS.map((p) => (
                <button
                  key={p}
                  onClick={() => onSend(p)}
                  style={{
                    padding: '12px 13px',
                    textAlign: 'left',
                    background: 'var(--ovw-0p03)',
                    border: '1px solid var(--ovw-0p07)',
                    borderRadius: 14,
                    fontSize: 12,
                    fontWeight: 400,
                    lineHeight: 1.45,
                    color: 'var(--ovw-0p5)',
                    fontFamily: SF,
                    transition: 'background 0.15s, border-color 0.15s',
                    cursor: 'pointer',
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => <BrainMessage key={i} message={msg} />)}
            {loading && <TypingIndicator />}
          </>
        )}

        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 14px',
            borderRadius: 12,
            background: 'rgba(255,45,45,0.07)',
            border: '1px solid rgba(255,45,45,0.18)',
          }}>
            <AlertCircle size={13} style={{ color: '#FF2D2D', flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: '#FF2D2D', fontFamily: SF }}>{error}</span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div style={{ padding: '10px 12px 22px', borderTop: '1px solid var(--ovw-0p05)', flexShrink: 0 }}>
          <div style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: 6,
            background: 'var(--ovw-0p04)',
            border: '1px solid var(--ovw-0p09)',
            borderRadius: 24,
            padding: '7px 7px 7px 14px',
          }}>
            {/* Attachment */}
            <button
              onClick={() => fileInputRef.current?.click()}
              title="Attach image, audio or video"
              style={{
                flexShrink: 0,
                width: 32,
                height: 32,
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--ovw-0p06)',
                border: 'none',
                marginBottom: 0,
              }}
            >
              <Paperclip size={15} style={{ color: 'var(--ovw-0p38)' }} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,audio/*,video/*"
              style={{ display: 'none' }}
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) setInput(prev => prev ? `${prev} [${file.name}]` : `[${file.name}]`)
                e.target.value = ''
              }}
            />

            {/* Text area */}
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Doberman Intelligence"
              rows={1}
              disabled={loading}
              style={{
                flex: 1,
                background: 'none',
                border: 'none',
                outline: 'none',
                resize: 'none',
                fontSize: 15,
                fontFamily: SF,
                color: 'var(--ovw-0p88)',
                lineHeight: 1.5,
                paddingTop: 5,
                minHeight: 26,
                maxHeight: 120,
              }}
              onInput={(e) => {
                const el = e.currentTarget
                el.style.height = 'auto'
                el.style.height = Math.min(el.scrollHeight, 120) + 'px'
              }}
            />

            {/* Mic */}
            <button
              onClick={handleMic}
              title="Voice note"
              style={{
                flexShrink: 0,
                width: 32,
                height: 32,
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: isRecording ? 'rgba(255,45,45,0.18)' : 'var(--ovw-0p06)',
                border: isRecording ? '1px solid rgba(255,45,45,0.4)' : 'none',
                transition: 'all 0.15s',
              }}
            >
              <Mic size={15} style={{ color: isRecording ? '#FF2D2D' : 'var(--ovw-0p38)' }} />
            </button>

            {/* Send */}
            <button
              onClick={handleSend}
              disabled={!canSend}
              style={{
                flexShrink: 0,
                width: 32,
                height: 32,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: canSend ? '#30D158' : 'var(--ovw-0p06)',
                border: 'none',
                transition: 'background 0.15s',
              }}
            >
              <ArrowUp size={15} style={{ color: canSend ? '#000' : 'var(--ovw-0p22)' }} />
            </button>
          </div>
      </div>
    </div>
  )
}
