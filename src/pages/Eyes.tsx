import { useEffect, useState } from 'react'
import { Eye, Mic, FileText } from 'lucide-react'
import { motion } from 'framer-motion'
import { Layout } from '../components/layout/Layout'
import { EyesUploader } from '../components/eyes/EyesUploader'
import { EyesResult } from '../components/eyes/EyesResult'
import { EyesScanHistory } from '../components/eyes/EyesScanHistory'
import { VoiceResult } from '../components/voice/VoiceResult'
import { TextResult } from '../components/text/TextResult'
import { useAuth } from '../hooks/useAuth'
import { useEyes } from '../hooks/useEyes'
import { useVoice } from '../hooks/useVoice'
import { useText } from '../hooks/useText'
import { dayeNotify } from '../components/daye/DayeAssistant'
import { GridLines } from '../components/ui/GridLines'
import type { EyesScan, VoiceScan, TextScan } from '../lib/supabase'

const MEDIA_DETECTS = ['Face Swaps', 'GANs', 'Diffusion Synthesis', 'Neural Rendering', 'Facial Puppeting']
const VOICE_DETECTS = ['AI Voice Cloning', 'Emotional Manipulation', 'Synthetic Speech', 'Scam Audio Patterns']
const TEXT_DETECTS = ['Statistical Uniformity', 'Predictable Phrasing', 'Structural Tells', 'Missing Idiosyncrasy']

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

type Tab = 'media' | 'voice' | 'text'

