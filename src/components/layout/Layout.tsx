import { useState } from 'react'
import type { ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { DayeAssistant } from '../daye/DayeAssistant'
import type { Profile } from '../../lib/supabase'

interface LayoutProps {
  profile: Profile | null
  onSignOut: () => void
  children: ReactNode
  title?: string
}

export function Layout({ profile, onSignOut, children, title }: LayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [desktopOpen, setDesktopOpen] = useState(true)

  const handleMenuClick = () => {
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
      setDesktopOpen((prev) => !prev)
    } else {
      setMobileOpen((prev) => !prev)
    }
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--void)', overflow: 'hidden', position: 'relative' }}>

      {/* Desktop sidebar — toggled via hamburger icon */}
      <div
        className={`lg-sidebar${desktopOpen ? '' : ' lg-sidebar-hidden'}`}
        style={{ flexShrink: 0, zIndex: 10, display: 'none' }}
      >
        <style>{`
          @media (min-width: 1024px) { .lg-sidebar { display: flex !important; } }
          @media (min-width: 1024px) { .lg-sidebar-hidden { display: none !important; } }
        `}</style>
        <Sidebar profile={profile} onSignOut={onSignOut} />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 40, display: 'flex' }}>
          <div
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
            onClick={() => setMobileOpen(false)}
          />
          <div style={{ position: 'relative', zIndex: 50 }}>
            <Sidebar profile={profile} onSignOut={onSignOut} mobile onClose={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Main content — always beside sidebar, never under it */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowX: 'hidden', zIndex: 1, minHeight: 0 }}>
        <Header profile={profile} onMenuClick={handleMenuClick} title={title} />
        <main style={{ flex: 1, overflowY: 'scroll', minHeight: 0, WebkitOverflowScrolling: 'touch' } as React.CSSProperties}>
          {children}
        </main>
      </div>

      <DayeAssistant userId={profile?.id} />
    </div>
  )
}
