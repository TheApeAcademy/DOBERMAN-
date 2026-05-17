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

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--void)', overflow: 'hidden', position: 'relative' }}>

      {/* Desktop sidebar */}
      <div style={{ flexShrink: 0, zIndex: 10, display: 'none' }} className="lg-sidebar">
        <style>{`@media (min-width: 1024px) { .lg-sidebar { display: flex !important; } }`}</style>
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

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden', zIndex: 1 }}>
        <Header profile={profile} onMenuClick={() => setMobileOpen(true)} title={title} />
        <main style={{ flex: 1, overflowY: 'auto' }}>
          {children}
        </main>
      </div>

      {/* DAYE Persistent Assistant - always visible on all authenticated pages */}
      <DayeAssistant userId={profile?.id} />
    </div>
  )
}
