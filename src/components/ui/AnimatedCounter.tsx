import { useEffect, useRef } from 'react'
import type { CSSProperties } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface AnimatedCounterProps {
  target: number
  prefix?: string
  suffix?: string
  duration?: number
  style?: CSSProperties
}

export function AnimatedCounter({
  target,
  prefix = '',
  suffix = '',
  duration = 2.2,
  style = {},
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const obj = { val: 0 }
    gsap.to(obj, {
      val: target,
      duration,
      ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      onUpdate: function () {
        el.textContent = prefix + Math.ceil(obj.val) + suffix
      },
    })
  }, [target, prefix, suffix, duration])

  return (
    <span ref={ref} style={style}>
      {prefix}0{suffix}
    </span>
  )
}
