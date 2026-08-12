import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { X } from 'lucide-react'

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
