import { Menu } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import type { Profile } from '../../lib/supabase'
import { getInitials, getAvatarColor } from '../../lib/utils'

interface HeaderProps {
  profile: Profile | null
  onMenuClick: () => void
  title?: string
}

export function Header({ profile, onMenuClick, title }: HeaderProps) {
  const initials = getInitials(profile?.name || null, profile?.email || null)
  const avatarColor = getAvatarColor(profile?.email || profile?.name || 'U')
  const now = new Date()
  const dateStr = now.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })

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
      {/* Menu icon — visible on all screen sizes to toggle sidebar */}
      <button
        onClick={onMenuClick}
        style={{ background: 'none', border: 'none', color: 'var(--text-3)', padding: 4 }}
      >
        <Menu size={20} />
      </button>

      <div style={{ flex: 1 }}>
        {title && (
          <h1 style={{ fontFamily: 'JetBrains Mono', fontSize: 12, letterSpacing: '0.15em', color: 'var(--text-3)', textTransform: 'uppercase' }}>
            {title}
          </h1>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <span style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--text-3)' }}>{dateStr}</span>

        <NavLink to="/profile" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 11, fontFamily: 'JetBrains Mono', fontWeight: 600, background: avatarColor }}>
            {initials}
          </div>
          <span style={{ fontFamily: 'Syne', fontSize: 13, fontWeight: 600, color: 'var(--text-2)' }}>
            {profile?.name?.split(' ')[0] || profile?.email?.split('@')[0] || 'User'}
          </span>
        </NavLink>
      </div>
    </header>
  )
}
