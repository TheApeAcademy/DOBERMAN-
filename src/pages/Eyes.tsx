import { useEffect, useState } from 'react'
import { Eye } from 'lucide-react'
import { motion } from 'framer-motion'
import { Layout } from '../components/layout/Layout'
import { EyesUploader } from '../components/eyes/EyesUploader'
import { EyesResult } from '../components/eyes/EyesResult'
import { EyesScanHistory } from '../components/eyes/EyesScanHistory'
import { UpgradeModal } from '../components/ui/Modal'
import { useAuth } from '../hooks/useAuth'
import { useEyes } from '../hooks/useEyes'
import type { EyesScan } from '../lib/supabase'

const DETECTS = [
  'Face Swaps', 'GANs', 'Diffusion Synthesis', 'Neural Rendering',
  'Facial Puppeting', 'Voice Cloning', 'Lip Sync', 'Identity Morphing',
]

const card: React.CSSProperties = {
  background: 'var(--ovw-0p03)',
  border: '1px solid var(--ovw-0p08)',
  borderRadius: 24,
  padding: 24,
  boxShadow: 'inset 0 1px 0 var(--ovw-0p06)',
}

const sectionLabel: React.CSSProperties = {
  fontFamily: 'JetBrains Mono, monospace',
  fontSize: 10,
  letterSpacing: '0.18em',
  color: 'var(--text-3)',
  marginBottom: 16,
  textTransform: 'uppercase' as const,
}

export default function Eyes() {
  const { user, profile, signOut } = useAuth()
  const { scanning, result, error, analyze, getHistory, getDailyCount, setResult } = useEyes(user?.id)
  const [dailyCount, setDailyCount] = useState(0)
  const [upgradeOpen, setUpgradeOpen] = useState(false)
  const [historyKey, setHistoryKey] = useState(0)

  useEffect(() => {
    if (user) getDailyCount().then(setDailyCount)
  }, [user])

  const handleAnalyze = async (file: File) => {
    await analyze(file)
    const count = await getDailyCount()
    setDailyCount(count)
    setHistoryKey((k) => k + 1)
  }

  const remainingScans = Math.max(0, 3 - dailyCount)

  return (
    <Layout profile={profile} onSignOut={signOut} title="Deepfake Intelligence">
      <div style={{ padding: 'clamp(20px, 4vw, 32px)', maxWidth: 1100, margin: '0 auto', paddingBottom: 60 }}>

        {/* Module header — square identity tile + title, no decorative video */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28, paddingBottom: 24, borderBottom: '1px solid var(--ovw-0p06)', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: 88, height: 88, borderRadius: 20, overflow: 'hidden', flexShrink: 0, background: '#060606' }}>
            <img
              src="/assets/video/0a068fc3612b18fb193aa68da61d7bb3.jpg"
              alt=""
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', pointerEvents: 'none' }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(10,132,255,0.14) 0%, transparent 60%)' }} />
            <div style={{ position: 'absolute', inset: 0, border: '1px solid var(--ovw-0p1)', borderRadius: 20 }} />
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <h1 style={{
              fontFamily: 'Syne, system-ui, -apple-system, sans-serif',
              fontWeight: 700, fontSize: 24, color: 'var(--text-1)', lineHeight: 1.1,
            }}>
              Deepfake Intelligence
            </h1>
            <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 13, color: 'var(--text-2)', marginTop: 4 }}>
              AI-powered detection of synthetic media
            </p>
          </div>
          <div style={{
            padding: '6px 14px',
            borderRadius: 100,
            background: remainingScans > 0 ? 'rgba(48,209,88,0.12)' : 'rgba(255,45,45,0.12)',
            border: `1px solid ${remainingScans > 0 ? 'rgba(48,209,88,0.3)' : 'rgba(255,45,45,0.3)'}`,
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 10,
            color: remainingScans > 0 ? 'var(--safe)' : 'var(--danger)',
            letterSpacing: '0.08em',
            flexShrink: 0,
          }}>
            {remainingScans} / 3 TODAY
          </div>
        </div>

        {/* Main two-panel layout */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16, alignItems: 'start', marginBottom: 16 }}>

          {/* Upload panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={card}>
              <p style={sectionLabel}>Upload Media</p>
              <EyesUploader
                onAnalyze={handleAnalyze}
                scanning={scanning}
                remainingScans={remainingScans}
                onUpgradeClick={() => setUpgradeOpen(true)}
              />
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'var(--text-3)', marginTop: 14, letterSpacing: '0.06em' }}>
                Supported: Images, Videos, Audio · Max 50MB
              </p>
            </div>

            {error && (
              <div style={{ padding: '12px 16px', borderRadius: 14, background: 'rgba(255,45,45,0.06)', border: '1px solid rgba(255,45,45,0.18)' }}>
                <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--danger)' }}>{error}</p>
              </div>
            )}
          </div>

          {/* Results panel */}
          <div style={card}>
            <p style={sectionLabel}>Analysis Results</p>
            {scanning ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 0', gap: 16 }}>
                <div style={{ position: 'relative', width: 52, height: 52 }}>
                  <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1px solid rgba(10,132,255,0.12)' }} />
                  <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid transparent', borderTopColor: '#0A84FF', animation: 'spin 0.9s linear infinite' }} />
                  <Eye size={18} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', color: '#0A84FF' }} />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 14, color: 'var(--text-2)' }}>Analyzing media…</p>
                  <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'var(--text-3)', marginTop: 4, letterSpacing: '0.1em' }}>SCANNING FOR SYNTHETIC MARKERS</p>
                </div>
              </div>
            ) : result ? (
              <EyesResult scan={result} />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', padding: '24px 0 12px', gap: 20 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, textAlign: 'center', paddingBottom: 20, borderBottom: '1px solid var(--ovw-0p06)' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(10,132,255,0.08)', border: '1px solid rgba(10,132,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Eye size={18} color="rgba(10,132,255,0.6)" />
                  </div>
                  <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 14, color: 'var(--text-2)' }}>Upload a file to begin</p>
                </div>

                <div>
                  <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.14em', color: 'var(--text-3)', marginBottom: 10 }}>DAYE DETECTS</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {DETECTS.map((d) => (
                      <motion.span
                        key={d}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={{
                          padding: '7px 14px',
                          borderRadius: 100,
                          background: 'rgba(10,132,255,0.08)',
                          border: '1px solid rgba(10,132,255,0.18)',
                          fontFamily: 'Syne, system-ui, sans-serif',
                          fontSize: 12,
                          color: 'rgba(10,132,255,0.9)',
                        }}
                      >
                        {d}
                      </motion.span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* History */}
        <div style={card}>
          <p style={sectionLabel}>Scan History</p>
          <EyesScanHistory
            key={historyKey}
            userId={user?.id || ''}
            getHistory={getHistory}
            onSelect={(scan: EyesScan) => setResult(scan)}
          />
        </div>
      </div>

      <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </Layout>
  )
}
