import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, Wifi, Brain, LayoutDashboard, History, Settings, LogOut, User, Newspaper } from 'lucide-react'
import type { Profile } from '../../lib/supabase'
import { getInitials, getAvatarColor } from '../../lib/utils'

interface SidebarProps {
  profile: Profile | null
  onSignOut: () => void
  mobile?: boolean
  onClose?: () => void
}

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', sub: '' },
  { to: '/eyes', icon: Eye, label: 'EYES', sub: 'Deepfake Detection' },
  { to: '/nose', icon: Wifi, label: 'NOSE', sub: 'IoT Intelligence' },
  { to: '/brain', icon: Brain, label: 'BRAIN', sub: 'AI Assistant' },
  { to: '/news', icon: Newspaper, label: 'NEWS', sub: 'Verify Content' },
  { to: '/history', icon: History, label: 'History', sub: '' },
  { to: '/settings', icon: Settings, label: 'Settings', sub: '' },
]

export function Sidebar({ profile, onSignOut, mobile, onClose }: SidebarProps) {
  const location = useLocation()
  const [expanded, setExpanded] = useState(false)
  const initials = getInitials(profile?.name || null, profile?.email || null)
  const avatarColor = getAvatarColor(profile?.email || profile?.name || 'U')

  const w = mobile ? 288 : (expanded ? 256 : 64)

  return (
    <aside
      className="glass"
      onMouseEnter={() => !mobile && setExpanded(true)}
      onMouseLeave={() => !mobile && setExpanded(false)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: w,
        minWidth: w,
        borderRight: '1px solid var(--glass-border)',
        borderRadius: 0,
        position: 'relative',
        overflow: 'hidden',
        transition: 'width 0.25s ease, min-width 0.25s ease',
        willChange: 'width',
      }}
    >
      {/* Logo */}
      <div style={{ padding: mobile || expanded ? '24px 24px 20px' : '24px 0 20px', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: mobile || expanded ? 'flex-start' : 'center', transition: 'padding 0.25s ease' }}>
        <NavLink to="/dashboard" onClick={onClose} style={{ textDecoration: 'none' }}>
          {mobile || expanded ? (
            <>
              <span style={{ fontFamily: 'Bebas Neue', fontSize: 22, letterSpacing: '0.2em', color: 'var(--text-1)', display: 'block' }}>
                D0B3RMAN
              </span>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.2em', color: 'var(--text-3)', display: 'block', marginTop: 2 }}>
                CYBER WATCHDOG
              </span>
            </>
          ) : (
            <span style={{ fontFamily: 'Bebas Neue', fontSize: 18, letterSpacing: '0.1em', color: 'var(--text-1)' }}>D</span>
          )}
        </NavLink>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '12px', overflowY: 'hidden' }}>
        {navItems.map(({ to, icon: Icon, label, sub }, i) => {
          const isActive = location.pathname === to
          return (
            <motion.div
              key={to}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
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
                    gap: mobile || expanded ? 12 : 0,
                    justifyContent: mobile || expanded ? 'flex-start' : 'center',
                    padding: mobile || expanded ? '10px 12px' : '10px 0',
                    borderRadius: 10,
                    background: isActive ? 'rgba(255,255,255,0.06)' : 'transparent',
                    border: isActive ? '1px solid var(--glass-border)' : '1px solid transparent',
                    transition: 'all 0.2s',
                    overflow: 'hidden',
                  }}
                >
                  <Icon
                    size={16}
                    style={{ color: isActive ? 'var(--text-1)' : 'var(--text-3)', flexShrink: 0 }}
                  />
                  {(mobile || expanded) && (
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <p style={{ fontFamily: 'JetBrains Mono', fontSize: 12, letterSpacing: '0.05em', color: isActive ? 'var(--text-1)' : 'var(--text-2)', fontWeight: isActive ? 600 : 400, whiteSpace: 'nowrap' }}>
                        {label}
                      </p>
                      {sub && (
                        <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-3)', marginTop: 1, whiteSpace: 'nowrap' }}>{sub}</p>
                      )}
                    </div>
                  )}
                  {(mobile || expanded) && isActive && (
                    <div style={{ marginLeft: 'auto', width: 3, height: 16, background: 'var(--text-1)', borderRadius: 2, flexShrink: 0 }} />
                  )}
                </div>
              </NavLink>
            </motion.div>
          )
        })}
      </nav>

      {/* User profile */}
      <div style={{ padding: '12px', borderTop: '1px solid var(--glass-border)' }}>
        {(mobile || expanded) ? (
          <>
            <NavLink
              to="/profile"
              onClick={onClose}
              style={{ textDecoration: 'none', display: 'block', marginBottom: 4 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, border: '1px solid transparent', transition: 'all 0.2s' }}>
                <div
                  style={{
                    width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontSize: 12, fontFamily: 'JetBrains Mono', fontWeight: 600, flexShrink: 0, background: avatarColor,
                  }}
                >
                  {initials}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p style={{ fontFamily: 'Syne', fontSize: 13, fontWeight: 600, color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {profile?.name || profile?.email?.split('@')[0] || 'User'}
                  </p>
                  <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-3)', textTransform: 'capitalize' }}>
                    {profile?.plan || 'free'}
                  </p>
                </div>
                <User size={13} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
              </div>
            </NavLink>
            <button
              onClick={onSignOut}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, background: 'none', border: 'none', color: 'var(--text-3)', fontFamily: 'JetBrains Mono', fontSize: 12, transition: 'all 0.2s' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--danger)'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,45,45,0.06)' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-3)'; (e.currentTarget as HTMLButtonElement).style.background = 'none' }}
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          </>
        ) : (
          <NavLink to="/profile" onClick={onClose} style={{ textDecoration: 'none', display: 'flex', justifyContent: 'center', padding: '6px 0' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 12, fontFamily: 'JetBrains Mono', fontWeight: 600, background: avatarColor }}>
              {initials}
            </div>
          </NavLink>
        )}
      </div>
    </aside>
  )
}
