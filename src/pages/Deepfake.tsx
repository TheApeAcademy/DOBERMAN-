import { useEffect, useState } from 'react'
import { Eye, Mic, Image, Upload, CheckCircle, AlertTriangle, XCircle, Loader } from 'lucide-react'
import { Layout } from '../components/layout/Layout'
import { EyesResult } from '../components/eyes/EyesResult'
import { EyesScanHistory } from '../components/eyes/EyesScanHistory'
import { UpgradeModal } from '../components/ui/Modal'
import { useAuth } from '../hooks/useAuth'
import { useEyes } from '../hooks/useEyes'
import { useVoice } from '../hooks/useVoice'
import { dayeNotify } from '../components/daye/DayeAssistant'
import { GridLines } from '../components/ui/GridLines'
import type { EyesScan, VoiceScan } from '../lib/supabase'

const card: React.CSSProperties = {
  background: 'var(--ovw-0p03)',
  border: '1px solid var(--ovw-0p08)',
  borderRadius: 20,
  padding: 24,
  boxShadow: 'inset 0 1px 0 var(--ovw-0p07)',
  backdropFilter: 'blur(28px)',
  WebkitBackdropFilter: 'blur(28px)',
}

const VOICE_VERDICT_CONFIG = {
  authentic: { color: '#30D158', icon: CheckCircle, label: 'AUTHENTIC' },
  likely_authentic: { color: '#30D158', icon: CheckCircle, label: 'LIKELY AUTHENTIC' },
  uncertain: { color: '#FF9500', icon: AlertTriangle, label: 'UNCERTAIN' },
  likely_ai: { color: '#FF9500', icon: AlertTriangle, label: 'LIKELY AI GENERATED' },
  certain_ai: { color: '#FF2D2D', icon: XCircle, label: 'AI GENERATED' },
}

function VoiceResult({ scan }: { scan: VoiceScan }) {
  const config = VOICE_VERDICT_CONFIG[scan.verdict] || VOICE_VERDICT_CONFIG.uncertain
  const VIcon = config.icon

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <VIcon size={20} style={{ color: config.color }} />
          <span style={{ fontFamily: 'Bebas Neue', fontSize: 24, letterSpacing: '0.1em', color: config.color }}>{config.label}</span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontFamily: 'Bebas Neue', fontSize: 36, letterSpacing: '0.05em', color: config.color, lineHeight: 1 }}>{scan.trust_score}</p>
          <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-3)', letterSpacing: '0.1em' }}>TRUST SCORE</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={{ padding: '14px', background: 'var(--ovw-0p03)', border: '1px solid var(--ovw-0p07)', borderRadius: 12 }}>
          <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-3)', letterSpacing: '0.12em', marginBottom: 6 }}>MANIPULATION PROBABILITY</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span style={{ fontFamily: 'Bebas Neue', fontSize: 28, color: config.color }}>{scan.manipulation_probability}</span>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--text-3)' }}>%</span>
          </div>
        </div>
        <div style={{ padding: '14px', background: 'var(--ovw-0p03)', border: '1px solid var(--ovw-0p07)', borderRadius: 12 }}>
          <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-3)', letterSpacing: '0.12em', marginBottom: 6 }}>EMOTIONAL MANIPULATION</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span style={{ fontFamily: 'Bebas Neue', fontSize: 28, color: scan.emotional_manipulation_score >= 60 ? 'var(--danger)' : 'var(--text-2)' }}>
              {scan.emotional_manipulation_score}
            </span>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--text-3)' }}>%</span>
          </div>
        </div>
      </div>

      <div style={{ height: 3, background: 'var(--void-4)', borderRadius: 2 }}>
        <div style={{ height: '100%', borderRadius: 2, background: config.color, width: `${scan.manipulation_probability}%`, boxShadow: `0 0 8px ${config.color}50` }} />
      </div>

      {scan.clone_indicators && scan.clone_indicators.length > 0 && (
        <div>
          <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.15em', color: 'var(--text-3)', marginBottom: 10 }}>VOICE CLONE INDICATORS</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {scan.clone_indicators.map((ind, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <AlertTriangle size={11} style={{ color: 'var(--warning)', flexShrink: 0, marginTop: 2 }} />
                <span style={{ fontFamily: 'Syne', fontSize: 12, color: 'var(--text-2)' }}>{ind}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {scan.daye_analysis && (
        <div style={{ padding: '14px 16px', background: 'var(--ovw-0p03)', border: '1px solid var(--ovw-0p08)', borderRadius: 12 }}>
          <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.15em', color: 'var(--text-3)', marginBottom: 8 }}>DAYE VOICE INTELLIGENCE</p>
          <p style={{ fontFamily: 'Syne', fontSize: 13, color: 'var(--text-1)', lineHeight: 1.65 }}>{scan.daye_analysis}</p>
        </div>
      )}

      <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-3)', textAlign: 'center' }}>{scan.file_name}</p>
    </div>
  )
}