export default function Eyes() {
  const { user, profile, signOut } = useAuth()
  const { scanning: eyesScanning, result: eyesResult, error: eyesError, analyze: eyesAnalyze, getHistory: getEyesHistory, getDailyCount: getEyesCount, setResult: setEyesResult } = useEyes(user?.id)
  const { scanning: voiceScanning, result: voiceResult, error: voiceError, analyze: voiceAnalyze, getHistory: getVoiceHistory, getDailyCount: getVoiceCount, setResult: setVoiceResult } = useVoice(user?.id)
  const { scanning: textScanning, result: textResult, error: textError, analyze: textAnalyze, getHistory: getTextHistory, getDailyCount: getTextCount, setResult: setTextResult } = useText(user?.id)

  const [activeTab, setActiveTab] = useState<Tab>('media')
  const [historyKey, setHistoryKey] = useState(0)
  const [eyesCount, setEyesCount] = useState(0)
  const [voiceCount, setVoiceCount] = useState(0)
  const [textCount, setTextCount] = useState(0)
  const [voiceHistory, setVoiceHistory] = useState<VoiceScan[]>([])
  const [textHistory, setTextHistory] = useState<TextScan[]>([])
  const [textInput, setTextInput] = useState('')

  useEffect(() => {
    if (user) {
      getEyesCount().then(setEyesCount)
      getVoiceCount().then(setVoiceCount)
      getTextCount().then(setTextCount)
    }
  }, [user])

  useEffect(() => {
    if (activeTab === 'voice' && user) getVoiceHistory().then(setVoiceHistory)
    if (activeTab === 'text' && user) getTextHistory().then(setTextHistory)
  }, [activeTab, user])

  const handleMediaAnalyze = async (file: File) => {
    await eyesAnalyze(file)
    setEyesCount(await getEyesCount())
    setHistoryKey((k) => k + 1)
  }

  const handleVoiceAnalyze = async (file: File) => {
    await voiceAnalyze(file)
    setVoiceCount(await getVoiceCount())
    setVoiceHistory(await getVoiceHistory())
  }

  const handleTextAnalyze = async () => {
    if (!textInput.trim()) return
    await textAnalyze(textInput.trim())
    setTextCount(await getTextCount())
    setTextHistory(await getTextHistory())
  }

  useEffect(() => {
    if (eyesResult) {
      dayeNotify({
        context_type: 'deepfake_result',
        data: { file_type: eyesResult.file_type, result: eyesResult.result, confidence_score: eyesResult.confidence_score },
        message: eyesResult.explanation,
      })
    }
  }, [eyesResult])

  useEffect(() => {
    if (voiceResult) {
      dayeNotify({
        context_type: 'voice_result',
        data: { manipulation_probability: voiceResult.manipulation_probability, verdict: voiceResult.verdict },
        message: voiceResult.daye_analysis,
      })
    }
  }, [voiceResult])

  useEffect(() => {
    if (textResult) {
      dayeNotify({
        context_type: 'text_result',
        data: { verdict: textResult.verdict, ai_probability: textResult.ai_probability, word_count: textResult.word_count },
        message: textResult.explanation,
      })
    }
  }, [textResult])

  const eyesRemaining = Math.max(0, 3 - eyesCount)
  const voiceRemaining = Math.max(0, 3 - voiceCount)
  const textRemaining = Math.max(0, 5 - textCount)
  const textWordCount = textInput.trim().split(/\s+/).filter(Boolean).length

  const tabs: { id: Tab; label: string; icon: typeof Eye }[] = [
    { id: 'media', label: 'IMAGE / VIDEO', icon: Eye },
    { id: 'voice', label: 'VOICE', icon: Mic },
    { id: 'text', label: 'TEXT', icon: FileText },
  ]

  return (
    <Layout profile={profile} onSignOut={signOut} title="Deepfake Intelligence">
      <div style={{ position: 'relative', minHeight: '100%' }}>
        {/* Grid lines background — same subtle texture as the Dashboard */}
        <GridLines />
      <div style={{ position: 'relative', zIndex: 1, padding: 'clamp(20px, 4vw, 32px)', maxWidth: 1100, margin: '0 auto', paddingBottom: 60 }}>

        {/* Module header — square identity tile + title, no decorative video */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28, paddingBottom: 24, borderBottom: '1px solid var(--ovw-0p06)', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: 88, height: 88, borderRadius: 20, overflow: 'hidden', flexShrink: 0, background: '#060606' }}>
            <img
              src="/assets/video/0a068fc3612b18fb193aa68da61d7bb3.jpg"
              alt=""
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', pointerEvents: 'none' }}
            />
            <div style={{ position: 'absolute', inset: 0, border: '1px solid var(--ovw-0p1)', borderRadius: 20 }} />
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <h1 style={{
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, sans-serif',
              fontWeight: 700, fontSize: 24, color: 'var(--text-1)', lineHeight: 1.1,
            }}>
              Deepfake Intelligence
            </h1>
            <p style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, sans-serif', fontSize: 13, color: 'var(--text-2)', marginTop: 4 }}>
              AI-powered detection of synthetic media
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'var(--ovw-0p03)', border: '1px solid var(--ovw-0p07)', borderRadius: 12, padding: 4 }}>
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
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
                fontFamily: 'JetBrains Mono, monospace',
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

        {/* MEDIA TAB */}
        {activeTab === 'media' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16, alignItems: 'start', marginBottom: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={card}>
                  <p style={sectionLabel}>Upload Media</p>
                  <EyesUploader onAnalyze={handleMediaAnalyze} scanning={eyesScanning} />
                  <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'var(--text-3)', marginTop: 14, letterSpacing: '0.06em' }}>
                    Supported: Images, Videos · Max 50MB · {eyesRemaining}/3 scans today
                  </p>
                </div>
                {eyesError && (
                  <div style={{ padding: '12px 16px', borderRadius: 14, background: 'rgba(255,45,45,0.06)', border: '1px solid rgba(255,45,45,0.18)' }}>
                    <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--danger)' }}>{eyesError}</p>
                  </div>
                )}
              </div>

              <div style={card}>
                <p style={sectionLabel}>Analysis Results</p>
                {eyesScanning ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 0', gap: 16 }}>
                    <div style={{ position: 'relative', width: 52, height: 52 }}>
                      <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1px solid rgba(10,132,255,0.12)' }} />
                      <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid transparent', borderTopColor: '#0A84FF', animation: 'spin 0.9s linear infinite' }} />
                      <Eye size={18} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', color: '#0A84FF' }} />
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, sans-serif', fontSize: 14, color: 'var(--text-2)' }}>Analyzing media…</p>
                      <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'var(--text-3)', marginTop: 4, letterSpacing: '0.1em' }}>SCANNING FOR SYNTHETIC MARKERS</p>
                    </div>
                  </div>
                ) : eyesResult ? (
                  <EyesResult scan={eyesResult} />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', padding: '4px 0 12px', gap: 20 }}>
                    <div>
                      <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.14em', color: 'var(--text-3)', marginBottom: 10 }}>DAYE DETECTS</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {MEDIA_DETECTS.map((d) => (
                          <motion.span
                            key={d}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            style={{
                              padding: '7px 14px', borderRadius: 100,
                              background: 'rgba(10,132,255,0.08)', border: '1px solid rgba(10,132,255,0.18)',
                              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, sans-serif',
                              fontSize: 12, color: 'rgba(10,132,255,0.9)',
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

            <div style={card}>
              <p style={sectionLabel}>Scan History</p>
              <EyesScanHistory
                key={historyKey}
                userId={user?.id || ''}
                getHistory={getEyesHistory}
                onSelect={(scan: EyesScan) => setEyesResult(scan)}
              />
            </div>
          </>
        )}

        {/* VOICE TAB */}
        {activeTab === 'voice' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16, alignItems: 'start', marginBottom: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={card}>
                  <p style={sectionLabel}>Upload Voice File</p>
                  <EyesUploader
                    onAnalyze={handleVoiceAnalyze}
                    scanning={voiceScanning}
                    accept="audio/mpeg,audio/wav,audio/ogg,audio/mp4,audio/aac"
                    hint="MP3, WAV, M4A, OGG, AAC - Max 50MB"
                    analyzingLabel="DAYE analyzing voice patterns..."
                  />
                  <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'var(--text-3)', marginTop: 14, letterSpacing: '0.06em' }}>
                    Supported: MP3, WAV, M4A, OGG · Max 50MB · {voiceRemaining}/3 scans today
                  </p>
                </div>
                {voiceError && (
                  <div style={{ padding: '12px 16px', borderRadius: 14, background: 'rgba(255,45,45,0.06)', border: '1px solid rgba(255,45,45,0.18)' }}>
                    <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--danger)' }}>{voiceError}</p>
                  </div>
                )}
              </div>

              <div style={card}>
                <p style={sectionLabel}>Voice Intelligence Results</p>
                {voiceScanning ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 0', gap: 16 }}>
                    <div style={{ position: 'relative', width: 52, height: 52 }}>
                      <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1px solid rgba(255,149,0,0.12)' }} />
                      <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid transparent', borderTopColor: 'var(--warning)', animation: 'spin 0.9s linear infinite' }} />
                      <Mic size={18} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', color: 'var(--warning)' }} />
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, sans-serif', fontSize: 14, color: 'var(--text-2)' }}>Analyzing voice…</p>
                      <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'var(--text-3)', marginTop: 4, letterSpacing: '0.1em' }}>SCANNING FOR SYNTHETIC VOICE MARKERS</p>
                    </div>
                  </div>
                ) : voiceResult ? (
                  <VoiceResult scan={voiceResult} />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', padding: '4px 0 12px', gap: 20 }}>
                    <div>
                      <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.14em', color: 'var(--text-3)', marginBottom: 10 }}>DAYE DETECTS</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {VOICE_DETECTS.map((d) => (
                          <motion.span
                            key={d}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            style={{
                              padding: '7px 14px', borderRadius: 100,
                              background: 'rgba(255,149,0,0.08)', border: '1px solid rgba(255,149,0,0.18)',
                              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, sans-serif',
                              fontSize: 12, color: 'var(--warning)',
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

            {voiceHistory.length > 0 && (
              <div style={card}>
                <p style={sectionLabel}>Voice Scan History</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {voiceHistory.map((scan, i) => (
                    <button
                      key={scan.id}
                      onClick={() => setVoiceResult(scan)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0',
                        background: 'none', border: 'none',
                        borderBottom: i < voiceHistory.length - 1 ? '1px solid var(--ovw-0p05)' : 'none',
                        cursor: 'pointer', textAlign: 'left',
                      }}
                    >
                      <Mic size={14} style={{ color: 'var(--warning)', flexShrink: 0 }} />
                      <span style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, sans-serif', fontSize: 13, color: 'var(--text-2)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{scan.file_name}</span>
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'var(--warning)', flexShrink: 0 }}>{scan.manipulation_probability}%</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* TEXT TAB */}
        {activeTab === 'text' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16, alignItems: 'start', marginBottom: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={card}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <p style={{ ...sectionLabel, marginBottom: 0 }}>Paste Text</p>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: textWordCount < 20 ? 'var(--warning)' : 'var(--text-3)' }}>{textWordCount} words {textWordCount < 20 && '(min 20)'}</span>
                  </div>
                  <textarea
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    disabled={textRemaining <= 0 || textScanning}
                    placeholder="Paste an essay, article, email, or any passage of text..."
                    className="w-full rounded-xl border border-border-color bg-bg-tertiary/50 text-text-primary p-4 text-sm leading-relaxed resize-y outline-none"
                    style={{ minHeight: 160, fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, sans-serif' }}
                  />
                  <button
                    onClick={handleTextAnalyze}
                    disabled={textRemaining <= 0 || textScanning || textWordCount < 20}
                    className="w-full btn-primary py-3 mt-3"
                    style={{ fontSize: 15 }}
                  >
                    {textScanning ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        DAYE analyzing writing patterns...
                      </span>
                    ) : (
                      'Run Text AI Detection'
                    )}
                  </button>
                  <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'var(--text-3)', marginTop: 14, letterSpacing: '0.06em' }}>
                    Min 20 words · {textRemaining}/5 scans today
                  </p>
                </div>
                {textError && (
                  <div style={{ padding: '12px 16px', borderRadius: 14, background: 'rgba(255,45,45,0.06)', border: '1px solid rgba(255,45,45,0.18)' }}>
                    <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--danger)' }}>{textError}</p>
                  </div>
                )}
              </div>

              <div style={card}>
                <p style={sectionLabel}>Analysis Results</p>
                {textScanning ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 0', gap: 16 }}>
                    <div style={{ position: 'relative', width: 52, height: 52 }}>
                      <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1px solid rgba(10,132,255,0.12)' }} />
                      <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid transparent', borderTopColor: '#0A84FF', animation: 'spin 0.9s linear infinite' }} />
                      <FileText size={18} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', color: '#0A84FF' }} />
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, sans-serif', fontSize: 14, color: 'var(--text-2)' }}>Analyzing writing patterns…</p>
                      <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'var(--text-3)', marginTop: 4, letterSpacing: '0.1em' }}>SCANNING FOR AI GENERATION SIGNALS</p>
                    </div>
                  </div>
                ) : textResult ? (
                  <TextResult scan={textResult} />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', padding: '4px 0 12px', gap: 20 }}>
                    <div>
                      <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.14em', color: 'var(--text-3)', marginBottom: 10 }}>DAYE DETECTS</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {TEXT_DETECTS.map((d) => (
                          <motion.span
                            key={d}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            style={{
                              padding: '7px 14px', borderRadius: 100,
                              background: 'rgba(10,132,255,0.08)', border: '1px solid rgba(10,132,255,0.18)',
                              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, sans-serif',
                              fontSize: 12, color: 'rgba(10,132,255,0.9)',
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

            {textHistory.length > 0 && (
              <div style={card}>
                <p style={sectionLabel}>Scan History</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {textHistory.map((scan, i) => (
                    <button
                      key={scan.id}
                      onClick={() => setTextResult(scan)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0',
                        background: 'none', border: 'none',
                        borderBottom: i < textHistory.length - 1 ? '1px solid var(--ovw-0p05)' : 'none',
                        cursor: 'pointer', textAlign: 'left',
                      }}
                    >
                      <FileText size={14} style={{ color: '#0A84FF', flexShrink: 0 }} />
                      <span style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, sans-serif', fontSize: 13, color: 'var(--text-2)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {scan.content_excerpt.slice(0, 60)}{scan.content_excerpt.length > 60 ? '…' : ''}
                      </span>
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#0A84FF', flexShrink: 0 }}>{scan.ai_probability}%</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </Layout>
  )
}
