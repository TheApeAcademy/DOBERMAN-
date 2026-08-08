import type { CSSProperties } from 'react'

interface AssetSlotProps {
  id: string
  label: string
  description: string
  width?: string | number
  height?: string | number
  type?: 'image' | 'video' | 'spline' | '3d' | 'lottie'
  borderRadius?: number
  style?: CSSProperties
}

export function AssetSlot({
  id,
  label,
  description,
  width = '100%',
  height = 400,
  type = 'image',
  borderRadius = 16,
  style = {},
}: AssetSlotProps) {
  const typeIcon = {
    image: '🖼',
    video: '🎬',
    spline: '🌐',
    '3d': '💎',
    lottie: '✨',
  }[type]

  return (
    <div
      id={id}
      className="asset-slot"
      style={{ width, height, borderRadius, ...style }}
    >
      <div
        style={{
          position: 'absolute',
          width: 40,
          height: 40,
          borderRadius: '50%',
          border: '1px solid var(--ovw-0p1)',
          top: '50%',
          left: '50%',
          animation: 'pulse-ring 2s ease-out infinite',
        }}
      />
      <span style={{ fontSize: 28, position: 'relative', zIndex: 1 }}>{typeIcon}</span>
      <p className="asset-slot-label" style={{ position: 'relative', zIndex: 1, fontWeight: 600 }}>
        {label}
      </p>
      <p className="asset-slot-label" style={{ position: 'relative', zIndex: 1, opacity: 0.6 }}>
        {description}
      </p>
    </div>
  )
}