function UploadZone({
  onFile,
  accept,
  label,
  sublabel,
  loading,
  remainingScans,
  onUpgradeClick,
}: {
  onFile: (f: File) => void
  accept: string
  label: string
  sublabel: string
  loading: boolean
  remainingScans: number
  onUpgradeClick: () => void
}) {
  const [dragging, setDragging] = useState(false)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) onFile(file)
  }

  return (
    <div>
      <label
        style={{
          display: 'block',
          border: `2px dashed ${dragging ? 'var(--ovw-0p3)' : 'var(--ovw-0p1)'}`,
          borderRadius: 16,
          padding: '40px 20px',
          textAlign: 'center',
          cursor: remainingScans <= 0 ? 'not-allowed' : 'pointer',
          background: dragging ? 'var(--ovw-0p04)' : 'transparent',
          transition: 'all 0.2s',
          opacity: remainingScans <= 0 ? 0.5 : 1,
        }}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept={accept}
          style={{ display: 'none' }}
          disabled={remainingScans <= 0 || loading}
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) onFile(f)
            e.target.value = ''
          }}
        />
        {loading ? (
          <Loader size={28} style={{ color: 'var(--text-3)', margin: '0 auto 12px', animation: 'spin 0.8s linear infinite' }} />
        ) : (
          <Upload size={28} style={{ color: 'var(--text-3)', margin: '0 auto 12px' }} />
        )}
        <p style={{ fontFamily: 'Syne', fontSize: 14, color: 'var(--text-2)', marginBottom: 4 }}>
          {loading ? 'Analyzing...' : label}
        </p>
        <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.1em' }}>{sublabel}</p>
      </label>
      {remainingScans <= 0 && (
        <button
          onClick={onUpgradeClick}
          style={{ width: '100%', marginTop: 10, padding: '10px', background: 'rgba(255,149,0,0.08)', border: '1px solid rgba(255,149,0,0.2)', borderRadius: 10, fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--warning)', cursor: 'pointer' }}
        >
          UPGRADE FOR MORE SCANS
        </button>
      )}
    </div>
  )
}

