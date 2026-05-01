import { Menu, Bell, ChevronDown } from 'lucide-react'
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
  const dateStr = now.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

  return (
    <header className="h-14 bg-bg-secondary border-b border-border-color flex items-center px-4 gap-4 shrink-0">
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        className="lg:hidden text-text-muted hover:text-text-primary transition-colors p-1 rounded"
      >
        <Menu size={20} />
      </button>

      {/* Page title / breadcrumb */}
      <div className="flex-1">
        {title && (
          <h1 className="text-text-primary font-heading font-bold text-sm">{title}</h1>
        )}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        <span className="hidden sm:block text-text-muted text-xs font-body">{dateStr}</span>

        <button className="text-text-muted hover:text-text-primary transition-colors p-1 rounded relative">
          <Bell size={18} />
        </button>

        <NavLink
          to="/profile"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-label font-semibold"
            style={{ background: avatarColor }}
          >
            {initials}
          </div>
          <span className="hidden sm:block text-text-primary text-sm font-label font-medium">
            {profile?.name?.split(' ')[0] || profile?.email?.split('@')[0] || 'User'}
          </span>
          <ChevronDown size={14} className="text-text-muted hidden sm:block" />
        </NavLink>
      </div>
    </header>
  )
}
