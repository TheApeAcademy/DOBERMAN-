import { useState } from 'react'
import { Wifi, Plus, X, Zap } from 'lucide-react'

const QUICK_DEVICES = [
  'Router',
  'Smart TV',
  'Smart Speaker',
  'Security Camera',
  'Laptop',
  'Smartphone',
  'Printer',
  'Gaming Console',
  'Smart Doorbell',
  'NAS Device',
  'Smart Thermostat',
  'IP Camera',
]

interface NoseScannerProps {
  onAnalyze: (description: string, devices: string[]) => void
  scanning: boolean
}

export function NoseScanner({ onAnalyze, scanning }: NoseScannerProps) {
  const [description, setDescription] = useState('')
  const [selectedDevices, setSelectedDevices] = useState<string[]>([])
  const [customDevice, setCustomDevice] = useState('')

  const toggleDevice = (device: string) => {
    setSelectedDevices((prev) =>
      prev.includes(device) ? prev.filter((d) => d !== device) : [...prev, device]
    )
  }

  const addCustom = () => {
    if (customDevice.trim() && !selectedDevices.includes(customDevice.trim())) {
      setSelectedDevices((prev) => [...prev, customDevice.trim()])
      setCustomDevice('')
    }
  }

  const handleSubmit = () => {
    if (!description.trim() && selectedDevices.length === 0) return
    const desc = description.trim() || `Network environment with: ${selectedDevices.join(', ')}`
    onAnalyze(desc, selectedDevices)
  }

  return (
    <div className="space-y-5">
      {/* Description */}
      <div className="space-y-2">
        <label className="text-text-secondary font-label text-xs font-medium tracking-wide">
          DESCRIBE YOUR NETWORK ENVIRONMENT
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g. I have a TP-Link router, Ring doorbell, 2 Samsung smart TVs, a MacBook, and an HP printer on my home network. My router password is the default one that came with the box."
          className="input resize-none h-28"
        />
        <p className="text-text-muted font-label text-xs">
          More detail = better threat analysis. Include device brands and models if known.
        </p>
      </div>

      {/* Quick-add chips */}
      <div className="space-y-2">
        <label className="text-text-secondary font-label text-xs font-medium tracking-wide">
          QUICK-ADD DEVICES
        </label>
        <div className="flex flex-wrap gap-2">
          {QUICK_DEVICES.map((device) => (
            <button
              key={device}
              onClick={() => toggleDevice(device)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-label font-medium transition-all duration-200 ${
                selectedDevices.includes(device)
                  ? 'bg-purple-900/30 text-purple-300 border border-purple-700/50'
                  : 'bg-bg-tertiary text-text-secondary border border-border-color hover:border-text-muted'
              }`}
            >
              {selectedDevices.includes(device) ? <X size={10} /> : <Plus size={10} />}
              {device}
            </button>
          ))}
        </div>
      </div>

      {/* Custom device */}
      <div className="flex gap-2">
        <input
          type="text"
          value={customDevice}
          onChange={(e) => setCustomDevice(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addCustom()}
          placeholder="Add custom device..."
          className="input flex-1"
        />
        <button onClick={addCustom} className="btn-secondary px-3">
          <Plus size={16} />
        </button>
      </div>

      {/* Selected devices summary */}
      {selectedDevices.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 bg-bg-tertiary rounded-lg border border-border-color">
          {selectedDevices.map((device) => (
            <span
              key={device}
              className="flex items-center gap-1 text-xs font-label text-text-secondary bg-bg-primary px-2 py-1 rounded border border-border-color"
            >
              <Wifi size={10} className="text-purple-400" />
              {device}
              <button onClick={() => toggleDevice(device)} className="text-text-muted hover:text-accent-red ml-1">
                <X size={10} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Analyze button */}
      <button
        onClick={handleSubmit}
        disabled={(!description.trim() && selectedDevices.length === 0) || scanning}
        className="w-full py-3"
        style={{
          background: '#8B5CF6',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontFamily: 'Inter, sans-serif',
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          cursor: !description.trim() && selectedDevices.length === 0 ? 'not-allowed' : 'pointer',
          opacity: !description.trim() && selectedDevices.length === 0 ? 0.5 : 1,
          transition: 'all 0.2s',
        }}
      >
        {scanning ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Scanning network...
          </>
        ) : (
          <>
            <Zap size={16} />
            Analyze My Network
          </>
        )}
      </button>
    </div>
  )
}
