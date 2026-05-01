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

export default function Nose() {
  const { user, profile, signOut } = useAuth()
  const { scanning, result, error, analyze, getHistory, getDailyCount, setResult } = useNose(user?.id)
  const [dailyCount, setDailyCount] = useState(0)
  const [upgradeOpen, setUpgradeOpen] = useState(false)
  const [historyKey, setHistoryKey] = useState(0)

  useEffect(() => {
    if (user) {
      getDailyCount().then(setDailyCount)
    }
  }, [user])

  const handleAnalyze = async (description: string, devices: string[]) => {
    await analyze(description, devices)
    const count = await getDailyCount()
    setDailyCount(count)
    setHistoryKey((k) => k + 1)
  }

  const remainingScans = Math.max(0, 3 - dailyCount)

  return (
    <Layout profile={profile} onSignOut={signOut} title="NOSE - Vulnerability Intelligence">
      <div className="p-6 max-w-6xl mx-auto page-fade">
        {/* Page header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-purple-900/20 flex items-center justify-center border border-purple-700/20">
            <Wifi size={20} className="text-purple-400" />
          </div>
          <div>
            <h1 className="font-heading font-bold text-xl text-text-primary">NOSE</h1>
            <p className="text-text-muted font-body text-sm">IoT and network vulnerability intelligence</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Scanner */}
          <div className="card p-5">
            <h2 className="font-heading font-bold text-text-primary mb-4">Network Scanner</h2>
            <NoseScanner
              onAnalyze={handleAnalyze}
              scanning={scanning}
              remainingScans={remainingScans}
              onUpgradeClick={() => setUpgradeOpen(true)}
            />
            {error && (
              <div className="mt-4 p-4 rounded-lg bg-red-900/20 border border-red-800/40">
                <p className="text-accent-red font-body text-sm">{error}</p>
              </div>
            )}
          </div>

          {/* Results */}
          <div className="card p-5">
            <h2 className="font-heading font-bold text-text-primary mb-4">Threat Analysis</h2>
            {scanning ? (
              <div className="flex flex-col items-center justify-center py-16 space-y-4">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 rounded-full border-2 border-purple-500/20" />
                  <div className="absolute inset-0 rounded-full border-2 border-t-purple-500 animate-spin" />
                  <Wifi className="absolute inset-0 m-auto text-purple-400" size={20} />
                </div>
                <div className="text-center space-y-1">
                  <p className="text-text-primary font-body text-sm">Scanning network...</p>
                  <p className="text-text-muted font-label text-xs">Identifying vulnerabilities across devices</p>
                </div>
              </div>
            ) : result ? (
              <NoseResult scan={result} />
            ) : (
              <div className="flex flex-col items-center justify-center py-16 space-y-3 text-center">
                <Wifi size={32} className="text-text-muted" />
                <p className="text-text-muted font-body text-sm">Describe your network to begin analysis.</p>
                <p className="text-text-muted font-label text-xs">The more detail you provide, the better the results</p>
              </div>
            )}
          </div>
        </div>

        {/* History */}
        <div className="card p-5 mt-6">
          <h2 className="font-heading font-bold text-text-primary mb-4">Scan History</h2>
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
