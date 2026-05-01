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

export default function Eyes() {
  const { user, profile, signOut } = useAuth()
  const { scanning, result, error, analyze, getHistory, getDailyCount, setResult } = useEyes(user?.id)
  const [dailyCount, setDailyCount] = useState(0)
  const [upgradeOpen, setUpgradeOpen] = useState(false)
  const [historyKey, setHistoryKey] = useState(0)

  useEffect(() => {
    if (user) {
      getDailyCount().then(setDailyCount)
    }
  }, [user])

  const handleAnalyze = async (file: File) => {
    await analyze(file)
    const count = await getDailyCount()
    setDailyCount(count)
    setHistoryKey((k) => k + 1)
  }

  const remainingScans = Math.max(0, 3 - dailyCount)

  return (
    <Layout profile={profile} onSignOut={signOut} title="EYES - Deepfake Detection">
      <div className="p-6 max-w-6xl mx-auto page-fade">
        {/* Page header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-accent-blue/10 flex items-center justify-center border border-accent-blue/20">
            <Eye size={20} className="text-accent-blue" />
          </div>
          <div>
            <h1 className="font-heading font-bold text-xl text-text-primary">EYES</h1>
            <p className="text-text-muted font-body text-sm">Deepfake and synthetic media detection</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload panel */}
          <div className="space-y-4">
            <div className="card p-5">
              <h2 className="font-heading font-bold text-text-primary mb-4">Upload File</h2>
              <EyesUploader
                onAnalyze={handleAnalyze}
                scanning={scanning}
                remainingScans={remainingScans}
                onUpgradeClick={() => setUpgradeOpen(true)}
              />
            </div>

            {error && (
              <div className="p-4 rounded-lg bg-red-900/20 border border-red-800/40">
                <p className="text-accent-red font-body text-sm">{error}</p>
              </div>
            )}
          </div>

          {/* Results panel */}
          <div className="card p-5">
            <h2 className="font-heading font-bold text-text-primary mb-4">Analysis Results</h2>
            {scanning ? (
              <div className="flex flex-col items-center justify-center py-16 space-y-4">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 rounded-full border-2 border-accent-blue/20" />
                  <div className="absolute inset-0 rounded-full border-2 border-t-accent-blue animate-spin" />
                  <Eye className="absolute inset-0 m-auto text-accent-blue" size={20} />
                </div>
                <div className="text-center space-y-1">
                  <p className="text-text-primary font-body text-sm">Analyzing with DOBERMAN...</p>
                  <p className="text-text-muted font-label text-xs">Scanning for synthetic markers</p>
                </div>
              </div>
            ) : result ? (
              <EyesResult scan={result} />
            ) : (
              <div className="flex flex-col items-center justify-center py-16 space-y-3 text-center">
                <Eye size={32} className="text-text-muted" />
                <p className="text-text-muted font-body text-sm">Upload a file to begin analysis.</p>
                <p className="text-text-muted font-label text-xs">Supports images, videos, and audio</p>
              </div>
            )}
          </div>
        </div>

        {/* History */}
        <div className="card p-5 mt-6">
          <h2 className="font-heading font-bold text-text-primary mb-4">Scan History</h2>
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
