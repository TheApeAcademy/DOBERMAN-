import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { X, Crown } from 'lucide-react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    if (open) document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
        onClick={onClose}
      />
      <div style={{
        position: 'relative', zIndex: 51, width: '100%', maxWidth: 480,
        background: 'var(--ovw-0p04)',
        border: '1px solid var(--ovw-0p12)',
        borderRadius: 20,
        boxShadow: 'inset 0 1px 0 var(--ovw-0p14), 0 40px 80px rgba(0,0,0,0.6)',
        backdropFilter: 'blur(40px)',
        WebkitBackdropFilter: 'blur(40px)',
        animation: 'pageIn 0.25s ease',
      }}>
        {title && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px 16px', borderBottom: '1px solid var(--ovw-0p07)' }}>
            <p style={{ fontFamily: 'Inter', fontSize: 11, letterSpacing: '0.04em', color: 'var(--text-2)', textTransform: 'uppercase' }}>{title}</p>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-3)', display: 'flex', alignItems: 'center' }}>
              <X size={16} />
            </button>
          </div>
        )}
        <div style={{ padding: '20px 22px' }}>{children}</div>
      </div>
    </div>
  )
}

export function UpgradeModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title="Upgrade to Pro">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 48, height: 48, borderRadius: 14, background: 'rgba(255,176,32,0.1)', border: '1px solid rgba(255,176,32,0.2)', margin: '0 auto' }}>
          <Crown size={20} style={{ color: '#FFB020' }} />
        </div>
        <p style={{ fontFamily: 'Inter', fontSize: 12, color: 'var(--text-2)', lineHeight: 1.7 }}>
          You have reached your daily limit. Pro gives you unlimited scans,
          priority analysis, and advanced threat reports.
        </p>
        <div style={{ background: 'var(--ovw-0p02)', border: '1px solid var(--ovw-0p07)', borderRadius: 12, padding: '14px 16px', textAlign: 'left' }}>
          <p style={{ fontFamily: 'Inter', fontSize: 9, letterSpacing: '0.04em', color: 'var(--text-3)', marginBottom: 10, textTransform: 'uppercase' }}>Pro includes:</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {['Unlimited EYES scans', 'Unlimited NOSE scans', '100 BRAIN messages/day', 'Export reports', 'Priority support'].map((item) => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: 'var(--safe)', fontFamily: 'Inter', fontSize: 10 }}>+</span>
                <span style={{ fontFamily: 'Inter', fontSize: 12, color: 'var(--text-1)' }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
        <button onClick={onClose} className="btn-primary" style={{ width: '100%', padding: '12px 0' }}>
          Coming Soon — Notify Me
        </button>
        <button onClick={onClose} className="btn-secondary" style={{ width: '100%', padding: '10px 0', fontSize: 11 }}>
          Maybe Later
        </button>
      </div>
    </Modal>
  )
}
