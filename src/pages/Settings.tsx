import { useState } from 'react'
import { User, Bell, Trash2, Info, AlertTriangle, CheckCircle } from 'lucide-react'
import { Layout } from '../components/layout/Layout'
import { Modal } from '../components/ui/Modal'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'

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

  return (
    <Layout profile={profile} onSignOut={signOut} title="Settings">
      <div className="p-6 max-w-2xl mx-auto page-fade space-y-6">
        <div className="mb-6">
          <h1 className="font-heading font-bold text-2xl text-text-primary">Settings</h1>
          <p className="text-text-muted font-body text-sm mt-1">Manage your DOBERMAN account</p>
        </div>

        {saved && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-green-900/20 border border-green-800/30 page-fade">
            <CheckCircle size={16} className="text-accent-green" />
            <p className="text-accent-green font-body text-sm">Changes saved successfully.</p>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-900/20 border border-red-800/40">
            <AlertTriangle size={16} className="text-accent-red" />
            <p className="text-accent-red font-body text-sm">{error}</p>
          </div>
        )}

        {/* Account */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <User size={16} className="text-text-muted" />
            <h2 className="font-heading font-bold text-text-primary">Account</h2>
          </div>
          <form onSubmit={handleSaveAccount} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-text-secondary font-label text-xs font-medium tracking-wide">NAME</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input"
                placeholder="Your full name"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-text-secondary font-label text-xs font-medium tracking-wide">EMAIL</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="your@email.com"
              />
            </div>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Password */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <User size={16} className="text-text-muted" />
            <h2 className="font-heading font-bold text-text-primary">Change Password</h2>
          </div>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-text-secondary font-label text-xs font-medium tracking-wide">NEW PASSWORD</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input"
                placeholder="Minimum 8 characters"
                minLength={8}
                required
              />
            </div>
            <button type="submit" disabled={saving || !newPassword} className="btn-secondary">
              {saving ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>

        {/* Notifications */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Bell size={16} className="text-text-muted" />
            <h2 className="font-heading font-bold text-text-primary">Notifications</h2>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-primary font-body text-sm">Email alerts for high-risk scans</p>
              <p className="text-text-muted font-label text-xs mt-0.5">Get notified when a scan returns a critical threat</p>
            </div>
            <button
              onClick={() => setNotifications(!notifications)}
              className={`w-11 h-6 rounded-full transition-colors relative ${notifications ? 'bg-accent-blue' : 'bg-bg-tertiary border border-border-color'}`}
            >
              <div
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${notifications ? 'translate-x-5' : 'translate-x-0.5'}`}
              />
            </button>
          </div>
        </div>

        {/* Data */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Trash2 size={16} className="text-accent-red" />
            <h2 className="font-heading font-bold text-text-primary">Data Management</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-bg-tertiary rounded-lg">
              <div>
                <p className="text-text-primary font-body text-sm">Delete scan history</p>
                <p className="text-text-muted font-label text-xs mt-0.5">Removes all EYES, NOSE, and BRAIN data</p>
              </div>
              <button
                onClick={() => setDeleteHistoryOpen(true)}
                className="btn-secondary text-sm px-3 py-1.5 text-accent-red border-red-800/30"
              >
                Delete History
              </button>
            </div>
            <div className="flex items-center justify-between p-3 bg-bg-tertiary rounded-lg border border-red-900/30">
              <div>
                <p className="text-text-primary font-body text-sm">Delete account</p>
                <p className="text-text-muted font-label text-xs mt-0.5">This action is permanent and cannot be undone</p>
              </div>
              <button
                onClick={() => setDeleteOpen(true)}
                className="btn-danger text-sm px-3 py-1.5"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>

        {/* About */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Info size={16} className="text-text-muted" />
            <h2 className="font-heading font-bold text-text-primary">About</h2>
          </div>
          <div className="space-y-2">
            {[
              { label: 'Version', value: '1.0.0' },
              { label: 'Platform', value: 'DOBERMAN SaaS' },
              { label: 'AI Engine', value: 'Claude (claude-sonnet-4-20250514)' },
              { label: 'Detection', value: 'Hive AI Moderation' },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between py-1 border-b border-border-color last:border-0">
                <span className="text-text-muted font-label text-xs">{label}</span>
                <span className="text-text-primary font-body text-sm">{value}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-4 mt-4">
            {['Privacy Policy', 'Terms of Service', 'Contact'].map((link) => (
              <span key={link} className="text-accent-blue text-xs font-label hover:underline cursor-pointer">
                {link}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Delete history modal */}
      <Modal open={deleteHistoryOpen} onClose={() => setDeleteHistoryOpen(false)} title="Delete Scan History">
        <div className="space-y-4">
          <p className="text-text-secondary font-body text-sm">
            This will permanently delete all your EYES scans, NOSE scans, and BRAIN conversations. This cannot be undone.
          </p>
          <div className="flex gap-3">
            <button onClick={() => setDeleteHistoryOpen(false)} className="flex-1 btn-secondary">Cancel</button>
            <button onClick={handleDeleteHistory} disabled={deleting} className="flex-1 btn-danger">
              {deleting ? 'Deleting...' : 'Delete All History'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete account modal */}
      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete Account">
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-red-900/20 border border-red-800/40 rounded-lg">
            <AlertTriangle size={16} className="text-accent-red shrink-0" />
            <p className="text-accent-red font-body text-sm">This action is permanent and cannot be undone.</p>
          </div>
          <p className="text-text-secondary font-body text-sm">
            Your account and all associated data will be permanently deleted.
          </p>
          <div className="flex gap-3">
            <button onClick={() => setDeleteOpen(false)} className="flex-1 btn-secondary">Cancel</button>
            <button onClick={handleDeleteAccount} disabled={deleting} className="flex-1 btn-danger">
              {deleting ? 'Deleting...' : 'Yes, Delete Account'}
            </button>
          </div>
        </div>
      </Modal>
    </Layout>
  )
}
