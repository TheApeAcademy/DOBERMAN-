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
  background: '#FFFFFF',
  border: '1px solid rgba(0,0,0,0.06)',
  borderRadius: 20,
  padding: 24,
  boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 4px 20px rgba(0,0,0,0.04)',
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
    <Layout profile={profile} onSignOut={signOut} title="EYES — DEEPFAKE DETECTION">
      <div style={{ padding: '28px 28px 48px', maxWidth: 1200, margin: '0 auto' }}>

        {/* Hero video */}
        <div style={{ position: 'relative', height: 240, borderRadius: 20, overflow: 'hidden', marginBottom: 28, background: '#0C0C0E' }}>
          <video autoPlay muted loop playsInline style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }}>
            <source src="/assets/video/blob-eyes.mp4" type="video/mp4" />
          </video>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.5) 100%)' }} />
          <div style={{ position: 'absolute', bottom: 18, left: 22, zIndex: 2 }}>
            <p style={{ fontFamily: 'Bebas Neue', fontSize: 36, letterSpacing: '0.1em', color: '#FFFFFF', lineHeight: 1 }}>EYES</p>
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.5)' }}>DEEPFAKE + SYNTHETIC MEDIA DETECTION</p>
          </div>
          <div style={{ position: 'absolute', top: 16, right: 16, padding: '6px 14px', borderRadius: 8, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.12)' }}>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.1em', color: remainingScans > 0 ? '#30D158' : '#FF2D2D' }}>
              {remainingScans} / 3 SCANS TODAY
            </span>
          </div>
        </div>

        {/* Two-column layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, alignItems: 'start' }}>

          {/* Upload panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={card}>
              <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.18em', color: '#8E8E93', marginBottom: 18, textTransform: 'uppercase' }}>Upload File</p>
              <EyesUploader
                onAnalyze={handleAnalyze}
                scanning={scanning}
                remainingScans={remainingScans}
                onUpgradeClick={() => setUpgradeOpen(true)}
              />
            </div>
            {error && (
              <div style={{ padding: '12px 16px', borderRadius: 12, background: 'rgba(255,45,45,0.06)', border: '1px solid rgba(255,45,45,0.16)' }}>
                <p style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: '#FF2D2D' }}>{error}</p>
              </div>
            )}
          </div>

          {/* Results panel */}
          <div style={card}>
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.18em', color: '#8E8E93', marginBottom: 18, textTransform: 'uppercase' }}>Analysis Report</p>
            {scanning ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 0', gap: 16 }}>
                <div style={{ position: 'relative', width: 52, height: 52 }}>
                  <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1px solid rgba(0,0,0,0.08)' }} />
                  <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid transparent', borderTopColor: '#0F0F0F', animation: 'spin 0.8s linear infinite' }} />
                  <Eye size={18} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', color: '#8E8E93' }} />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontFamily: 'JetBrains Mono', fontSize: 12, color: '#44454B' }}>Analyzing with D0B3RMAN...</p>
                  <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: '#8E8E93', marginTop: 4, letterSpacing: '0.12em' }}>SCANNING FOR SYNTHETIC MARKERS</p>
                </div>
              </div>
            ) : result ? (
              <EyesResult scan={result} />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 0', gap: 10, textAlign: 'center' }}>
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#F5F5F7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Eye size={22} style={{ color: '#C0C0C5' }} />
                </div>
                <p style={{ fontFamily: 'Syne', fontSize: 14, fontWeight: 600, color: '#44454B' }}>Upload a file to begin.</p>
                <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: '#8E8E93', letterSpacing: '0.1em' }}>IMAGES · VIDEOS · AUDIO</p>
              </div>
            )}
          </div>
        </div>

        {/* History */}
        <div style={{ ...card, marginTop: 18 }}>
          <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.18em', color: '#8E8E93', marginBottom: 18, textTransform: 'uppercase' }}>Scan History</p>
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
