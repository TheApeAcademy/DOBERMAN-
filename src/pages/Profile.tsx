import { useEffect, useState } from 'react'
import { LogOut, Eye, Wifi, Brain, Calendar, Crown, Settings } from 'lucide-react'
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

const card: React.CSSProperties = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 20,
  padding: 24,
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.07)',
  backdropFilter: 'blur(28px)',
  WebkitBackdropFilter: 'blur(28px)',
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
      setStats({ eyesTotal: eyes.count || 0, noseTotal: nose.count || 0, brainTotal: brain.count || 0 })
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
  const isPro = profile?.plan === 'pro'

  const statItems = [
    { icon: Eye, label: 'EYES Scans', value: stats.eyesTotal, color: 'var(--text-2)' },
    { icon: Wifi, label: 'NOSE Scans', value: stats.noseTotal, color: 'var(--text-2)' },
    { icon: Brain, label: 'BRAIN Chats', value: stats.brainTotal, color: 'var(--text-2)' },
  ]

  return (
    <Layout profile={profile} onSignOut={signOut} title="PROFILE">
      <div style={{ padding: '28px 28px 48px', maxWidth: 680, margin: '0 auto' }}>

        {/* Page header */}
        <div style={{ marginBottom: 28, paddingBottom: 24, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <h1 style={{ fontFamily: 'Bebas Neue', fontSize: 34, letterSpacing: '0.1em', color: 'var(--text-1)', lineHeight: 1 }}>PROFILE</h1>
          <p style={{ fontFamily: 'Inter', fontSize: 10, letterSpacing: '0.04em', color: 'var(--text-3)', marginTop: 3 }}>ACCOUNT OVERVIEW</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Identity card */}
          <div style={card}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{
                width: 72, height: 72, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontSize: 22, fontFamily: 'Bebas Neue',
                letterSpacing: '0.05em', flexShrink: 0, background: avatarColor,
                boxShadow: '0 0 0 3px rgba(255,255,255,0.08)',
              }}>
                {initials}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <h2 style={{ fontFamily: 'Inter', fontSize: 20, fontWeight: 700, color: 'var(--text-1)' }}>{displayName}</h2>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    padding: '3px 10px', borderRadius: 6,
                    fontFamily: 'Inter', fontSize: 9, letterSpacing: '0.03em',
                    background: isPro ? 'rgba(255,176,32,0.1)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${isPro ? 'rgba(255,176,32,0.3)' : 'rgba(255,255,255,0.1)'}`,
                    color: isPro ? '#FFB020' : 'var(--text-3)',
                  }}>
                    {isPro && <Crown size={9} />}
                    {(profile?.plan || 'FREE').toUpperCase()}
                  </span>
                </div>
                <p style={{ fontFamily: 'Inter', fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>{profile?.email || user?.email}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                  <Calendar size={11} style={{ color: 'var(--text-3)' }} />
                  <span style={{ fontFamily: 'Inter', fontSize: 10, color: 'var(--text-3)' }}>
                    Member since {profile?.created_at ? formatDate(profile.created_at) : 'recently'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Activity stats */}
          <div>
            <p style={{ fontFamily: 'Inter', fontSize: 9, letterSpacing: '0.05em', color: 'var(--text-3)', marginBottom: 10, textTransform: 'uppercase' }}>Activity Stats</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
              {statItems.map(({ icon: Icon, label, value, color }) => (
                <div key={label} style={{ ...card, padding: '20px 16px', textAlign: 'center' }}>
                  <Icon size={18} style={{ color, margin: '0 auto 10px' }} />
                  <p style={{ fontFamily: 'Bebas Neue', fontSize: 36, letterSpacing: '0.05em', color: 'var(--text-1)', lineHeight: 1 }}>
                    {loading ? '—' : value}
                  </p>
                  <p style={{ fontFamily: 'Inter', fontSize: 9, letterSpacing: '0.04em', color: 'var(--text-3)', marginTop: 6, textTransform: 'uppercase' }}>{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Plan */}
          <div style={card}>
            <p style={{ fontFamily: 'Inter', fontSize: 9, letterSpacing: '0.05em', color: 'var(--text-3)', marginBottom: 16, textTransform: 'uppercase' }}>Current Plan</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px', borderRadius: 14, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', gap: 16 }}>
              <div>
                <p style={{ fontFamily: 'Inter', fontSize: 14, fontWeight: 600, color: 'var(--text-1)', marginBottom: 4 }}>Free Plan</p>
                <p style={{ fontFamily: 'Inter', fontSize: 10, color: 'var(--text-3)' }}>3 EYES · 3 NOSE · 10 BRAIN / day</p>
              </div>
              <button className="btn-primary" style={{ padding: '9px 18px', fontSize: 11, flexShrink: 0 }}>
                Upgrade to Pro
              </button>
            </div>
          </div>

          {/* Actions */}
          <div style={card}>
            <p style={{ fontFamily: 'Inter', fontSize: 9, letterSpacing: '0.05em', color: 'var(--text-3)', marginBottom: 16, textTransform: 'uppercase' }}>Account Actions</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button
                onClick={() => navigate('/settings')}
                className="btn-secondary"
                style={{ justifyContent: 'flex-start', gap: 10, padding: '12px 16px' }}
              >
                <Settings size={14} />
                Edit Profile Settings
              </button>
              <button
                onClick={handleSignOut}
                className="btn-danger"
                style={{ justifyContent: 'flex-start', gap: 10, padding: '12px 16px' }}
              >
                <LogOut size={14} />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
