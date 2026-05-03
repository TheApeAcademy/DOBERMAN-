import { useCallback } from 'react'
import type { MouseEvent } from 'react'

export function useShockwave() {
  return useCallback((e: MouseEvent) => {
    const wave = document.createElement('div')
    wave.style.cssText = `
      position: fixed;
      left: ${e.clientX - 40}px;
      top:  ${e.clientY - 40}px;
      width: 80px;
      height: 80px;
      border-radius: 50%;
      border: 1px solid rgba(255, 255, 255, 0.5);
      pointer-events: none;
      z-index: 999998;
      animation: shockwave 0.65s ease-out forwards;
    `
    document.body.appendChild(wave)
    setTimeout(() => wave.remove(), 650)
  }, [])
}
