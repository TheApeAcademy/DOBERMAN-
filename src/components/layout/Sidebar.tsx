import { NavLink, useLocation } from 'react-router-dom'
import {
  Eye,
  Wifi,
  Brain,
  LayoutDashboard,
  History,
  Settings,
  LogOut,
  User,
} from 'lucide-react'
import type { Profile } from '../../lib/supabase'
import { getInitials, getAvatarColor } from '../../lib/utils'

interface SidebarProps {
  profile: Profile | null
  onSignOut: () => void
  mobile?: boolean
  onClose?: () => void
}

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/eyes', icon: Eye, label: 'EYES', sub: 'Deepfake Detection' },
  { to: '/nose', icon: Wifi, label: 'NOSE', sub: 'IoT Intelligence' },
  { to: '/brain', icon: Brain, label: 'BRAIN', sub: 'AI Assistant' },
  { to: '/history', icon: History, label: 'History' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export function Sidebar({ profile, onSignOut, mobile, onClose }: SidebarProps) {
  const location = useLocation()
  const initials = getInitials(profile?.name || null, profile?.email || null)
  const avatarColor = getAvatarColor(profile?.email || profile?.name || 'U')

  return (
    <aside className={`flex flex-col h-full bg-bg-secondary border-r border-border-color ${mobile ? 'w-72' : 'w-64'}`}>
      {/* Logo */}
      <div className="px-6 py-5 border-b border-border-color">
        <NavLink to="/dashboard" onClick={onClose}>
          <span className="font-display text-2xl tracking-widest text-text-primary">
            DOBERMAN
          </span>
          <span className="block text-xs font-label text-text-muted tracking-widest mt-0.5">
            CYBER WATCHDOG
          </span>
        </NavLink>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label, sub }) => {
          const isActive = location.pathname === to
          return (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                isActive
                  ? 'bg-accent-blue/10 text-accent-blue border border-accent-blue/20'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary'
              }`}
            >
              <Icon
                size={18}
                className={isActive ? 'text-accent-blue' : 'text-text-muted group-hover:text-text-secondary'}
              />
              <div className="min-w-0">
                <p className={`text-sm font-label font-medium ${isActive ? 'text-accent-blue' : ''}`}>
                  {label}
                </p>
                {sub && (
                  <p className="text-xs font-body text-text-muted truncate">{sub}</p>
                )}
              </div>
              {isActive && (
                <div className="ml-auto w-1 h-4 bg-accent-blue rounded-full" />
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* User profile */}
      <div className="p-3 border-t border-border-color space-y-1">
        <NavLink
          to="/profile"
          onClick={onClose}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-bg-tertiary transition-colors group"
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-label font-semibold shrink-0"
            style={{ background: avatarColor }}
          >
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-text-primary text-sm font-label font-medium truncate">
              {profile?.name || profile?.email?.split('@')[0] || 'User'}
            </p>
            <p className="text-text-muted text-xs font-body capitalize">{profile?.plan || 'free'}</p>
          </div>
          <User size={14} className="text-text-muted group-hover:text-text-secondary shrink-0" />
        </NavLink>

        <button
          onClick={onSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-muted hover:text-accent-red hover:bg-red-900/10 transition-all duration-200"
        >
          <LogOut size={16} />
          <span className="text-sm font-label">Sign Out</span>
        </button>
      </div>
    </aside>
  )
}
