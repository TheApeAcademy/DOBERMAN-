import { useEffect, useRef, useState } from 'react'

export function CustomCursor() {
  const ringRef = useRef<HTMLDivElement>(null)
  const dotRef = useRef<HTMLDivElement>(null)
  const isViewRef = useRef(false)
  const [isView, setIsView] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!mounted) return
    if (window.matchMedia('(pointer: coarse)').matches) return
    const ring = ringRef.current
    const dot = dotRef.current
    if (!ring || !dot) return

    let tX = -200, tY = -200, cX = -200, cY = -200, raf = 0

    const tick = () => {
      cX += (tX - cX) * 0.13
      cY += (tY - cY) * 0.13
      const h = isViewRef.current ? 36 : 20
      ring.style.transform = `translate(${cX - h}px,${cY - h}px)`
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    const onMove = (e: MouseEvent) => {
      tX = e.clientX; tY = e.clientY
      dot.style.transform = `translate(${e.clientX - 3}px,${e.clientY - 3}px)`
      ring.style.opacity = '1'; dot.style.opacity = '0.85'
    }

    const onOver = (e: MouseEvent) => {
      const el = (e.target as Element).closest('[data-cursor]')
      const v = el?.getAttribute('data-cursor') === 'view'
      isViewRef.current = v
      setIsView(v)
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('mouseover', onOver, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseover', onOver)
    }
  }, [mounted])

  if (!mounted || (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches)) return null

  return (
    <>
      <div ref={ringRef} style={{
        position: 'fixed', top: 0, left: 0, pointerEvents: 'none', zIndex: 999997,
        width: isView ? 72 : 40, height: isView ? 72 : 40, borderRadius: '50%',
        border: `1px solid rgba(255,255,255,${isView ? 0.85 : 0.4})`,
        backdropFilter: isView ? 'blur(8px)' : 'none',
        WebkitBackdropFilter: isView ? 'blur(8px)' : 'none',
        background: isView ? 'rgba(255,255,255,0.06)' : 'transparent',
        opacity: 0, willChange: 'transform',
        transition: 'width 0.22s ease, height 0.22s ease, border-color 0.22s, background 0.22s',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {isView && (
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.85)' }}>
            VIEW
          </span>
        )}
      </div>
      <div ref={dotRef} style={{
        position: 'fixed', top: 0, left: 0, pointerEvents: 'none', zIndex: 999999,
        width: 6, height: 6, borderRadius: '50%',
        background: 'white', mixBlendMode: 'difference',
        opacity: 0, willChange: 'transform',
      }} />
    </>
  )
}
