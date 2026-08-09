import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useDragControls } from 'framer-motion'
import { ChevronDown, Send, Mic, MicOff, Paperclip } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

export type DayeEventPayload = {
  context_type: string
  data: Record<string, unknown>
  message?: string
  forceOpen?: boolean
}

export function dayeNotify(event: DayeEventPayload) {
  window.dispatchEvent(new CustomEvent('daye:update', { detail: event }))
}

// Like dayeNotify, but expands the floating bubble so the Operator sees the
// contextual reply immediately instead of only getting a "new message" dot.
// This is what "Ask DAYE" links on scan results call.
export function dayeAskAbout(event: Omit<DayeEventPayload, 'forceOpen'>) {
  dayeNotify({ ...event, forceOpen: true })
}

const PAGE_MESSAGES: Record<string, string> = {
  '/dashboard': 'Operator, your threat overview is ready. All detection systems are online.',
  '/deepfake': 'Deepfake Intelligence active. Upload media and I will analyze for synthetic markers.',
  '/daye': 'DAYE Intelligence online. Ask me anything or use the Scam Link Analyzer.',
  '/breach': 'Breach System ready. I will check if your credentials have been compromised in known data breaches.',
  '/globe': 'Cyber Globe active. Select any country for a real-time threat intelligence briefing.',
  '/news': 'Content verification module ready. Paste any claim and I will assess its credibility.',
  '/history': 'This is your complete intelligence record. Every scan, every threat I detected.',
  '/settings': 'Settings panel open. Your security configuration is in your hands.',
  '/profile': 'Profile management active. Keep your operator credentials current.',
  '/nose': 'IoT Intelligence module active. Describe your network and I will map every vulnerability.',
}

interface ChatBubble { role: 'user' | 'daye'; text: string }

interface DayeAssistantProps {
  userId?: string
}

