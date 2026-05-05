import { motion } from 'framer-motion'
import type { CSSProperties } from 'react'

interface Props {
  text: string
  style?: CSSProperties
  className?: string
  delay?: number
  stagger?: number
  autoAnimate?: boolean
}

const wordVariant = {
  hidden: { y: '115%' },
  visible: (i: number) => ({
    y: 0,
    transition: { duration: 0.72, delay: i * 0.075, ease: [0.25, 0.1, 0.25, 1] as const },
  }),
}

export function SplitReveal({ text, style, className, delay = 0, stagger = 0.075, autoAnimate = false }: Props) {
  const words = text.split(' ')

  const motionProps = autoAnimate
    ? { initial: 'hidden', animate: 'visible' }
    : { initial: 'hidden', whileInView: 'visible' as const, viewport: { once: true, margin: '-30px' } }

  return (
    <motion.div
      style={{ display: 'flex', flexWrap: 'wrap', ...style }}
      className={className}
      {...motionProps}
    >
      {words.map((word, i) => (
        <span key={i} style={{ display: 'inline-block', overflow: 'hidden', marginRight: '0.28em', lineHeight: 'inherit' }}>
          <motion.span
            style={{ display: 'inline-block' }}
            variants={wordVariant}
            custom={i + delay / stagger}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </motion.div>
  )
}
