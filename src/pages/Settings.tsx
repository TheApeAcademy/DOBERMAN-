import { useState } from 'react'
import { User, Bell, Trash2, Info, AlertTriangle, CheckCircle, Lock } from 'lucide-react'
import { Layout } from '../components/layout/Layout'
import { Modal } from '../components/ui/Modal'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'

const card: React.CSSProperties = {
  background: 'var(--ovw-0p03)',
  border: '1px solid var(--ovw-0p08)',
  borderRadius: 20,
  padding: 24,
  boxShadow: 'inset 0 1px 0 var(--ovw-0p07)',
  backdropFilter: 'blur(28px)',
  WebkitBackdropFilter: 'blur(28px)',
}

const label: React.CSSProperties = {
  display: 'block',
  fontFamily: 'Inter',
  fontSize: 9,
  letterSpacing: '0.2em',
  color: 'var(--text-3)',
  marginBottom: 8,
  textTransform: 'uppercase',
}

export default function Settings() {
  const { user, profile, signOut, updateProfile } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState(profile?.name || '')
  const [email, setEmail] = useState(profile?.email || user?.email || '')
  const [newPassword, setNewPassword] = useState('')
  const [notifications, setNotifications] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteHistoryOpen, setDeleteHistoryOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    const { error: updateError } = await updateProfile({ name, email })
    if (updateError) {
      setError(updateError.message)
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
    setSaving(false)
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) {
      setError(error.message)
    } else {
      setSaved(true)
      setNewPassword('')
      setTimeout(() => setSaved(false), 3000)
    }
    setSaving(false)
  }

  const handleDeleteHistory = async () => {
    if (!user) return
    setDeleting(true)
    await Promise.all([
      supabase.from('eyes_scans').delete().eq('user_id', user.id),
      supabase.from('nose_scans').delete().eq('user_id', user.id),
      supabase.from('brain_conversations').delete().eq('user_id', user.id),
      supabase.from('usage_logs').delete().eq('user_id', user.id),
    ])
    setDeleting(false)
    setDeleteHistoryOpen(false)
  }

  const handleDeleteAccount = async () => {
    if (!user) return
    setDeleting(true)
    await signOut()
    navigate('/')
  }

  const sectionHeader = (icon: React.ReactNode, title: string) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, paddingBottom: 14, borderBottom: '1px solid var(--ovw-0p06)' }}>
      <div style={{ color: 'var(--text-3)' }}>{icon}</div>
      <p style={{ fontFamily: 'Inter', fontSize: 11, letterSpacing: '0.04em', color: 'var(--text-2)', textTransform: 'uppercase' }}>{title}</p>
    </div>
  )

  return (
    <Layout profile={profile} onSignOut={signOut} title="SETTINGS">
      <div style={{ padding: '28px 28px 48px', maxWidth: 680, margin: '0 auto' }}>

        {/* Page header */}
        <div style={{ marginBottom: 28, paddingBottom: 24, borderBottom: '1px solid var(--ovw-0p06)' }}>
          <h1 style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, sans-serif', fontSize: 34, letterSpacing: '0.1em', color: 'var(--text-1)', lineHeight: 1 }}>SETTINGS</h1>
          <p style={{ fontFamily: 'Inter', fontSize: 10, letterSpacing: '0.04em', color: 'var(--text-3)', marginTop: 3 }}>MANAGE YOUR D0B3RMAN ACCOUNT</p>
        </div>

        {/* Feedback banners */}
        {saved && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 12, background: 'rgba(48,209,88,0.07)', border: '1px solid rgba(48,209,88,0.2)', marginBottom: 16 }}>
            <CheckCircle size={14} style={{ color: 'var(--safe)', flexShrink: 0 }} />
            <p style={{ fontFamily: 'Inter', fontSize: 12, color: 'var(--safe)' }}>Changes saved successfully.</p>
          </div>
        )}
        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 12, background: 'rgba(255,45,45,0.06)', border: '1px solid rgba(255,45,45,0.2)', marginBottom: 16 }}>
            <AlertTriangle size={14} style={{ color: 'var(--danger)', flexShrink: 0 }} />
            <p style={{ fontFamily: 'Inter', fontSize: 12, color: 'var(--danger)' }}>{error}</p>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Account */}
          <div style={card}>
            {sectionHeader(<User size={14} />, 'Account')}
            <form onSubmit={handleSaveAccount} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <span style={label}>Name</span>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input" placeholder="Your full name" />
              </div>
              <div>
                <span style={label}>Email</span>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder="your@email.com" />
              </div>
              <button type="submit" disabled={saving} className="btn-primary" style={{ alignSelf: 'flex-start', padding: '10px 24px' }}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>

          {/* Password */}
          <div style={card}>
            {sectionHeader(<Lock size={14} />, 'Change Password')}
            <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <span style={label}>New Password</span>
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="input" placeholder="Minimum 8 characters" minLength={8} required />
              </div>
              <button type="submit" disabled={saving || !newPassword} className="btn-secondary" style={{ alignSelf: 'flex-start', padding: '10px 24px' }}>
                {saving ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>

          {/* Notifications */}
          <div style={card}>
            {sectionHeader(<Bell size={14} />, 'Notifications')}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
              <div>
                <p style={{ fontFamily: 'Inter', fontSize: 12, color: 'var(--text-1)', marginBottom: 4 }}>Email alerts for high-risk scans</p>
                <p style={{ fontFamily: 'Inter', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.05em' }}>Get notified when a scan returns a critical threat</p>
              </div>
              <button
                onClick={() => setNotifications(!notifications)}
                style={{
                  width: 44, height: 24, borderRadius: 12, position: 'relative', flexShrink: 0,
                  background: notifications ? 'rgba(48,209,88,0.3)' : 'var(--ovw-0p06)',
                  border: `1px solid ${notifications ? 'rgba(48,209,88,0.4)' : 'var(--ovw-0p1)'}`,
                  transition: 'all 0.2s',
                }}
              >
                <div style={{
                  position: 'absolute', top: 2, width: 18, height: 18, borderRadius: '50%',
                  background: notifications ? 'var(--safe)' : 'var(--text-3)',
                  left: notifications ? 22 : 2,
                  transition: 'all 0.2s',
                }} />
              </button>
            </div>
          </div>

          {/* Data management */}
          <div style={card}>
            {sectionHeader(<Trash2 size={14} />, 'Data Management')}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderRadius: 12, background: 'var(--ovw-0p02)', border: '1px solid var(--ovw-0p06)' }}>
                <div>
                  <p style={{ fontFamily: 'Inter', fontSize: 12, color: 'var(--text-1)', marginBottom: 3 }}>Delete scan history</p>
                  <p style={{ fontFamily: 'Inter', fontSize: 10, color: 'var(--text-3)' }}>Removes all EYES, NOSE, and BRAIN data</p>
                </div>
                <button onClick={() => setDeleteHistoryOpen(true)} className="btn-danger" style={{ padding: '7px 16px', fontSize: 11 }}>
                  Delete History
                </button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderRadius: 12, background: 'rgba(255,45,45,0.04)', border: '1px solid rgba(255,45,45,0.15)' }}>
                <div>
                  <p style={{ fontFamily: 'Inter', fontSize: 12, color: 'var(--text-1)', marginBottom: 3 }}>Delete account</p>
                  <p style={{ fontFamily: 'Inter', fontSize: 10, color: 'var(--text-3)' }}>Permanent — cannot be undone</p>
                </div>
                <button onClick={() => setDeleteOpen(true)} className="btn-danger" style={{ padding: '7px 16px', fontSize: 11 }}>
                  Delete Account
                </button>
              </div>
            </div>
          </div>

          {/* About */}
          <div style={card}>
            {sectionHeader(<Info size={14} />, 'About')}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {[
                { label: 'Version', value: '1.0.0' },
                { label: 'Platform', value: 'D0B3RMAN SaaS' },
                { label: 'AI Engine', value: 'Claude claude-sonnet-4-20250514' },
                { label: 'Detection', value: 'Hive AI Moderation' },
              ].map(({ label: l, value }, i, arr) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--ovw-0p04)' : 'none' }}>
                  <span style={{ fontFamily: 'Inter', fontSize: 10, letterSpacing: '0.03em', color: 'var(--text-3)', textTransform: 'uppercase' }}>{l}</span>
                  <span style={{ fontFamily: 'Inter', fontSize: 12, color: 'var(--text-2)' }}>{value}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 20, marginTop: 16 }}>
              {['Privacy Policy', 'Terms of Service', 'Contact'].map((link) => (
                <span key={link} style={{ fontFamily: 'Inter', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.05em', textDecoration: 'underline', textUnderlineOffset: 3 }}>{link}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Delete history modal */}
      <Modal open={deleteHistoryOpen} onClose={() => setDeleteHistoryOpen(false)} title="Delete Scan History">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ fontFamily: 'Inter', fontSize: 12, color: 'var(--text-2)', lineHeight: 1.6 }}>
            This will permanently delete all your EYES scans, NOSE scans, and BRAIN conversations. This cannot be undone.
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setDeleteHistoryOpen(false)} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
            <button onClick={handleDeleteHistory} disabled={deleting} className="btn-danger" style={{ flex: 1 }}>
              {deleting ? 'Deleting...' : 'Delete All History'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete account modal */}
      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete Account">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 10, background: 'rgba(255,45,45,0.06)', border: '1px solid rgba(255,45,45,0.2)' }}>
            <AlertTriangle size={14} style={{ color: 'var(--danger)', flexShrink: 0 }} />
            <p style={{ fontFamily: 'Inter', fontSize: 11, color: 'var(--danger)' }}>This action is permanent and cannot be undone.</p>
          </div>
          <p style={{ fontFamily: 'Inter', fontSize: 12, color: 'var(--text-2)', lineHeight: 1.6 }}>
            Your account and all associated data will be permanently deleted.
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setDeleteOpen(false)} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
            <button onClick={handleDeleteAccount} disabled={deleting} className="btn-danger" style={{ flex: 1 }}>
              {deleting ? 'Deleting...' : 'Yes, Delete Account'}
            </button>
          </div>
        </div>
      </Modal>
    </Layout>
  )
}
