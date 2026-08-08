import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Shield, AlertCircle } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { ThemeToggle } from '../components/ui/ThemeToggle'

const rotatingStats = [
  '"1 deepfake is created every 5 minutes."',
  '"70% of IoT devices have at least one critical vulnerability."',
  '"Deepfake attacks increased 400% year over year."',
  '"The average cost of a data breach is $4.45M."',
  '"95% of cybersecurity breaches are caused by human error."',
]

export default function Auth() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [statIndex, setStatIndex] = useState(0)

  const { signIn, signUp, user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) navigate('/dashboard')
  }, [user, navigate])

  useEffect(() => {
    const timer = setInterval(() => {
      setStatIndex((i) => (i + 1) % rotatingStats.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error: authError } =
      mode === 'signin'
        ? await signIn(email, password)
        : await signUp(email, password, name)

    setLoading(false)

    if (authError) {
      setError(authError.message)
    } else {
      navigate('/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-[480px] shrink-0 bg-bg-secondary border-r border-border-color p-12 relative overflow-hidden">
        {/* Grid lines background */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'linear-gradient(#3B82F6 1px, transparent 1px), linear-gradient(90deg, #3B82F6 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        <div className="relative z-10">
          <span className="font-display text-4xl tracking-widest text-text-primary">D0B3RMAN</span>
          <p className="text-text-muted font-body text-sm mt-1 tracking-widest">CYBER WATCHDOG</p>
        </div>

        <div className="relative z-10 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-accent-blue">
              <Shield size={16} />
              <span className="text-xs font-label font-medium tracking-widest">THREAT INTELLIGENCE</span>
            </div>
            <p
              key={statIndex}
              className="text-text-secondary font-body text-lg leading-relaxed italic page-fade"
            >
              {rotatingStats[statIndex]}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Deepfakes Detected', value: '50K+' },
              { label: 'Networks Scanned', value: '12K+' },
              { label: 'Threats Analyzed', value: '200K+' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-bg-primary/50 rounded-lg p-3 border border-border-color">
                <p className="text-text-primary font-display text-2xl">{value}</p>
                <p className="text-text-muted font-label text-xs mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-text-muted font-body text-xs">
            Protected by enterprise-grade security. Your data never leaves our secure infrastructure.
          </p>
        </div>
      </div>

      {/* Right panel - Auth form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-bg-primary relative">
        <div style={{ position: 'absolute', top: 20, right: 20 }}>
          <ThemeToggle size={14} />
        </div>
        <div className="w-full max-w-md space-y-8 page-fade">
          {/* Mobile logo */}
          <div className="lg:hidden text-center">
            <span className="font-display text-3xl tracking-widest text-text-primary">D0B3RMAN</span>
          </div>

          {/* 3D animation */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: -8 }}>
            <video
              autoPlay muted loop playsInline
              style={{ width: 340, height: 340, objectFit: 'contain', mixBlendMode: 'screen', pointerEvents: 'none' }}
            >
              <source src="/assets/video/blob-cube.mp4" type="video/mp4" />
            </video>
          </div>

          <div>
            <h2 className="font-heading font-bold text-2xl text-text-primary">
              {mode === 'signin' ? 'Welcome back.' : 'Create your account.'}
            </h2>
            <p className="text-text-secondary font-body text-sm mt-1">
              {mode === 'signin'
                ? 'Sign in to access your watchdog.'
                : 'Deploy D0B3RMAN in seconds.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div className="space-y-1.5">
                <label className="text-text-secondary font-label text-xs font-medium tracking-wide">
                  FULL NAME
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Bankole Adeyemi"
                  required
                  className="input"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-text-secondary font-label text-xs font-medium tracking-wide">
                EMAIL ADDRESS
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="input"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-text-secondary font-label text-xs font-medium tracking-wide">
                PASSWORD
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'signup' ? 'At least 8 characters' : 'Your password'}
                  required
                  minLength={mode === 'signup' ? 8 : undefined}
                  className="input pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-900/20 border border-red-800/40">
                <AlertCircle size={16} className="text-accent-red shrink-0" />
                <p className="text-accent-red font-body text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {mode === 'signin' ? 'Signing in...' : 'Creating account...'}
                </span>
              ) : (
                mode === 'signin' ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>

          <div className="text-center">
            <p className="text-text-muted font-body text-sm">
              {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}{' '}
              <button
                onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(null) }}
                className="text-accent-blue hover:underline font-medium"
              >
                {mode === 'signin' ? 'Sign up free' : 'Sign in'}
              </button>
            </p>
          </div>

          <p className="text-center text-text-muted font-label text-xs">
            By continuing, you agree to our{' '}
            <span className="text-text-secondary hover:text-text-primary cursor-pointer">Terms</span>
            {' '}and{' '}
            <span className="text-text-secondary hover:text-text-primary cursor-pointer">Privacy Policy</span>
          </p>
        </div>
      </div>
    </div>
  )
}
