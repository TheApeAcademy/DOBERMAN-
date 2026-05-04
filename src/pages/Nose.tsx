import { useEffect, useState } from 'react'
import { Wifi } from 'lucide-react'
import { Layout } from '../components/layout/Layout'
import { NoseScanner } from '../components/nose/NoseScanner'
import { NoseResult } from '../components/nose/NoseResult'
import { NoseScanHistory } from '../components/nose/NoseScanHistory'
import { UpgradeModal } from '../components/ui/Modal'
import { useAuth } from '../hooks/useAuth'
import { useNose } from '../hooks/useNose'
import type { NoseScan } from '../lib/supabase'

const card: React.CSSProperties = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 20,
  padding: 24,
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.07)',
  backdropFilter: 'blur(28px)',
  WebkitBackdropFilter: 'blur(28px)',
}

export default function Nose() {
  const { user, profile, signOut } = useAuth()
  const { scanning, result, error, analyze, getHistory, getDailyCount, setResult } = useNose(user?.id)
  const [dailyCount, setDailyCount] = useState(0)
  const [upgradeOpen, setUpgradeOpen] = useState(false)
  const [historyKey, setHistoryKey] = useState(0)

  useEffect(() => {
    if (user) getDailyCount().then(setDailyCount)
  }, [user])

  const handleAnalyze = async (description: string, devices: string[]) => {
    await analyze(description, devices)
    const count = await getDailyCount()
    setDailyCount(count)
    setHistoryKey((k) => k + 1)
  }

  const remainingScans = Math.max(0, 3 - dailyCount)

  return (
    <Layout profile={profile} onSignOut={signOut} title="NOSE — IoT INTELLIGENCE">
      <div style={{ padding: '28px 28px 48px', maxWidth: 1200, margin: '0 auto' }}>

        {/* Hero video */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 36 }}>
          <video autoPlay muted loop playsInline style={{ width: '100%', maxWidth: 460, borderRadius: 28, mixBlendMode: 'screen', opacity: 0.9, pointerEvents: 'none' }}>
            <source src="/assets/video/blob-nose.mp4" type="video/mp4" />
          </video>
        </div>

        {/* Module header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 32, paddingBottom: 24, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)' }}>
            <Wifi size={22} style={{ color: 'var(--text-1)' }} />
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontFamily: 'Bebas Neue', fontSize: 34, letterSpacing: '0.1em', color: 'var(--text-1)', lineHeight: 1 }}>NOSE</h1>
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.18em', color: 'var(--text-3)', marginTop: 3 }}>IoT + NETWORK VULNERABILITY INTELLIGENCE</p>
          </div>
          <div style={{
            padding: '6px 14px', borderRadius: 8,
            background: remainingScans > 0 ? 'rgba(48,209,88,0.07)' : 'rgba(255,45,45,0.07)',
            border: `1px solid ${remainingScans > 0 ? 'rgba(48,209,88,0.2)' : 'rgba(255,45,45,0.2)'}`,
            fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.1em',
            color: remainingScans > 0 ? 'var(--safe)' : 'var(--danger)',
          }}>
            {remainingScans} / 3 SCANS TODAY
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start' }}>

          {/* Scanner */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={card}>
              <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.2em', color: 'var(--text-3)', marginBottom: 18, textTransform: 'uppercase' }}>Network Scanner</p>
              <NoseScanner
                onAnalyze={handleAnalyze}
                scanning={scanning}
                remainingScans={remainingScans}
                onUpgradeClick={() => setUpgradeOpen(true)}
              />
            </div>
            {error && (
              <div style={{ padding: '12px 16px', borderRadius: 12, background: 'rgba(255,45,45,0.06)', border: '1px solid rgba(255,45,45,0.18)' }}>
                <p style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--danger)' }}>{error}</p>
              </div>
            )}
          </div>

          {/* Results */}
          <div style={card}>
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.2em', color: 'var(--text-3)', marginBottom: 18, textTransform: 'uppercase' }}>Threat Analysis</p>
            {scanning ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 0', gap: 16 }}>
                <div style={{ position: 'relative', width: 56, height: 56 }}>
                  <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.08)' }} />
                  <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid transparent', borderTopColor: 'var(--text-1)', animation: 'spin 0.8s linear infinite' }} />
                  <Wifi size={18} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', color: 'var(--text-3)' }} />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontFamily: 'JetBrains Mono', fontSize: 12, color: 'var(--text-2)' }}>Scanning network...</p>
                  <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-3)', marginTop: 4, letterSpacing: '0.12em' }}>IDENTIFYING VULNERABILITIES</p>
                </div>
              </div>
            ) : result ? (
              <NoseResult scan={result} />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 0', gap: 10, textAlign: 'center' }}>
                <Wifi size={28} style={{ color: 'var(--text-3)', opacity: 0.5 }} />
                <p style={{ fontFamily: 'JetBrains Mono', fontSize: 12, color: 'var(--text-3)' }}>Describe your network to begin.</p>
                <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.1em', opacity: 0.6 }}>MORE DETAIL = BETTER RESULTS</p>
              </div>
            )}
          </div>
        </div>

        {/* History */}
        <div style={{ ...card, marginTop: 20 }}>
          <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.2em', color: 'var(--text-3)', marginBottom: 18, textTransform: 'uppercase' }}>Scan History</p>
          <NoseScanHistory
            key={historyKey}
            userId={user?.id || ''}
            getHistory={getHistory}
            onSelect={(scan: NoseScan) => setResult(scan)}
          />
        </div>
      </div>

      <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
    </Layout>
  )
}
