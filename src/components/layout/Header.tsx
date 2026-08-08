import { Menu, ArrowLeft } from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import type { Profile } from '../../lib/supabase'
import { getInitials, getAvatarColor } from '../../lib/utils'

interface HeaderProps {
  profile: Profile | null
  onMenuClick: () => void
  title?: string
}

const SF = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", system-ui, sans-serif'

export function Header({ profile, onMenuClick }: HeaderProps) {
  const navigate = useNavigate()
  const initials = getInitials(profile?.name || null, profile?.email || null)
  const avatarColor = getAvatarColor(profile?.email || profile?.name || 'U')
  const now = new Date()
  const day = now.toLocaleDateString('en-GB', { weekday: 'short' })
  const date = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

  const handleBack = () => {
    // history.state.idx is set by react-router's browser history — only go
    // back if there's actually somewhere in-app to go back to, otherwise
    // fall back to the dashboard instead of leaving the app.
    const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0
    if (idx > 0) navigate(-1)
    else navigate('/dashboard')
  }

  return (
    <header
      className="glass"
      style={{
        height: 56,
        borderBottom: '1px solid var(--glass-border)',
        borderRadius: 0,
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        gap: 16,
        flexShrink: 0,
      }}
    >
      <button
        onClick={handleBack}
        title="Go back"
        style={{ background: 'none', border: 'none', color: 'var(--text-3)', padding: 4, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
      >
        <ArrowLeft size={20} />
      </button>

      <button
        onClick={onMenuClick}
        title="Toggle sidebar"
        style={{ background: 'none', border: 'none', color: 'var(--text-3)', padding: 4, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
      >
        <Menu size={20} />
      </button>

      <div style={{ flex: 1 }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
          <span style={{ fontFamily: SF, fontSize: 13, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--text-2)' }}>
            {day}
          </span>
          <span style={{ fontFamily: SF, fontSize: 13, fontWeight: 400, letterSpacing: '-0.01em', color: 'var(--text-3)' }}>
            {date}
          </span>
        </div>

        <NavLink to="/profile" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 11, fontFamily: SF, fontWeight: 600, background: avatarColor }}>
            {initials}
          </div>
          <span style={{ fontFamily: SF, fontSize: 13, fontWeight: 600, letterSpacing: '-0.01em', color: 'var(--text-2)' }}>
            {profile?.name?.split(' ')[0] || profile?.email?.split('@')[0] || 'User'}
          </span>
        </NavLink>
      </div>
    </header>
  )
}
