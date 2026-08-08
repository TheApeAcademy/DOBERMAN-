import { useState } from 'react'
import { Link2, Shield, ShieldAlert, ShieldCheck, Search, AlertTriangle } from 'lucide-react'

const SF = `-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif`

type ScanStatus = 'idle' | 'scanning' | 'safe' | 'suspicious' | 'danger'

interface ScanResult {
  status: ScanStatus
  url: string
  summary: string
  flags: string[]
}

export function ScarAnalyzer() {
  const [url, setUrl] = useState('')
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<ScanResult | null>(null)

  const handleScan = async () => {
    if (!url.trim() || scanning) return
    setScanning(true)
    setResult(null)

    // Simulate scan — backend integration point
    await new Promise(r => setTimeout(r, 1800))

    const lower = url.toLowerCase()
    const isDangerous = lower.includes('phish') || lower.includes('malware') || lower.includes('.ru/') || lower.includes('click.here')
    const isSuspicious = lower.includes('bit.ly') || lower.includes('tinyurl') || lower.includes('redirect') || lower.includes('free')

    let status: ScanStatus
    let summary: string
    let flags: string[]

    if (isDangerous) {
      status = 'danger'
      summary = 'High-risk indicators detected. Do not visit this link.'
      flags = ['Known phishing pattern', 'Suspicious domain', 'Possible credential harvesting']
    } else if (isSuspicious) {
      status = 'suspicious'
      summary = 'This link shows some suspicious characteristics. Proceed with caution.'
      flags = ['Shortened or redirect URL', 'Verify destination before clicking']
    } else {
      status = 'safe'
      summary = 'No obvious threats detected. Always verify context before clicking unknown links.'
      flags = []
    }

    setResult({ status, url: url.trim(), summary, flags })
    setScanning(false)
  }

  const statusColor = (s: ScanStatus) => {
    if (s === 'safe') return '#30D158'
    if (s === 'suspicious') return '#FF9500'
    if (s === 'danger') return '#FF2D2D'
    return 'var(--ovw-0p4)'
  }

  const StatusIcon = ({ s }: { s: ScanStatus }) => {
    const color = statusColor(s)
    const size = 20
    if (s === 'safe') return <ShieldCheck size={size} style={{ color }} />
    if (s === 'suspicious') return <AlertTriangle size={size} style={{ color }} />
    if (s === 'danger') return <ShieldAlert size={size} style={{ color }} />
    return <Shield size={size} style={{ color }} />
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 40px', display: 'flex', flexDirection: 'column', gap: 20, fontFamily: SF }}>

      {/* Header card */}
      <div style={{
        background: 'var(--ovw-0p03)',
        border: '1px solid var(--ovw-0p07)',
        borderRadius: 18,
        padding: '18px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
      }}>
        <div style={{
          width: 44,
          height: 44,
          borderRadius: 13,
          background: 'rgba(255,149,0,0.08)',
          border: '1px solid rgba(255,149,0,0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Link2 size={20} style={{ color: '#FF9500' }} />
        </div>
        <div>
          <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--ovw-0p88)', letterSpacing: '-0.02em', margin: 0 }}>
            SCAR Link Analyzer
          </p>
          <p style={{ fontSize: 12, color: 'var(--ovw-0p35)', marginTop: 3, margin: '3px 0 0', lineHeight: 1.4 }}>
            Scan any URL for phishing, malware & suspicious patterns
          </p>
        </div>
      </div>

      {/* URL input */}
      <div style={{
        background: 'var(--ovw-0p03)',
        border: '1px solid var(--ovw-0p07)',
        borderRadius: 18,
        padding: '16px 18px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--ovw-0p25)', letterSpacing: '0.06em', textTransform: 'uppercase', margin: 0 }}>
          Link to analyze
        </p>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: 'var(--ovw-0p04)',
          border: '1px solid var(--ovw-0p09)',
          borderRadius: 14,
          padding: '10px 14px',
        }}>
          <Link2 size={14} style={{ color: 'var(--ovw-0p25)', flexShrink: 0 }} />
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleScan() }}
            placeholder="https://example.com/link"
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              outline: 'none',
              fontSize: 15,
              fontFamily: SF,
              color: 'var(--ovw-0p85)',
            }}
          />
        </div>
        <button
          onClick={handleScan}
          disabled={!url.trim() || scanning}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: '13px',
            borderRadius: 14,
            border: 'none',
            background: url.trim() && !scanning ? '#30D158' : 'var(--ovw-0p06)',
            color: url.trim() && !scanning ? '#000' : 'var(--ovw-0p25)',
            fontSize: 15,
            fontWeight: 600,
            fontFamily: SF,
            transition: 'all 0.15s',
          }}
        >
          {scanning ? (
            <>
              <div style={{
                width: 16, height: 16, borderRadius: '50%',
                border: '2px solid rgba(0,0,0,0.2)',
                borderTopColor: '#000',
                animation: 'spin 0.7s linear infinite',
              }} />
              Scanning…
            </>
          ) : (
            <>
              <Search size={15} />
              Analyze Link
            </>
          )}
        </button>
      </div>

      {/* Result */}
      {result && (
        <div style={{
          background: 'var(--ovw-0p03)',
          border: `1px solid ${statusColor(result.status)}22`,
          borderRadius: 18,
          padding: '18px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}>
          {/* Status row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: `${statusColor(result.status)}12`,
              border: `1px solid ${statusColor(result.status)}25`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <StatusIcon s={result.status} />
            </div>
            <div>
              <p style={{ fontSize: 15, fontWeight: 600, color: statusColor(result.status), margin: 0, letterSpacing: '-0.02em', textTransform: 'capitalize' }}>
                {result.status === 'safe' ? 'Link Appears Safe' : result.status === 'suspicious' ? 'Suspicious Link' : 'Dangerous Link'}
              </p>
              <p style={{ fontSize: 12, color: 'var(--ovw-0p4)', marginTop: 2 }}>{result.url}</p>
            </div>
          </div>

          {/* Summary */}
          <p style={{ fontSize: 14, lineHeight: 1.55, color: 'var(--ovw-0p6)', margin: 0 }}>
            {result.summary}
          </p>

          {/* Flags */}
          {result.flags.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {result.flags.map((flag) => (
                <div key={flag} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 12px',
                  borderRadius: 10,
                  background: `${statusColor(result.status)}09`,
                  border: `1px solid ${statusColor(result.status)}18`,
                }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: statusColor(result.status), flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: 'var(--ovw-0p6)', fontFamily: SF }}>{flag}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
