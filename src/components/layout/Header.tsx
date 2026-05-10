import { Menu, Shield } from 'lucide-react'
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
    <header style={{
      height: 56,
      background: '#FFFFFF',
      borderBottom: '1px solid rgba(0,0,0,0.07)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 20px',
      gap: 16,
      flexShrink: 0,
      boxShadow: '0 1px 0 rgba(0,0,0,0.04)',
    }}>
      <button
        onClick={onMenuClick}
        style={{ background: 'none', border: 'none', color: '#8E8E93', padding: 4 }}
        className="lg-hide"
      >
        <style>{`@media (min-width: 1024px) { .lg-hide { display: none !important; } }`}</style>
        <Menu size={20} />
      </button>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
        {title && (
          <>
            <Shield size={12} style={{ color: '#8E8E93' }} />
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 11, letterSpacing: '0.12em', color: '#8E8E93', textTransform: 'uppercase' }}>
              {title}
            </span>
          </>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <span style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: '#C0C0C5' }}>{dateStr}</span>

        <NavLink to="/profile" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 11, fontFamily: 'JetBrains Mono', fontWeight: 600, background: avatarColor, boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }}>
            {initials}
          </div>
          <span style={{ fontFamily: 'Syne', fontSize: 13, fontWeight: 600, color: '#44454B' }}>
            {profile?.name?.split(' ')[0] || profile?.email?.split('@')[0] || 'User'}
          </span>
        </NavLink>
      </div>
    </header>
  )
}
