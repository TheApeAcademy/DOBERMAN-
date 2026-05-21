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

// Apple SF Pro system font stack — renders as SF Pro on Apple, system-ui elsewhere
const SF = '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", system-ui, sans-serif'
const IOS_BLUE = '#0A84FF'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', sub: '' },
  { to: '/eyes', icon: Eye, label: 'Deepfake Intelligence', sub: 'D.F.I.' },
  { to: '/brain', icon: Brain, label: 'DAYE', sub: 'AI Analyst' },
  { to: '/news', icon: Newspaper, label: 'NEWS', sub: 'Verify Content' },
  { to: '/globe', icon: Globe2, label: 'Cyber Globe', sub: 'Threat Intelligence' },
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
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: mobile ? 288 : 256,
        background: 'rgba(18,18,22,0.92)',
        backdropFilter: 'blur(40px)',
        WebkitBackdropFilter: 'blur(40px)',
        borderRight: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 0,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Logo */}
      <div style={{ padding: '28px 20px 18px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <NavLink to="/dashboard" onClick={onClose} style={{ textDecoration: 'none' }}>
          <span style={{ fontFamily: 'Bebas Neue', fontSize: 22, letterSpacing: '0.18em', color: '#fff', display: 'block' }}>
            D0B3RMAN
          </span>
          <span style={{ fontFamily: SF, fontSize: 11, letterSpacing: '0.01em', color: 'rgba(255,255,255,0.35)', display: 'block', marginTop: 3, fontWeight: 400 }}>
            Cyber Watchdog
          </span>
        </NavLink>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '10px 8px', overflowY: 'auto' }}>
        {navItems.map(({ to, icon: Icon, label, sub }, i) => {
          const isActive = location.pathname === to
          const isBreach = to === '/breach'

          const activeColor = isBreach ? '#CD853F' : IOS_BLUE
          const activeBg = isBreach ? 'rgba(139,69,19,0.18)' : 'rgba(10,132,255,0.14)'

          return (
            <motion.div
              key={to}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.035 }}
            >
              <NavLink
                to={to}
                onClick={onClose}
                style={{ textDecoration: 'none', display: 'block', marginBottom: 1 }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 11,
                    padding: '9px 12px',
                    borderRadius: 10,
                    background: isActive ? activeBg : 'transparent',
                    transition: 'background 0.15s ease',
                  }}
                >
                  <Icon
                    size={17}
                    style={{
                      color: isActive ? activeColor : 'rgba(255,255,255,0.4)',
                      flexShrink: 0,
                      strokeWidth: isActive ? 2 : 1.75,
                    }}
                  />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p style={{
                      fontFamily: SF,
                      fontSize: 14,
                      letterSpacing: '-0.01em',
                      lineHeight: 1.2,
                      color: isActive ? activeColor : 'rgba(255,255,255,0.82)',
                      fontWeight: isActive ? 600 : 400,
                    }}>
                      {label}
                    </p>
                    {sub && (
                      <p style={{
                        fontFamily: SF,
                        fontSize: 11,
                        letterSpacing: '0em',
                        color: isActive ? `${activeColor}99` : 'rgba(255,255,255,0.28)',
                        marginTop: 1,
                        fontWeight: 400,
                        lineHeight: 1.2,
                      }}>
                        {sub}
                      </p>
                    )}
                  </div>
                  {isActive && (
                    <div style={{ width: 3, height: 18, background: activeColor, borderRadius: 2, flexShrink: 0 }} />
                  )}
                </div>
              </NavLink>
            </motion.div>
          )
        })}
      </nav>

      {/* Divider */}
      <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', margin: '0 8px' }} />

      {/* User profile */}
      <div style={{ padding: '10px 8px 16px' }}>
        <NavLink
          to="/profile"
          onClick={onClose}
          style={{ textDecoration: 'none', display: 'block', marginBottom: 2 }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '9px 12px',
            borderRadius: 10,
            transition: 'background 0.15s ease',
          }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: 13,
                fontFamily: SF,
                fontWeight: 600,
                flexShrink: 0,
                background: avatarColor,
              }}
            >
              {initials}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <p style={{
                fontFamily: SF,
                fontSize: 14,
                fontWeight: 500,
                letterSpacing: '-0.01em',
                color: 'rgba(255,255,255,0.88)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                lineHeight: 1.2,
              }}>
                {profile?.name || profile?.email?.split('@')[0] || 'User'}
              </p>
              <p style={{
                fontFamily: SF,
                fontSize: 11,
                color: 'rgba(255,255,255,0.3)',
                textTransform: 'capitalize',
                fontWeight: 400,
                marginTop: 2,
                lineHeight: 1.2,
              }}>
                {profile?.plan || 'free'}
              </p>
            </div>
            <User size={13} style={{ color: 'rgba(255,255,255,0.25)', flexShrink: 0 }} />
          </div>
        </NavLink>

        <button
          onClick={onSignOut}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 11,
            padding: '9px 12px',
            borderRadius: 10,
            background: 'none',
            border: 'none',
            color: 'rgba(255,255,255,0.38)',
            fontFamily: SF,
            fontSize: 14,
            fontWeight: 400,
            letterSpacing: '-0.01em',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLButtonElement
            el.style.color = '#FF453A'
            el.style.background = 'rgba(255,69,58,0.1)'
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLButtonElement
            el.style.color = 'rgba(255,255,255,0.38)'
            el.style.background = 'none'
          }}
        >
          <LogOut size={16} style={{ strokeWidth: 1.75 }} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  )
}