export default function DeepfakePage() {
  const { user, profile, signOut } = useAuth()
  const { scanning: eyesScanning, result: eyesResult, error: eyesError, analyze: eyesAnalyze, getHistory: getEyesHistory, getDailyCount: getEyesCount, setResult: setEyesResult } = useEyes(user?.id)
  const { scanning: voiceScanning, result: voiceResult, error: voiceError, analyze: voiceAnalyze, getHistory: getVoiceHistory, getDailyCount: getVoiceCount, setResult: setVoiceResult } = useVoice(user?.id)

  const [activeTab, setActiveTab] = useState<'media' | 'voice'>('media')
  const [eyesCount, setEyesCount] = useState(0)
  const [voiceCount, setVoiceCount] = useState(0)
  const [upgradeOpen, setUpgradeOpen] = useState(false)
  const [historyKey, setHistoryKey] = useState(0)
  const [voiceHistory, setVoiceHistory] = useState<VoiceScan[]>([])

  useEffect(() => {
    if (user) {
      getEyesCount().then(setEyesCount)
      getVoiceCount().then(setVoiceCount)
    }
  }, [user])

  useEffect(() => {
    if (activeTab === 'voice' && user) {
      getVoiceHistory().then(setVoiceHistory)
    }
  }, [activeTab, user])

  const handleMediaAnalyze = async (file: File) => {
    await eyesAnalyze(file)
    const count = await getEyesCount()
    setEyesCount(count)
    setHistoryKey((k) => k + 1)
  }

  const handleVoiceAnalyze = async (file: File) => {
    await voiceAnalyze(file)
    const count = await getVoiceCount()
    setVoiceCount(count)
    const history = await getVoiceHistory()
    setVoiceHistory(history)
  }

  useEffect(() => {
    if (eyesResult) {
      dayeNotify({
        context_type: 'deepfake_result',
        data: {
          file_type: eyesResult.file_type,
          result: eyesResult.result,
          confidence_score: eyesResult.confidence_score,
        },
        message: eyesResult.explanation,
      })
    }
  }, [eyesResult])

  useEffect(() => {
    if (voiceResult) {
      dayeNotify({
        context_type: 'voice_result',
        data: {
          manipulation_probability: voiceResult.manipulation_probability,
          verdict: voiceResult.verdict,
        },
        message: voiceResult.daye_analysis,
      })
    }
  }, [voiceResult])

  const eyesRemaining = Math.max(0, 3 - eyesCount)
  const voiceRemaining = Math.max(0, 3 - voiceCount)

  const tabs = [
    { id: 'media', label: 'IMAGE / VIDEO', icon: Image },
    { id: 'voice', label: 'VOICE INTELLIGENCE', icon: Mic },
  ]

  return (
    <Layout profile={profile} onSignOut={signOut} title="DEEPFAKE INTELLIGENCE">
      <div style={{ position: 'relative', minHeight: '100%' }}>
        {/* Grid lines background — same subtle texture as the Dashboard */}
        <GridLines />
      <div style={{ position: 'relative', zIndex: 1, padding: '28px 28px 48px', maxWidth: 1200, margin: '0 auto' }}>

        {/* Hero */}
        <div style={{ position: 'relative', height: 280, borderRadius: 24, overflow: 'hidden', marginBottom: 36, background: '#060606' }}>
          <video autoPlay muted loop playsInline style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }}>
            <source src="/assets/video/blob-eyes.mp4" type="video/mp4" />
          </video>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.85))', border: '1px solid var(--ovw-0p06)', borderRadius: 24 }} />
          <div style={{ position: 'absolute', bottom: 20, left: 20, zIndex: 2 }}>
            <h1 style={{ fontFamily: 'Bebas Neue', fontSize: 42, letterSpacing: '0.1em', color: '#F5F5F7', lineHeight: 1 }}>DEEPFAKE INTELLIGENCE</h1>
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.2em', color: 'var(--ovw-0p4)' }}>IMAGE · VIDEO · VOICE ANALYSIS</p>
          </div>
          <div style={{ position: 'absolute', top: 20, right: 20, zIndex: 2, display: 'flex', gap: 10 }}>
            <div style={{ padding: '6px 14px', borderRadius: 8, background: eyesRemaining > 0 ? 'rgba(48,209,88,0.1)' : 'rgba(255,45,45,0.1)', border: `1px solid ${eyesRemaining > 0 ? 'rgba(48,209,88,0.3)' : 'rgba(255,45,45,0.3)'}`, fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.1em', color: eyesRemaining > 0 ? 'var(--safe)' : 'var(--danger)' }}>
              MEDIA {eyesRemaining}/3
            </div>
            <div style={{ padding: '6px 14px', borderRadius: 8, background: voiceRemaining > 0 ? 'rgba(48,209,88,0.1)' : 'rgba(255,45,45,0.1)', border: `1px solid ${voiceRemaining > 0 ? 'rgba(48,209,88,0.3)' : 'rgba(255,45,45,0.3)'}`, fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.1em', color: voiceRemaining > 0 ? 'var(--safe)' : 'var(--danger)' }}>
              VOICE {voiceRemaining}/3
            </div>
          </div>
        </div>

        {/* Module header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28, paddingBottom: 24, borderBottom: '1px solid var(--ovw-0p06)' }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--ovw-0p04)', border: '1px solid var(--ovw-0p1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Eye size={22} style={{ color: 'var(--text-1)' }} />
          </div>
          <div>
            <h2 style={{ fontFamily: 'Bebas Neue', fontSize: 28, letterSpacing: '0.1em', color: 'var(--text-1)', lineHeight: 1 }}>DEEPFAKE INTELLIGENCE SYSTEM</h2>
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.18em', color: 'var(--text-3)', marginTop: 3 }}>SYNTHETIC MEDIA · VOICE CLONING · AI MANIPULATION DETECTION</p>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'var(--ovw-0p03)', border: '1px solid var(--ovw-0p07)', borderRadius: 12, padding: 4 }}>
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as 'media' | 'voice')}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '10px 16px',
                background: activeTab === id ? 'var(--ovw-0p07)' : 'transparent',
                border: activeTab === id ? '1px solid var(--ovw-0p1)' : '1px solid transparent',
                borderRadius: 9,
                fontFamily: 'JetBrains Mono',
                fontSize: 10,
                letterSpacing: '0.1em',
                color: activeTab === id ? 'var(--text-1)' : 'var(--text-3)',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>

        {/* IMAGE / VIDEO TAB */}
        {activeTab === 'media' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Upload — full-width horizontal rectangle */}
            <div style={{ ...card, display: 'flex', gap: 24, alignItems: 'stretch' }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.2em', color: 'var(--text-3)', marginBottom: 14, textTransform: 'uppercase' }}>Upload Media File</p>
                <UploadZone
                  onFile={handleMediaAnalyze}
                  accept="image/*,video/*"
                  label="Drop image or video to analyze"
                  sublabel="IMAGES · VIDEOS · MAX 50MB"
                  loading={eyesScanning}
                  remainingScans={eyesRemaining}
                  onUpgradeClick={() => setUpgradeOpen(true)}
                />
              </div>
              <div style={{ width: 1, background: 'var(--ovw-0p06)', flexShrink: 0 }} />
              <div style={{ minWidth: 180, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 10 }}>
                <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-3)', letterSpacing: '0.1em', marginBottom: 4 }}>DAYE DETECTS</p>
                {['Face Swaps', 'GANs', 'Diffusion Synthesis', 'Neural Rendering', 'Facial Puppeting'].map((tag) => (
                  <span key={tag} style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-3)', background: 'var(--ovw-0p04)', padding: '4px 10px', borderRadius: 5, border: '1px solid var(--ovw-0p07)', display: 'block' }}>{tag}</span>
                ))}
              </div>
            </div>

            {eyesError && (
              <div style={{ padding: '12px 16px', borderRadius: 12, background: 'rgba(255,45,45,0.06)', border: '1px solid rgba(255,45,45,0.18)' }}>
                <p style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--danger)' }}>{eyesError}</p>
              </div>
            )}

            {/* Results — full-width below */}
            <div style={card}>
              <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.2em', color: 'var(--text-3)', marginBottom: 18, textTransform: 'uppercase' }}>Analysis Results</p>
              {eyesScanning ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 0', gap: 16 }}>
                  <div style={{ position: 'relative', width: 56, height: 56 }}>
                    <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1px solid var(--ovw-0p08)' }} />
                    <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid transparent', borderTopColor: 'var(--text-1)', animation: 'spin 0.8s linear infinite' }} />
                    <Eye size={18} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', color: 'var(--text-3)' }} />
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontFamily: 'JetBrains Mono', fontSize: 12, color: 'var(--text-2)' }}>DAYE is analyzing synthetic markers...</p>
                    <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-3)', marginTop: 4, letterSpacing: '0.12em' }}>SCANNING FOR AI MANIPULATION</p>
                  </div>
                </div>
              ) : eyesResult ? (
                <>
                  <EyesResult scan={eyesResult} />
                  <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--ovw-0p06)' }}>
                    <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.15em', color: 'var(--text-3)', marginBottom: 12 }}>CONFIDENCE ANALYSIS</p>
                    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                      <span style={{ fontFamily: 'Bebas Neue', fontSize: 40, color: eyesResult.result === 'fake' ? 'var(--danger)' : 'var(--safe)', lineHeight: 1, flexShrink: 0 }}>
                        {eyesResult.confidence_score}%
                      </span>
                      <div style={{ flex: 1 }}>
                        <div style={{ height: 6, background: 'var(--ovw-0p06)', borderRadius: 3, overflow: 'hidden', marginBottom: 6 }}>
                          <div style={{
                            height: '100%', borderRadius: 3,
                            background: eyesResult.result === 'fake' ? 'var(--danger)' : 'var(--safe)',
                            width: `${eyesResult.confidence_score}%`,
                            transition: 'width 0.9s cubic-bezier(0.4,0,0.2,1)',
                            boxShadow: `0 0 10px ${eyesResult.result === 'fake' ? 'rgba(255,45,45,0.4)' : 'rgba(48,209,88,0.4)'}`,
                          }} />
                        </div>
                        <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-3)', letterSpacing: '0.1em' }}>MODEL CONFIDENCE · {eyesResult.result === 'fake' ? 'SYNTHETIC MARKERS DETECTED' : 'AUTHENTIC SIGNAL'}</p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 0', gap: 10, textAlign: 'center' }}>
                  <Eye size={28} style={{ color: 'var(--text-3)', opacity: 0.5 }} />
                  <p style={{ fontFamily: 'JetBrains Mono', fontSize: 12, color: 'var(--text-3)' }}>Upload media to begin deepfake analysis.</p>
                  <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.1em', opacity: 0.6 }}>IMAGES · VIDEOS</p>
                </div>
              )}
            </div>

            <div style={card}>
              <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.2em', color: 'var(--text-3)', marginBottom: 18, textTransform: 'uppercase' }}>Scan History</p>
              <EyesScanHistory
                key={historyKey}
                userId={user?.id || ''}
                getHistory={getEyesHistory}
                onSelect={(scan: EyesScan) => setEyesResult(scan)}
              />
            </div>
          </div>
        )}

        {/* VOICE INTELLIGENCE TAB */}
        {activeTab === 'voice' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Voice intro */}
            <div style={{ padding: '14px 18px', background: 'rgba(255,149,0,0.05)', border: '1px solid rgba(255,149,0,0.15)', borderRadius: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <Mic size={14} style={{ color: 'var(--warning)' }} />
                <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--warning)', letterSpacing: '0.12em' }}>VOICE INTELLIGENCE MODULE</p>
              </div>
              <p style={{ fontFamily: 'Syne', fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6 }}>
                DAYE analyzes audio for AI voice cloning, emotional manipulation, and synthetic speech patterns. Upload voice recordings, phone call audio, or any suspicious audio file.
              </p>
            </div>

            {/* Upload — full-width horizontal rectangle */}
            <div style={{ ...card, display: 'flex', gap: 24, alignItems: 'stretch' }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.2em', color: 'var(--text-3)', marginBottom: 14, textTransform: 'uppercase' }}>Upload Voice File</p>
                <UploadZone
                  onFile={handleVoiceAnalyze}
                  accept="audio/*"
                  label="Drop voice or audio file to analyze"
                  sublabel="MP3 · WAV · M4A · OGG · AAC"
                  loading={voiceScanning}
                  remainingScans={voiceRemaining}
                  onUpgradeClick={() => setUpgradeOpen(true)}
                />
              </div>
              <div style={{ width: 1, background: 'var(--ovw-0p06)', flexShrink: 0 }} />
              <div style={{ minWidth: 180, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 10 }}>
                <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-3)', letterSpacing: '0.1em', marginBottom: 4 }}>DAYE DETECTS</p>
                {['AI Voice Cloning', 'Emotional Manipulation', 'Synthetic Speech', 'Scam Audio Patterns', 'Voice Deepfakes'].map((tag) => (
                  <span key={tag} style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-3)', background: 'var(--ovw-0p04)', padding: '4px 10px', borderRadius: 5, border: '1px solid var(--ovw-0p07)', display: 'block' }}>{tag}</span>
                ))}
              </div>
            </div>

            {voiceError && (
              <div style={{ padding: '12px 16px', borderRadius: 12, background: 'rgba(255,45,45,0.06)', border: '1px solid rgba(255,45,45,0.18)' }}>
                <p style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--danger)' }}>{voiceError}</p>
              </div>
            )}

            {/* Results — full-width below */}
            <div style={card}>
              <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.2em', color: 'var(--text-3)', marginBottom: 18, textTransform: 'uppercase' }}>Voice Intelligence Results</p>
                {voiceScanning ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 0', gap: 16 }}>
                    <div style={{ position: 'relative', width: 56, height: 56 }}>
                      <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1px solid var(--ovw-0p08)' }} />
                      <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid transparent', borderTopColor: 'var(--warning)', animation: 'spin 0.8s linear infinite' }} />
                      <Mic size={18} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', color: 'var(--text-3)' }} />
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontFamily: 'JetBrains Mono', fontSize: 12, color: 'var(--text-2)' }}>DAYE analyzing voice patterns...</p>
                      <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-3)', marginTop: 4, letterSpacing: '0.12em' }}>SCANNING FOR SYNTHETIC VOICE MARKERS</p>
                    </div>
                  </div>
                ) : voiceResult ? (
                  <VoiceResult scan={voiceResult} />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 0', gap: 10, textAlign: 'center' }}>
                    <Mic size={28} style={{ color: 'var(--text-3)', opacity: 0.5 }} />
                    <p style={{ fontFamily: 'JetBrains Mono', fontSize: 12, color: 'var(--text-3)' }}>Upload audio to begin voice intelligence analysis.</p>
                    <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.1em', opacity: 0.6 }}>MP3 · WAV · M4A · OGG</p>
                  </div>
                )}
              </div>

            {/* Voice history */}
            {voiceHistory.length > 0 && (
              <div style={card}>
                  <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.2em', color: 'var(--text-3)', marginBottom: 18, textTransform: 'uppercase' }}>Voice Scan History</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                    {voiceHistory.map((scan, i) => {
                      const cfg = VOICE_VERDICT_CONFIG[scan.verdict] || VOICE_VERDICT_CONFIG.uncertain
                      return (
                        <button
                          key={scan.id}
                          onClick={() => setVoiceResult(scan)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 14,
                            padding: '12px 0',
                            background: 'none',
                            border: 'none',
                            borderBottom: i < voiceHistory.length - 1 ? '1px solid var(--ovw-0p05)' : 'none',
                            cursor: 'pointer',
                            textAlign: 'left',
                          }}
                        >
                          <Mic size={14} style={{ color: cfg.color, flexShrink: 0 }} />
                          <span style={{ fontFamily: 'Syne', fontSize: 13, color: 'var(--text-2)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{scan.file_name}</span>
                          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: cfg.color, flexShrink: 0 }}>{scan.manipulation_probability}%</span>
                        </button>
                      )
                    })}
                  </div>
                  {voiceHistory.length >= 2 && (
                    <div style={{ marginTop: 18, paddingTop: 14, borderTop: '1px solid var(--ovw-0p05)' }}>
                      <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.15em', color: 'var(--text-3)', marginBottom: 12 }}>MANIPULATION TREND</p>
                      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 52 }}>
                        {voiceHistory.slice(0, 6).reverse().map((scan) => {
                          const h = Math.max(4, (scan.manipulation_probability / 100) * 44)
                          const color = scan.manipulation_probability >= 60 ? 'var(--danger)' : scan.manipulation_probability >= 30 ? 'var(--warning)' : 'var(--safe)'
                          return (
                            <div key={scan.id} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                              <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-3)' }}>{scan.manipulation_probability}%</span>
                              <div style={{ width: '100%', height: h, background: color, borderRadius: 3, opacity: 0.75, boxShadow: `0 0 6px ${color}40` }} />
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
            )}
          </div>
        )}
      </div>
      </div>


      <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .deepfake-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </Layout>
  )
}
