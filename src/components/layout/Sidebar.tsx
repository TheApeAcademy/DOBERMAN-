import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, Brain, LayoutDashboard, History, Settings, LogOut, User, Newspaper, Globe2, Lock } from 'lucide-react'
import type { Profile } from '../../lib/supabase'
import { getInitials, getAvatarColor } from '../../lib/utils'

interface SidebarProps {
  profile: Profile | null
  onSignOut: () => void
  mobile?: boolean
  onClose?: () => void
}

const SF = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Arial, sans-serif'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', sub: '' },
  { to: '/eyes', icon: Eye, label: 'Deepfake Intelligence', sub: 'D.F.I.' },
  { to: '/brain', icon: Brain, label: 'DAYE', sub: 'AI Analyst' },
  { to: '/news', icon: Newspaper, label: 'NEWS', sub: 'Verify Content' },
  { to: '/globe', icon: Globe2, label: 'CYBER GLOBE', sub: 'Threat Intelligence' },
  { to: '/breach', icon: Lock, label: 'BREACH', sub: 'Breach Detection' },
  { to: '/history', icon: History, label: 'History', sub: '' },
  { to: '/settings', icon: Settings, label: 'Settings', sub: '' },
]

export function Sidebar({ profile, onSignOut, mobile, onClose }: SidebarProps) {
  const location = useLocation()
  const initials = getInitials(profile?.name || null, profile?.email || null)
  const avatarColor = getAvatarColor(profile?.email || profile?.name || 'U')

  return (
    <aside
      className="glass"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: mobile ? 288 : 256,
        borderRight: '1px solid var(--glass-border)',
        borderRadius: 0,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Logo */}
      <div style={{ padding: '24px 24px 20px', borderBottom: '1px solid var(--glass-border)' }}>
        <NavLink to="/dashboard" onClick={onClose} style={{ textDecoration: 'none' }}>
          <span style={{ fontFamily: 'Bebas Neue', fontSize: 22, letterSpacing: '0.2em', color: 'var(--text-1)', display: 'block' }}>
            D0B3RMAN
          </span>
          <span style={{ fontFamily: SF, fontSize: 10, letterSpacing: '0.12em', color: 'var(--text-3)', display: 'block', marginTop: 3, fontWeight: 500 }}>
            CYBER WATCHDOG
          </span>
        </NavLink>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '12px', overflowY: 'auto' }}>
        {navItems.map(({ to, icon: Icon, label, sub }, i) => {
          const isActive = location.pathname === to
          const isBreach = to === '/breach'
          const isGlobe = to === '/globe'
          return (
            <motion.div
              key={to}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <NavLink
                to={to}
                onClick={onClose}
                style={{ textDecoration: 'none', display: 'block', marginBottom: 2 }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 12px',
                    borderRadius: 10,
                    background: isActive
                      ? (isBreach ? 'rgba(139,69,19,0.14)' : isGlobe ? 'rgba(0,100,200,0.12)' : 'rgba(255,255,255,0.06)')
                      : 'transparent',
                    border: isActive
                      ? (isBreach ? '1px solid rgba(139,69,19,0.35)' : isGlobe ? '1px solid rgba(0,100,200,0.3)' : '1px solid var(--glass-border)')
                      : '1px solid transparent',
                    transition: 'all 0.2s',
                  }}
                >
                  <Icon
                    size={16}
                    style={{
                      color: isActive
                        ? (isBreach ? '#CD853F' : isGlobe ? '#0A84FF' : 'var(--text-1)')
                        : (isBreach ? 'rgba(205,133,63,0.55)' : isGlobe ? 'rgba(0,150,255,0.5)' : 'var(--text-3)'),
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ minWidth: 0 }}>
                    <p style={{
                      fontFamily: SF,
                      fontSize: 13,
                      letterSpacing: '-0.01em',
                      color: isActive
                        ? (isBreach ? '#CD853F' : isGlobe ? '#0A84FF' : 'var(--text-1)')
                        : (isBreach ? 'rgba(205,133,63,0.65)' : isGlobe ? 'rgba(0,150,255,0.65)' : 'var(--text-2)'),
                      fontWeight: isActive ? 600 : 400,
                    }}>
                      {label}
                    </p>
                    {sub && (
                      <p style={{
                        fontFamily: SF,
                        fontSize: 11,
                        color: isBreach ? 'rgba(139,69,19,0.5)' : isGlobe ? 'rgba(0,100,200,0.5)' : 'var(--text-3)',
                        marginTop: 1,
                        fontWeight: 400,
                      }}>
                        {sub}
                      </p>
                    )}
                  </div>
                  {isActive && (
                    <div style={{ marginLeft: 'auto', width: 3, height: 16, background: isBreach ? '#CD853F' : isGlobe ? '#0A84FF' : 'var(--text-1)', borderRadius: 2 }} />
                  )}
                </div>
              </NavLink>
            </motion.div>
          )
        })}
      </nav>

      {/* User profile */}
      <div style={{ padding: '12px', borderTop: '1px solid var(--glass-border)' }}>
        <NavLink
          to="/profile"
          onClick={onClose}
          style={{ textDecoration: 'none', display: 'block', marginBottom: 4 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, border: '1px solid transparent', transition: 'all 0.2s' }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: 12,
                fontFamily: SF,
                fontWeight: 600,
                flexShrink: 0,
                background: avatarColor,
              }}
            >
              {initials}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <p style={{ fontFamily: SF, fontSize: 13, fontWeight: 600, letterSpacing: '-0.01em', color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {profile?.name || profile?.email?.split('@')[0] || 'User'}
              </p>
              <p style={{ fontFamily: SF, fontSize: 11, color: 'var(--text-3)', textTransform: 'capitalize', fontWeight: 400 }}>
                {profile?.plan || 'free'}
              </p>
            </div>
            <User size={13} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
          </div>
        </NavLink>

        <button
          onClick={onSignOut}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 12px',
            borderRadius: 10,
            background: 'none',
            border: 'none',
            color: 'var(--text-3)',
            fontFamily: SF,
            fontSize: 13,
            fontWeight: 400,
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--danger)'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,45,45,0.06)' }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-3)'; (e.currentTarget as HTMLButtonElement).style.background = 'none' }}
        >
          <LogOut size={14} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  )
}
