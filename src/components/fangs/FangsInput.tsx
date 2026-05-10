import { useState } from 'react'
import { Crosshair } from 'lucide-react'
import type { FangsScan } from '../../lib/supabase'

const INPUT_TYPES: { value: FangsScan['input_type']; label: string; placeholder: string }[] = [
  { value: 'url', label: 'URL', placeholder: 'https://suspicious-site.com/payload.exe' },
  { value: 'ip', label: 'IP Address', placeholder: '185.220.101.45' },
  { value: 'domain', label: 'Domain', placeholder: 'malicious-domain.ru' },
  { value: 'hash', label: 'File Hash', placeholder: 'MD5 / SHA1 / SHA256 hash of a file' },
  { value: 'email', label: 'Email Header', placeholder: 'Paste raw email headers here...' },
  { value: 'code', label: 'Code / Script', placeholder: 'Paste suspicious code, PowerShell, or script here...' },
  { value: 'text', label: 'Free Text', placeholder: 'Describe the threat or paste any suspicious content...' },
]

const THREAT_TYPES: { value: FangsScan['threat_type']; label: string; desc: string }[] = [
  { value: 'phishing', label: 'PHISHING', desc: 'Email / credential theft' },
  { value: 'malware', label: 'MALWARE', desc: 'Virus / ransomware / spyware' },
  { value: 'intrusion', label: 'INTRUSION', desc: 'C2 / APT / lateral movement' },
  { value: 'vulnerability', label: 'VULN', desc: 'CVE / exploit / patch gap' },
  { value: 'darkweb', label: 'DARK WEB', desc: 'Data leak / breach exposure' },
  { value: 'general', label: 'GENERAL', desc: 'Unknown / broad analysis' },
]

interface FangsInputProps {
  onAnalyze: (inputValue: string, inputType: FangsScan['input_type'], threatType: FangsScan['threat_type']) => void
  scanning: boolean
  remainingScans: number
  onUpgradeClick: () => void
}

export function FangsInput({ onAnalyze, scanning, remainingScans, onUpgradeClick }: FangsInputProps) {
  const [inputValue, setInputValue] = useState('')
  const [inputType, setInputType] = useState<FangsScan['input_type']>('url')
  const [threatType, setThreatType] = useState<FangsScan['threat_type']>('general')

  const currentPlaceholder = INPUT_TYPES.find((t) => t.value === inputType)?.placeholder || ''

  const handleSubmit = () => {
    if (!inputValue.trim()) return
    onAnalyze(inputValue.trim(), inputType, threatType)
  }

  const canSubmit = inputValue.trim().length > 0 && !scanning && remainingScans > 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Daily limit */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.07)' }}>
        <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.12em', color: 'var(--text-3)' }}>DAILY SCANS REMAINING</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', gap: 4 }}>
            {[...Array(5)].map((_, i) => (
              <div key={i} style={{ width: 20, height: 3, borderRadius: 2, background: i < remainingScans ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.08)' }} />
            ))}
          </div>
          <span style={{ fontFamily: 'Bebas Neue', fontSize: 20, letterSpacing: '0.05em', color: remainingScans > 0 ? 'var(--text-1)' : 'var(--danger)' }}>
            {remainingScans}/5
          </span>
        </div>
      </div>

      {/* Input type selector */}
      <div>
        <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.18em', color: 'var(--text-3)', marginBottom: 10, textTransform: 'uppercase' }}>Input Type</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {INPUT_TYPES.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setInputType(value)}
              style={{
                padding: '5px 12px',
                borderRadius: 8,
                fontFamily: 'JetBrains Mono',
                fontSize: 10,
                letterSpacing: '0.08em',
                border: inputType === value
                  ? '1px solid rgba(255,255,255,0.3)'
                  : '1px solid rgba(255,255,255,0.07)',
                background: inputType === value
                  ? 'rgba(255,255,255,0.08)'
                  : 'rgba(255,255,255,0.02)',
                color: inputType === value ? 'var(--text-1)' : 'var(--text-3)',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Input value */}
      <div>
        <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.18em', color: 'var(--text-3)', marginBottom: 8, textTransform: 'uppercase' }}>
          {INPUT_TYPES.find((t) => t.value === inputType)?.label || 'Input'}
        </p>
        <textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={currentPlaceholder}
          rows={inputType === 'email' || inputType === 'code' ? 6 : 3}
          style={{
            width: '100%',
            padding: '12px 14px',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 12,
            color: 'var(--text-1)',
            fontFamily: 'JetBrains Mono',
            fontSize: 12,
            lineHeight: 1.6,
            resize: 'vertical',
            outline: 'none',
            boxSizing: 'border-box',
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.22)' }}
          onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
        />
      </div>

      {/* Threat type selector */}
      <div>
        <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.18em', color: 'var(--text-3)', marginBottom: 10, textTransform: 'uppercase' }}>Analysis Mode</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
          {THREAT_TYPES.map(({ value, label, desc }) => (
            <button
              key={value}
              onClick={() => setThreatType(value)}
              style={{
                padding: '10px 8px',
                borderRadius: 10,
                textAlign: 'left',
                border: threatType === value
                  ? '1px solid rgba(255,255,255,0.25)'
                  : '1px solid rgba(255,255,255,0.06)',
                background: threatType === value
                  ? 'rgba(255,255,255,0.06)'
                  : 'rgba(255,255,255,0.02)',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', color: threatType === value ? 'var(--text-1)' : 'var(--text-3)', marginBottom: 2 }}>
                {label}
              </p>
              <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-3)', letterSpacing: '0.04em', opacity: 0.7 }}>
                {desc}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Submit */}
      {remainingScans === 0 ? (
        <button
          onClick={onUpgradeClick}
          style={{ width: '100%', padding: '14px', borderRadius: 12, background: 'rgba(255,45,45,0.1)', border: '1px solid rgba(255,45,45,0.3)', color: 'var(--danger)', fontFamily: 'JetBrains Mono', fontSize: 12, letterSpacing: '0.1em', cursor: 'pointer' }}
        >
          DAILY LIMIT REACHED - UPGRADE TO PRO
        </button>
      ) : (
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: 12,
            background: canSubmit ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.02)',
            border: canSubmit ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(255,255,255,0.06)',
            color: canSubmit ? 'var(--text-1)' : 'var(--text-3)',
            fontFamily: 'JetBrains Mono',
            fontSize: 12,
            letterSpacing: '0.15em',
            cursor: canSubmit ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => { if (canSubmit) { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)' } }}
          onMouseLeave={(e) => { if (canSubmit) { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)' } }}
        >
          {scanning ? (
            <>
              <div style={{ width: 14, height: 14, borderRadius: '50%', border: '1.5px solid rgba(255,255,255,0.2)', borderTopColor: 'var(--text-1)', animation: 'spin 0.7s linear infinite' }} />
              ANALYZING THREAT...
            </>
          ) : (
            <>
              <Crosshair size={14} />
              RUN THREAT ANALYSIS
            </>
          )}
        </button>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
