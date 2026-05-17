import { useEffect, useState } from 'react'
import { Eye } from 'lucide-react'
import { Layout } from '../components/layout/Layout'
import { EyesUploader } from '../components/eyes/EyesUploader'
import { EyesResult } from '../components/eyes/EyesResult'
import { EyesScanHistory } from '../components/eyes/EyesScanHistory'
import { UpgradeModal } from '../components/ui/Modal'
import { useAuth } from '../hooks/useAuth'
import { useEyes } from '../hooks/useEyes'
import type { EyesScan } from '../lib/supabase'

const card: React.CSSProperties = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 20,
  padding: 24,
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.07)',
  backdropFilter: 'blur(28px)',
  WebkitBackdropFilter: 'blur(28px)',
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
    <Layout profile={profile} onSignOut={signOut} title="DEEP FAKE INTELLIGENCE">
      <div style={{ padding: '28px 28px 48px', maxWidth: 1200, margin: '0 auto' }}>

        {/* Module header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 32, paddingBottom: 24, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, overflow: 'hidden', flexShrink: 0, border: '1px solid rgba(255,255,255,0.1)', background: '#060606' }}>
            <video autoPlay muted loop playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}>
              <source src="/assets/video/blob-nose.mp4" type="video/mp4" />
            </video>
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontFamily: 'Bebas Neue', fontSize: 26, letterSpacing: '0.05em', color: 'var(--text-1)', lineHeight: 1 }}>DEEP FAKE<br />INTELLIGENCE</h1>
            <p style={{ fontFamily: 'Inter', fontSize: 10, letterSpacing: '0.05em', color: 'var(--text-3)', marginTop: 3 }}>01 -- DEEPFAKE DETECTION</p>
          </div>
          <div style={{
            padding: '6px 14px', borderRadius: 8,
            background: remainingScans > 0 ? 'rgba(48,209,88,0.07)' : 'rgba(255,45,45,0.07)',
            border: `1px solid ${remainingScans > 0 ? 'rgba(48,209,88,0.2)' : 'rgba(255,45,45,0.2)'}`,
            fontFamily: 'Inter', fontSize: 10, letterSpacing: '0.03em',
            color: remainingScans > 0 ? 'var(--safe)' : 'var(--danger)',
          }}>
            {remainingScans} / 3 SCANS TODAY
          </div>
        </div>

        {/* Full-width stacked layout */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Upload panel — full width */}
          <div style={card}>
            <p style={{ fontFamily: 'Inter', fontSize: 10, letterSpacing: '0.05em', color: 'var(--text-3)', marginBottom: 18, textTransform: 'uppercase' }}>Upload File</p>
            <EyesUploader
              onAnalyze={handleAnalyze}
              scanning={scanning}
              remainingScans={remainingScans}
              onUpgradeClick={() => setUpgradeOpen(true)}
            />
          </div>

          {error && (
            <div style={{ padding: '12px 16px', borderRadius: 12, background: 'rgba(255,45,45,0.06)', border: '1px solid rgba(255,45,45,0.18)' }}>
              <p style={{ fontFamily: 'Inter', fontSize: 11, color: 'var(--danger)' }}>{error}</p>
            </div>
          )}

          {/* Results panel — full width below */}
          <div style={card}>
            <p style={{ fontFamily: 'Inter', fontSize: 10, letterSpacing: '0.05em', color: 'var(--text-3)', marginBottom: 18, textTransform: 'uppercase' }}>Analysis Results</p>
            {scanning ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 0', gap: 24 }}>
                <div style={{ position: 'relative', width: 56, height: 56, flexShrink: 0 }}>
                  <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.08)' }} />
                  <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid transparent', borderTopColor: 'var(--text-1)', animation: 'spin 0.8s linear infinite' }} />
                  <Eye size={18} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', color: 'var(--text-3)' }} />
                </div>
                <div>
                  <p style={{ fontFamily: 'Inter', fontSize: 12, color: 'var(--text-2)' }}>Analyzing with D0B3RMAN...</p>
                  <p style={{ fontFamily: 'Inter', fontSize: 10, color: 'var(--text-3)', marginTop: 4, letterSpacing: '0.04em' }}>SCANNING FOR SYNTHETIC MARKERS</p>
                </div>
              </div>
            ) : result ? (
              <EyesResult scan={result} />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 0', gap: 16 }}>
                <Eye size={28} style={{ color: 'var(--text-3)', opacity: 0.5 }} />
                <div>
                  <p style={{ fontFamily: 'Inter', fontSize: 12, color: 'var(--text-3)' }}>Upload a file to begin analysis.</p>
                  <p style={{ fontFamily: 'Inter', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.03em', opacity: 0.6, marginTop: 4 }}>IMAGES · VIDEOS · AUDIO</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* History */}
        <div style={{ ...card, marginTop: 20 }}>
          <p style={{ fontFamily: 'Inter', fontSize: 10, letterSpacing: '0.05em', color: 'var(--text-3)', marginBottom: 18, textTransform: 'uppercase' }}>Scan History</p>
          <EyesScanHistory
            key={historyKey}
            userId={user?.id || ''}
            getHistory={getHistory}
            onSelect={(scan: EyesScan) => setResult(scan)}
          />
        </div>
      </div>

      <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
    </Layout>
  )
}
