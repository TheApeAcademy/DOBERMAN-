import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Zap } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

export type DayeEventPayload = {
  context_type: string
  data: Record<string, unknown>
  message?: string
}

export function dayeNotify(event: DayeEventPayload) {
  window.dispatchEvent(new CustomEvent('daye:update', { detail: event }))
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

interface DayeAssistantProps {
  userId?: string
}

export function DayeAssistant({ userId }: DayeAssistantProps) {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('DAYE is watching. All threat detection systems nominal.')
  const [hasNewMessage, setHasNewMessage] = useState(false)
  const [loading, setLoading] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const pageMsg = PAGE_MESSAGES[location.pathname]
    if (pageMsg) {
      setMessage(pageMsg)
      setHasNewMessage(true)
      const t = setTimeout(() => setHasNewMessage(false), 3500)
      return () => clearTimeout(t)
    }
  }, [location.pathname])

  useEffect(() => {
    const handleDayeEvent = async (e: Event) => {
      const event = (e as CustomEvent<DayeEventPayload>).detail

      if (event.message) {
        setMessage(event.message)
        setHasNewMessage(true)
        setTimeout(() => setHasNewMessage(false), 4000)
        return
      }

      if (!userId) return
      setLoading(true)
      try {
        const { data } = await supabase.functions.invoke('daye-assistant', {
          body: { context_type: event.context_type, data: event.data },
        })
        if (data?.message) {
          setMessage(data.message)
          setHasNewMessage(true)
          setTimeout(() => setHasNewMessage(false), 4500)
        }
      } catch (_) {}
      setLoading(false)
    }

    window.addEventListener('daye:update', handleDayeEvent)
    return () => window.removeEventListener('daye:update', handleDayeEvent)
  }, [userId])

  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, pointerEvents: 'auto' }}>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              bottom: 60,
              right: 0,
              width: 308,
              background: 'rgba(8,8,8,0.97)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 18,
              backdropFilter: 'blur(32px)',
              WebkitBackdropFilter: 'blur(32px)',
              boxShadow: '0 32px 64px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.07)',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '12px 16px',
              borderBottom: '1px solid rgba(255,255,255,0.07)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(255,255,255,0.02)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: '#30D158',
                  animation: 'daye-pulse 2s infinite',
                  boxShadow: '0 0 6px rgba(48,209,88,0.7)',
                }} />
                <span style={{ fontFamily: 'Bebas Neue', fontSize: 15, letterSpacing: '0.22em', color: '#F5F5F7' }}>
                  DAYE
                </span>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: '#48484A', letterSpacing: '0.12em' }}>
                  INTELLIGENCE
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <button
                  onClick={() => { setOpen(false); navigate('/daye') }}
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 6,
                    padding: '3px 8px',
                    fontFamily: 'JetBrains Mono',
                    fontSize: 9,
                    color: '#98989D',
                    letterSpacing: '0.08em',
                    cursor: 'pointer',
                  }}
                >
                  FULL CHAT
                </button>
                <button
                  onClick={() => setOpen(false)}
                  style={{ background: 'none', border: 'none', color: '#48484A', display: 'flex', cursor: 'pointer', padding: 2 }}
                >
                  <ChevronDown size={14} />
                </button>
              </div>
            </div>

            {/* Message */}
            <div style={{ padding: '16px', minHeight: 90 }}>
              {loading ? (
                <div style={{ display: 'flex', gap: 5, alignItems: 'center', paddingTop: 4 }}>
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: '#48484A',
                        animation: `daye-dot 1.2s ${i * 0.2}s infinite`,
                      }}
                    />
                  ))}
                </div>
              ) : (
                <motion.p
                  key={message}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ fontFamily: 'Syne', fontSize: 13, color: '#98989D', lineHeight: 1.65 }}
                >
                  {message}
                </motion.p>
              )}
            </div>

            {/* Footer */}
            <div style={{
              padding: '10px 16px',
              borderTop: '1px solid rgba(255,255,255,0.05)',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}>
              <Zap size={9} style={{ color: '#48484A' }} />
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: '#48484A', letterSpacing: '0.14em' }}>
                DOBERMAN INTELLIGENCE ACTIVE
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating trigger */}
      <motion.button
        onClick={() => setOpen(!open)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.93 }}
        style={{
          width: 46,
          height: 46,
          borderRadius: '50%',
          background: 'rgba(10,10,10,0.97)',
          border: `1px solid ${hasNewMessage ? 'rgba(48,209,88,0.5)' : 'rgba(255,255,255,0.13)'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          cursor: 'pointer',
          boxShadow: hasNewMessage
            ? '0 0 24px rgba(48,209,88,0.35), 0 8px 24px rgba(0,0,0,0.6)'
            : '0 8px 24px rgba(0,0,0,0.5)',
          transition: 'border-color 0.3s, box-shadow 0.3s',
        }}
      >
        <span style={{
          fontFamily: 'Bebas Neue',
          fontSize: 12,
          letterSpacing: '0.1em',
          color: hasNewMessage ? '#30D158' : '#98989D',
          transition: 'color 0.3s',
        }}>
          DAYE
        </span>

        {hasNewMessage && (
          <>
            <div style={{
              position: 'absolute',
              top: 2,
              right: 2,
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#30D158',
              boxShadow: '0 0 6px rgba(48,209,88,0.8)',
            }} />
            <div style={{
              position: 'absolute',
              inset: -5,
              borderRadius: '50%',
              border: '1px solid rgba(48,209,88,0.35)',
              animation: 'daye-ring 1.5s ease-out infinite',
            }} />
          </>
        )}
      </motion.button>

      <style>{`
        @keyframes daye-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }
        @keyframes daye-dot { 0%, 80%, 100% { transform: scale(0.55); opacity: 0.4; } 40% { transform: scale(1); opacity: 1; } }
        @keyframes daye-ring { 0% { transform: scale(1); opacity: 0.5; } 100% { transform: scale(1.9); opacity: 0; } }
      `}</style>
    </div>
  )
}
