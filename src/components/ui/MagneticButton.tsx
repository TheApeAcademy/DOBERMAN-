import { useRef } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import type { CSSProperties, MouseEvent, ReactNode } from 'react'

interface Props {
  children: ReactNode
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void
  style?: CSSProperties
  className?: string
  strength?: number
}

export function MagneticButton({ children, onClick, style, className, strength = 0.32 }: Props) {
  const ref = useRef<HTMLButtonElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 360, damping: 22 })
  const sy = useSpring(y, { stiffness: 360, damping: 22 })

  const onMove = (e: MouseEvent) => {
    if (!ref.current) return
    const r = ref.current.getBoundingClientRect()
    x.set((e.clientX - r.left - r.width / 2) * strength)
    y.set((e.clientY - r.top - r.height / 2) * strength)
  }

  const onLeave = () => { x.set(0); y.set(0) }

  return (
    <motion.button
      ref={ref}
      style={{ ...style, x: sx, y: sy }}
      className={className}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
    >
      {children}
    </motion.button>
  )
}
