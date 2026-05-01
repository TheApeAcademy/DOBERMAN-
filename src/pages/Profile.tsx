import { useEffect, useState } from 'react'
import { LogOut, Eye, Wifi, Brain, Calendar, Crown } from 'lucide-react'
import { Layout } from '../components/layout/Layout'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { getInitials, getAvatarColor, formatDate } from '../lib/utils'
import { useNavigate } from 'react-router-dom'

interface Stats {
  eyesTotal: number
  noseTotal: number
  brainTotal: number
}

export default function Profile() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState<Stats>({ eyesTotal: 0, noseTotal: 0, brainTotal: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    Promise.all([
      supabase.from('eyes_scans').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('nose_scans').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('brain_conversations').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
    ]).then(([eyes, nose, brain]) => {
      setStats({
        eyesTotal: eyes.count || 0,
        noseTotal: nose.count || 0,
        brainTotal: brain.count || 0,
      })
      setLoading(false)
    })
  }, [user])

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const initials = getInitials(profile?.name || null, profile?.email || null)
  const avatarColor = getAvatarColor(profile?.email || profile?.name || 'U')
  const displayName = profile?.name || profile?.email?.split('@')[0] || 'User'

  return (
    <Layout profile={profile} onSignOut={signOut} title="Profile">
      <div className="p-6 max-w-2xl mx-auto page-fade space-y-6">
        {/* Profile card */}
        <div className="card p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-display shrink-0"
            style={{ background: avatarColor }}
          >
            {initials}
          </div>
          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2">
              <h1 className="font-heading font-bold text-2xl text-text-primary">{displayName}</h1>
              <span
                className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-label font-medium"
                style={{
                  background: profile?.plan === 'pro' ? 'rgba(255,176,32,0.15)' : 'rgba(59,130,246,0.15)',
                  color: profile?.plan === 'pro' ? '#FFB020' : '#3B82F6',
                  border: `1px solid ${profile?.plan === 'pro' ? 'rgba(255,176,32,0.3)' : 'rgba(59,130,246,0.3)'}`,
                }}
              >
                {profile?.plan === 'pro' && <Crown size={10} />}
                {(profile?.plan || 'FREE').toUpperCase()}
              </span>
            </div>
            <p className="text-text-muted font-body text-sm">{profile?.email || user?.email}</p>
            <div className="flex items-center gap-1.5 justify-center sm:justify-start">
              <Calendar size={12} className="text-text-muted" />
              <span className="text-text-muted font-label text-xs">
                Member since {profile?.created_at ? formatDate(profile.created_at) : 'recently'}
              </span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div>
          <h2 className="font-heading font-bold text-text-primary mb-4">Activity Stats</h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: Eye, label: 'EYES Scans', value: stats.eyesTotal, color: '#3B82F6' },
              { icon: Wifi, label: 'NOSE Scans', value: stats.noseTotal, color: '#8B5CF6' },
              { icon: Brain, label: 'BRAIN Chats', value: stats.brainTotal, color: '#00D46A' },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="card p-4 text-center">
                <Icon size={20} className="mx-auto mb-2" style={{ color }} />
                <p className="font-display text-3xl text-text-primary">{loading ? '-' : value}</p>
                <p className="text-text-muted font-label text-xs mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Plan */}
        <div className="card p-5">
          <h2 className="font-heading font-bold text-text-primary mb-4">Current Plan</h2>
          <div className="flex items-center justify-between p-4 bg-bg-tertiary rounded-lg border border-border-color">
            <div>
              <p className="text-text-primary font-body font-medium">Free Plan</p>
              <p className="text-text-muted font-label text-xs mt-0.5">3 EYES scans/day - 3 NOSE scans/day - 10 BRAIN messages/day</p>
            </div>
            <button
              className="btn-primary text-sm px-4 py-2"
              onClick={() => {}}
            >
              Upgrade to Pro
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="card p-5 space-y-3">
          <h2 className="font-heading font-bold text-text-primary mb-2">Account Actions</h2>
          <button
            onClick={() => navigate('/settings')}
            className="w-full btn-secondary justify-start"
          >
            Edit Profile Settings
          </button>
          <button
            onClick={handleSignOut}
            className="w-full btn-danger justify-start"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </div>
    </Layout>
  )
}
