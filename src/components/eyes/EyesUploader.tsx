import { useState, useRef, useCallback } from 'react'
import { Upload, File, Image, Video, Music, X, Zap } from 'lucide-react'

interface EyesUploaderProps {
  onAnalyze: (file: File) => void
  scanning: boolean
  accept?: string
  hint?: string
  analyzingLabel?: string
}

export function EyesUploader({
  onAnalyze,
  scanning,
  accept = 'image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,audio/mpeg,audio/wav,audio/ogg',
  hint = 'JPG, PNG, MP4, MP3, WAV - Max 50MB',
  analyzingLabel = 'Analyzing with D0B3RMAN...',
}: EyesUploaderProps) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (f: File) => {
    setFile(f)
    if (f.type.startsWith('image/')) {
      const url = URL.createObjectURL(f)
      setPreview(url)
    } else {
      setPreview(null)
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) handleFile(dropped)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback(() => setDragOver(false), [])

  const getFileIcon = () => {
    if (!file) return null
    if (file.type.startsWith('image/')) return <Image size={16} className="text-accent-blue" />
    if (file.type.startsWith('video/')) return <Video size={16} className="text-accent-blue" />
    return <Music size={16} className="text-accent-blue" />
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1048576).toFixed(1)} MB`
  }

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
          dragOver
            ? 'border-accent-blue bg-accent-blue/5'
            : file
            ? 'border-border-color bg-bg-tertiary'
            : 'border-border-color hover:border-text-muted bg-bg-tertiary/50'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !file && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />

        {file ? (
          <div className="space-y-3">
            {preview ? (
              <img
                src={preview}
                alt="Preview"
                className="max-h-48 mx-auto rounded-lg object-contain"
              />
            ) : (
              <div className="w-16 h-16 mx-auto bg-bg-primary rounded-xl flex items-center justify-center">
                <File size={24} className="text-accent-blue" />
              </div>
            )}
            <div className="flex items-center justify-center gap-2">
              {getFileIcon()}
              <span className="text-text-primary font-body text-sm">{file.name}</span>
              <span className="text-text-muted font-label text-xs">({formatSize(file.size)})</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setFile(null)
                setPreview(null)
              }}
              className="text-text-muted hover:text-accent-red transition-colors flex items-center gap-1 mx-auto text-xs font-label"
            >
              <X size={12} /> Remove
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="w-16 h-16 mx-auto bg-bg-primary rounded-xl flex items-center justify-center border border-border-color">
              <Upload size={24} className="text-text-muted" />
            </div>
            <div>
              <p className="text-text-primary font-body text-sm">
                Drop file here or <span className="text-accent-blue">browse</span>
              </p>
              <p className="text-text-muted font-label text-xs mt-1">
                {hint}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Analyze button */}
      <button
        onClick={() => file && onAnalyze(file)}
        disabled={!file || scanning}
        className="w-full btn-primary py-3"
        style={{ fontSize: '15px' }}
      >
        {scanning ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            {analyzingLabel}
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Zap size={16} />
            Analyze File
          </span>
        )}
      </button>
    </div>
  )
}
