import { Shield } from 'lucide-react'
import { Layout } from '../components/layout/Layout'
import { useAuth } from '../hooks/useAuth'

export default function Breach() {
  const { profile, signOut } = useAuth()

  return (
    <Layout profile={profile} onSignOut={signOut} title="BREACH">
      <div style={{ padding: 'clamp(16px, 4vw, 32px)', maxWidth: 800, margin: '0 auto' }}>
        <div style={{ marginBottom: 48 }}>
          <p style={{ fontFamily: 'JetBrains Mono', fontSize: 11, letterSpacing: '0.2em', color: 'var(--danger)', marginBottom: 12 }}>
            [ EMAIL BREACH SCAN ]
          </p>
          <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 'clamp(36px, 6vw, 72px)', lineHeight: 0.92, marginBottom: 16 }}>
            BREACH
          </h1>
          <p style={{ fontFamily: 'Syne', fontSize: 15, color: 'var(--text-2)', maxWidth: 480 }}>
            Scan email addresses for known data breaches and exposed credentials.
          </p>
        </div>

        <div className="glass" style={{ borderRadius: 24, padding: 48, textAlign: 'center' }}>
          <Shield size={40} style={{ color: 'var(--text-3)', marginBottom: 20 }} />
          <p style={{ fontFamily: 'Bebas Neue', fontSize: 28, letterSpacing: '0.15em', color: 'var(--text-2)', marginBottom: 8 }}>
            COMING SOON
          </p>
          <p style={{ fontFamily: 'Syne', fontSize: 14, color: 'var(--text-3)', maxWidth: 360, margin: '0 auto' }}>
            Email breach scanning is being deployed. Check back shortly.
          </p>
        </div>
      </div>
    </Layout>
  )
}