export function DayeAssistant({ userId }: DayeAssistantProps) {
  const [open, setOpen] = useState(false)
  const [hasNewMessage, setHasNewMessage] = useState(false)
  const [loading, setLoading] = useState(false)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [conversation, setConversation] = useState<ChatBubble[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const dragControls = useDragControls()
  const recognitionRef = useRef<{ stop(): void } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const conversationIdRef = useRef<string | undefined>(undefined)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    // A fresh page means fresh context — don't let messages from a previous
    // page's conversation (e.g. a different scan's results) bleed into the
    // next brain_conversations thread.
    conversationIdRef.current = undefined
    const pageMsg = PAGE_MESSAGES[location.pathname]
    if (pageMsg) {
      setConversation([{ role: 'daye', text: pageMsg }])
      setHasNewMessage(true)
      const t = setTimeout(() => setHasNewMessage(false), 3500)
      return () => clearTimeout(t)
    }
  }, [location.pathname])

  useEffect(() => {
    const handleDayeEvent = async (e: Event) => {
      const event = (e as CustomEvent<DayeEventPayload>).detail
      if (event.forceOpen) setOpen(true)

      if (event.message) {
        setConversation(prev => [...prev.slice(-8), { role: 'daye', text: event.message! }])
        setHasNewMessage(true)
        setTimeout(() => setHasNewMessage(false), 4000)
        return
      }

      if (!userId) {
        if (event.forceOpen) {
          setConversation(prev => [...prev.slice(-8), { role: 'daye', text: 'Sign in to get a DAYE briefing on this.' }])
        }
        return
      }
      setLoading(true)
      try {
        const { data } = await supabase.functions.invoke('daye-assistant', {
          body: { context_type: event.context_type, data: event.data },
        })
        if (data?.message) {
          setConversation(prev => [...prev.slice(-8), { role: 'daye', text: data.message }])
          setHasNewMessage(true)
          setTimeout(() => setHasNewMessage(false), 4500)
        }
      } catch (_) {}
      setLoading(false)
    }

    window.addEventListener('daye:update', handleDayeEvent)
    return () => window.removeEventListener('daye:update', handleDayeEvent)
  }, [userId])

  useEffect(() => {
    if (open) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conversation, sending, open])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || sending) return

    if (!userId) {
      setConversation(prev => [...prev, { role: 'user', text }, { role: 'daye', text: 'Sign in to chat with DAYE — the full analyst is only available to authenticated Operators.' }])
      setInput('')
      return
    }

    // Carry the running conversation (including any proactive event message,
    // e.g. a breach-scan result) as history so follow-ups like "tell me
    // more" have the actual context to work from, not just the bare text.
    const history = conversation.slice(-8).map((b) => ({
      role: b.role === 'daye' ? 'assistant' as const : 'user' as const,
      content: b.text,
    }))

    setInput('')
    setConversation(prev => [...prev, { role: 'user', text }])
    setSending(true)
    try {
      const { data } = await supabase.functions.invoke('brain-chat', {
        body: {
          user_id: userId,
          conversation_id: conversationIdRef.current,
          messages: [
            { role: 'system', content: 'You are DAYE, a sharp cybersecurity intelligence assistant. Keep replies concise — 2-3 sentences max for this mini chat view.' },
            ...history,
            { role: 'user', content: text },
          ],
        },
      })
      if (data?.conversation_id) conversationIdRef.current = data.conversation_id
      const reply = data?.reply || 'Signal interrupted. Use full chat for complete analysis.'
      setConversation(prev => [...prev, { role: 'daye', text: reply }])
    } catch (_) {
      setConversation(prev => [...prev, { role: 'daye', text: 'Signal interrupted. Try the full chat for better connectivity.' }])
    }
    setSending(false)
  }

  const toggleVoice = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognitionAPI) return
    if (isRecording) {
      recognitionRef.current?.stop()
      setIsRecording(false)
    } else {
      const rec = new SpeechRecognitionAPI()
      rec.continuous = false
      rec.interimResults = false
      rec.onresult = (e: SpeechRecognitionEvent) => { setInput(e.results[0][0].transcript); setIsRecording(false) }
      rec.onerror = () => setIsRecording(false)
      rec.onend = () => setIsRecording(false)
      recognitionRef.current = rec
      rec.start()
      setIsRecording(true)
    }
  }

  return (
    <motion.div
      drag
      dragControls={dragControls}
      dragMomentum={false}
      dragElastic={0}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={() => setTimeout(() => setIsDragging(false), 50)}
      whileDrag={{ cursor: 'grabbing' }}
      style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, pointerEvents: 'auto', cursor: isDragging ? 'grabbing' : 'default', touchAction: 'none' }}
    >
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 14, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.94 }}
            transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            style={{
              position: 'absolute',
              bottom: 74,
              right: 0,
              width: 320,
              background: 'var(--surface-chat)',
              border: '1px solid var(--ovw-0p1)',
              borderRadius: 22,
              backdropFilter: 'blur(48px)',
              WebkitBackdropFilter: 'blur(48px)',
              boxShadow: '0 40px 80px rgba(0,0,0,0.85), 0 0 0 1px var(--ovw-0p04), inset 0 1px 0 var(--ovw-0p09)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '13px 16px',
              borderBottom: '1px solid var(--ovw-0p07)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#30D158', boxShadow: '0 0 8px rgba(48,209,88,0.9)', animation: 'daye-pulse 2s infinite' }} />
                <span style={{ fontFamily: 'Bebas Neue', fontSize: 17, letterSpacing: '0.25em', color: 'var(--text-1)' }}>DAYE</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <button
                  onClick={() => { setOpen(false); navigate('/daye') }}
                  style={{ background: 'rgba(48,209,88,0.08)', border: '1px solid rgba(48,209,88,0.2)', borderRadius: 7, padding: '3px 10px', fontFamily: 'JetBrains Mono', fontSize: 9, color: '#30D158', letterSpacing: '0.08em', cursor: 'pointer' }}
                >
                  FULL CHAT
                </button>
                <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: '#48484A', display: 'flex', cursor: 'pointer', padding: 2 }}>
                  <ChevronDown size={14} />
                </button>
              </div>
            </div>

            {/* Conversation */}
            <div style={{ padding: '12px 14px', overflowY: 'auto', flex: 1, maxHeight: 220, minHeight: 72, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {conversation.slice(-8).map((bubble, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ display: 'flex', justifyContent: bubble.role === 'user' ? 'flex-end' : 'flex-start' }}
                >
                  <div style={{
                    maxWidth: '86%',
                    padding: '8px 12px',
                    borderRadius: bubble.role === 'user' ? '14px 14px 4px 14px' : '4px 14px 14px 14px',
                    background: bubble.role === 'user' ? 'rgba(48,209,88,0.1)' : 'var(--ovw-0p04)',
                    border: `1px solid ${bubble.role === 'user' ? 'rgba(48,209,88,0.18)' : 'var(--ovw-0p07)'}`,
                    fontFamily: 'Syne',
                    fontSize: 12.5,
                    color: bubble.role === 'user' ? '#30D158' : '#A0A0A0',
                    lineHeight: 1.6,
                  }}>
                    {bubble.text}
                  </div>
                </motion.div>
              ))}
              {(loading || sending) && (
                <div style={{ display: 'flex', gap: 5, alignItems: 'center', paddingLeft: 2, paddingTop: 2 }}>
                  {[0, 1, 2].map((i) => (
                    <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#30D158', animation: `daye-dot 1.2s ${i * 0.2}s infinite` }} />
                  ))}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input bar */}
            <div style={{ padding: '10px 12px', borderTop: '1px solid var(--ovw-0p06)', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--ovw-0p04)', border: '1px solid var(--ovw-0p09)', borderRadius: 13, padding: '7px 10px' }}>
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  accept="image/*,video/*,.pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) setInput(prev => `${prev}${prev ? ' ' : ''}[${file.name}]`)
                    e.target.value = ''
                  }}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  title="Attach file"
                  style={{ background: 'none', border: 'none', color: '#48484A', cursor: 'pointer', display: 'flex', padding: 1, flexShrink: 0, transition: 'color 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#98989D')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#48484A')}
                >
                  <Paperclip size={13} />
                </button>
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                  placeholder="Ask DAYE anything..."
                  style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontFamily: 'Syne', fontSize: 12.5, color: 'var(--text-1)', padding: '1px 4px', minWidth: 0 }}
                />
                <button
                  onClick={toggleVoice}
                  title={isRecording ? 'Stop recording' : 'Voice input'}
                  style={{ background: 'none', border: 'none', color: isRecording ? '#30D158' : '#48484A', cursor: 'pointer', display: 'flex', padding: 1, flexShrink: 0, transition: 'color 0.2s' }}
                >
                  {isRecording ? <MicOff size={13} /> : <Mic size={13} />}
                </button>
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || sending}
                  style={{
                    background: input.trim() && !sending ? '#30D158' : 'var(--ovw-0p05)',
                    border: 'none',
                    borderRadius: 9,
                    width: 28,
                    height: 28,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: input.trim() && !sending ? 'pointer' : 'not-allowed',
                    flexShrink: 0,
                    transition: 'background 0.2s',
                  }}
                >
                  <Send size={11} style={{ color: input.trim() && !sending ? '#000' : '#48484A' }} />
                </button>
              </div>
            </div>

            {/* Status bar */}
            <div style={{ padding: '7px 16px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#30D158', boxShadow: '0 0 5px rgba(48,209,88,0.8)' }} />
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: '#2A2A2A', letterSpacing: '0.14em' }}>DAYE · INTELLIGENCE ACTIVE</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating trigger button */}
      <motion.button
        onClick={() => setOpen(!open)}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.92 }}
        style={{
          width: 58,
          height: 58,
          borderRadius: '50%',
          background: 'var(--surface-chat)',
          border: `1.5px solid ${hasNewMessage ? 'rgba(48,209,88,0.65)' : 'var(--ovw-0p14)'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          cursor: 'pointer',
          overflow: 'hidden',
          boxShadow: hasNewMessage
            ? '0 0 32px rgba(48,209,88,0.45), 0 12px 36px rgba(0,0,0,0.75)'
            : '0 10px 36px rgba(0,0,0,0.65)',
          transition: 'border-color 0.3s, box-shadow 0.3s',
        }}
      >
        {/* DAYE logo video — screen blend */}
        <video
          autoPlay muted loop playsInline preload="auto"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }}
        >
          <source src="/assets/video/blob-di.mp4" type="video/mp4" />
        </video>
        <span style={{ position: 'relative', zIndex: 1, fontFamily: 'Bebas Neue', fontSize: 13, letterSpacing: '0.12em', color: hasNewMessage ? '#30D158' : '#DADADA', transition: 'color 0.3s', textShadow: '0 0 12px rgba(0,0,0,0.9)' }}>
          DAYE
        </span>

        {hasNewMessage && (
          <>
            <div style={{ position: 'absolute', top: 3, right: 3, width: 9, height: 9, borderRadius: '50%', background: '#30D158', boxShadow: '0 0 8px rgba(48,209,88,0.9)', zIndex: 2 }} />
            <div style={{ position: 'absolute', inset: -6, borderRadius: '50%', border: '1px solid rgba(48,209,88,0.45)', animation: 'daye-ring 1.5s ease-out infinite', pointerEvents: 'none' }} />
          </>
        )}
      </motion.button>

      <style>{`
        @keyframes daye-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        @keyframes daye-dot { 0%, 80%, 100% { transform: scale(0.5); opacity: 0.35; } 40% { transform: scale(1); opacity: 1; } }
        @keyframes daye-ring { 0% { transform: scale(1); opacity: 0.55; } 100% { transform: scale(1.9); opacity: 0; } }
      `}</style>
    </motion.div>
  )
}
