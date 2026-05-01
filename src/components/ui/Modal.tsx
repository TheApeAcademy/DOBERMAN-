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
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (open) document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-lg bg-bg-secondary border border-border-color rounded-xl shadow-2xl animate-fade-in">
        {title && (
          <div className="flex items-center justify-between p-6 border-b border-border-color">
            <h2 className="text-text-primary font-heading font-bold text-lg">{title}</h2>
            <button
              onClick={onClose}
              className="text-text-muted hover:text-text-primary transition-colors p-1 rounded"
            >
              <X size={18} />
            </button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

export function UpgradeModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title="Upgrade to Pro">
      <div className="text-center space-y-4">
        <div className="text-4xl">🐕</div>
        <p className="text-text-secondary font-body text-sm leading-relaxed">
          You have reached your daily limit. Pro plan gives you unlimited scans,
          priority analysis, and advanced threat reports.
        </p>
        <div className="bg-bg-tertiary border border-border-color rounded-lg p-4 text-left space-y-2">
          <p className="text-text-secondary text-xs font-label">Pro includes:</p>
          <ul className="space-y-1">
            {['Unlimited EYES scans', 'Unlimited NOSE scans', '100 BRAIN messages/day', 'Export reports', 'Priority support'].map((item) => (
              <li key={item} className="text-text-primary text-sm font-body flex items-center gap-2">
                <span className="text-accent-green">+</span> {item}
              </li>
            ))}
          </ul>
        </div>
        <button
          onClick={onClose}
          className="w-full btn-primary"
        >
          Coming Soon - Notify Me
        </button>
        <button
          onClick={onClose}
          className="w-full btn-secondary text-sm"
        >
          Maybe Later
        </button>
      </div>
    </Modal>
  )
}
