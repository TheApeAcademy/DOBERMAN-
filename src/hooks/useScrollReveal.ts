import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

interface ScrollRevealOptions {
  y?: number
  x?: number
  rotate?: number
  scale?: number
  duration?: number
  delay?: number
  start?: string
}

export function useScrollReveal(options: ScrollRevealOptions = {}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const {
      y = 60,
      x = 0,
      rotate = 0,
      scale = 1,
      duration = 0.9,
      delay = 0,
      start = 'top 85%',
    } = options

    const tween = gsap.fromTo(
      el,
      { opacity: 0, y, x, rotate, scale: scale === 1 ? 0.96 : scale },
      {
        opacity: 1,
        y: 0,
        x: 0,
        rotate: 0,
        scale: 1,
        duration,
        delay,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start,
          toggleActions: 'play none none none',
        },
      }
    )

    return () => {
      tween.kill()
      ScrollTrigger.getAll()
        .filter((t) => t.vars.trigger === el)
        .forEach((t) => t.kill())
    }
  }, [])

  return ref
}
