import type React from 'react'

interface VideoBlobProps {
  src: string
  opacity?: number
  blendMode?: string
  style?: React.CSSProperties
  cover?: boolean
}

export function VideoBlob({ src, opacity = 0.7, blendMode = 'screen', style = {}, cover = false }: VideoBlobProps) {
  return (
    <video
      autoPlay muted loop playsInline
      style={{
        position: 'absolute',
        ...(cover ? { inset: 0, width: '100%', height: '100%', objectFit: 'cover' as const } : {}),
        mixBlendMode: blendMode as React.CSSProperties['mixBlendMode'],
        opacity,
        pointerEvents: 'none',
        ...style,
      }}
    >
      <source src={src} type="video/mp4" />
    </video>
  )
}
