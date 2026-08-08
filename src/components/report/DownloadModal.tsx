import { useState } from 'react'
import { FileText, File, X, Download, Loader } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface DownloadModalProps {
  open: boolean
  onClose: () => void
}

export function DownloadModal({ open, onClose }: DownloadModalProps) {
  const [loading, setLoading] = useState<'pdf' | 'docx' | null>(null)

  const handleDownload = async (type: 'pdf' | 'docx') => {
    setLoading(type)
    try {
      if (type === 'docx') {
        const { downloadDocx } = await import('../../utils/generateDocx')
        await downloadDocx()
      } else {
        const { downloadPdf } = await import('../../utils/generatePdf')
        await downloadPdf()
      }
    } catch (err) {
      console.error('Download failed', err)
    } finally {
      setLoading(null)
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
            onClick={onClose}
          />

          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            style={{
              position: 'relative',
              zIndex: 1,
              width: '100%',
              maxWidth: 440,
              background: 'var(--void-1)',
              border: '1px solid var(--ovw-0p12)',
              borderRadius: 24,
              boxShadow: 'inset 0 1px 0 var(--ovw-0p1), 0 40px 80px rgba(0,0,0,0.8)',
              backdropFilter: 'blur(40px)',
              WebkitBackdropFilter: 'blur(40px)',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px 16px', borderBottom: '1px solid var(--ovw-0p07)' }}>
              <div>
                <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.2em', color: 'var(--ovw-0p3)', marginBottom: 4, textTransform: 'uppercase' }}>
                  Technical Report
                </p>
                <p style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 16, color: 'var(--text-1)' }}>
                  Download Format
                </p>
              </div>
              <button
                onClick={onClose}
                style={{ background: 'var(--ovw-0p06)', border: '1px solid var(--ovw-0p1)', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ovw-0p5)', cursor: 'pointer' }}
              >
                <X size={14} />
              </button>
            </div>

            {/* Options */}
            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { type: 'docx' as const, icon: FileText, label: 'Word Document', sub: '.docx — Microsoft Word compatible', color: '#2B579A' },
                { type: 'pdf' as const, icon: File, label: 'PDF Document', sub: '.pdf — Universal, print-ready', color: '#FF3B30' },
              ].map(({ type, icon: Icon, label, sub, color }) => (
                <motion.button
                  key={type}
                  whileHover={{ scale: 1.02, borderColor: 'var(--ovw-0p2)' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleDownload(type)}
                  disabled={loading !== null}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    padding: '16px 20px',
                    background: 'var(--ovw-0p03)',
                    border: '1px solid var(--ovw-0p09)',
                    borderRadius: 14,
                    textAlign: 'left',
                    cursor: loading !== null ? 'not-allowed' : 'pointer',
                    opacity: loading !== null && loading !== type ? 0.5 : 1,
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}22`, border: `1px solid ${color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {loading === type ? (
                      <Loader size={18} style={{ color, animation: 'spin 0.8s linear infinite' }} />
                    ) : (
                      <Icon size={18} style={{ color }} />
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontFamily: 'Syne', fontWeight: 600, fontSize: 14, color: 'var(--text-1)', marginBottom: 2 }}>{label}</p>
                    <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--ovw-0p35)' }}>{sub}</p>
                  </div>
                  {loading === type ? null : (
                    <Download size={14} style={{ color: 'var(--ovw-0p3)', flexShrink: 0 }} />
                  )}
                </motion.button>
              ))}
            </div>

            {/* Footer note */}
            <div style={{ padding: '0 24px 20px' }}>
              <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--ovw-0p2)', lineHeight: 1.6, textAlign: 'center' }}>
                Academic standard formatting — Times New Roman 12pt, 1" margins, double spacing
              </p>
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
