import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, Wifi, Brain, ChevronDown, Shield, TrendingUp, AlertTriangle, Zap, ArrowRight, CheckCircle } from 'lucide-react'

const stats = [
  { value: '400%', label: 'increase in deepfake attacks year over year' },
  { value: '70%', label: 'of IoT devices have at least one critical vulnerability' },
  { value: '$4.45M', label: 'average cost of a data breach in 2024' },
  { value: '1 in 5', label: 'minutes, a new deepfake is created globally' },
]

const modules = [
  {
    id: 'eyes',
    icon: Eye,
    name: 'EYES',
    tagline: 'Deepfake Detection',
    description: 'Upload any image, video, or audio. DOBERMAN analyzes it using Hive AI and returns a trust score with a plain-language explanation. Know in seconds if what you\'re seeing is real.',
    color: '#3B82F6',
    bullets: ['Image, video, and audio analysis', 'Trust score 0-100', 'AI-generated explanation', 'Scan history'],
  },
  {
    id: 'nose',
    icon: Wifi,
    name: 'NOSE',
    tagline: 'IoT Vulnerability Intelligence',
    description: 'Describe your network environment. DOBERMAN maps your devices, identifies known CVEs, and delivers a prioritized action plan to lock down your network before attackers do.',
    color: '#8B5CF6',
    bullets: ['Natural language network input', 'CVE vulnerability database', 'Device-by-device risk breakdown', 'Prioritized remediation plan'],
  },
  {
    id: 'brain',
    icon: Brain,
    name: 'BRAIN',
    tagline: 'AI Security Analyst',
    description: 'Your personal cybersecurity expert, available 24/7. Powered by Claude. Ask anything - from explaining a phishing email to responding to an active incident. Always direct. Always actionable.',
    color: '#00D46A',
    bullets: ['Claude-powered security analyst', 'Persistent conversation history', 'File and document analysis', 'Concrete next steps every time'],
  },
]

const steps = [
  { n: '01', title: 'Upload or Describe', desc: 'Upload media for EYES, describe your network for NOSE, or type a question for BRAIN.' },
  { n: '02', title: 'DOBERMAN Analyzes', desc: 'AI engines scan for synthetic markers, cross-reference vulnerability databases, or compose expert security advice.' },
  { n: '03', title: 'Act on Intelligence', desc: 'Get confidence scores, threat reports, and specific actionable recommendations - not vague warnings.' },
]

export default function Landing() {
  const navigate = useNavigate()
  const heroRef = useRef<HTMLDivElement>(null)
  const [expandedModule, setExpandedModule] = useState<string | null>(null)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToHow = () => {
    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      {/* Navbar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 transition-all duration-300 ${
          scrolled ? 'bg-bg-primary/90 backdrop-blur-md border-b border-border-color' : ''
        }`}
      >
        <span className="font-display text-2xl tracking-widest">DOBERMAN</span>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/auth')}
            className="text-text-secondary hover:text-text-primary font-label text-sm transition-colors"
          >
            Sign In
          </button>
          <button
            onClick={() => navigate('/auth')}
            className="btn-primary text-sm px-4 py-2"
          >
            Get Started Free
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden"
      >
        {/* Animated grid background */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at 50% 60%, rgba(59,130,246,0.08) 0%, transparent 70%), radial-gradient(ellipse at 80% 20%, rgba(139,92,246,0.05) 0%, transparent 50%)',
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(#3B82F6 1px, transparent 1px), linear-gradient(90deg, #3B82F6 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        {/* Hero content */}
        <div className="relative z-10 text-center max-w-4xl mx-auto space-y-8 page-fade">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent-blue/10 border border-accent-blue/20 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse" />
            <span className="text-accent-blue font-label text-xs font-medium tracking-wide">
              POWERED BY CLAUDE AI + HIVE AI
            </span>
          </div>

          <h1
            className="font-display leading-none tracking-widest"
            style={{ fontSize: 'clamp(64px, 12vw, 160px)' }}
          >
            DOBERMAN
          </h1>

          <p className="text-text-secondary font-heading text-xl sm:text-2xl font-bold max-w-2xl mx-auto leading-tight">
            The watchdog for the AI era.
          </p>

          <p className="text-text-muted font-body text-base max-w-xl mx-auto leading-relaxed">
            Detect deepfakes. Expose IoT vulnerabilities. Get expert cybersecurity advice. One platform. Three intelligent modules. Zero guesswork.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/auth')}
              className="btn-primary px-8 py-4 text-base"
              style={{ boxShadow: '0 0 40px rgba(59,130,246,0.2)' }}
            >
              <Zap size={18} />
              Get Started Free
            </button>
            <button
              onClick={scrollToHow}
              className="btn-secondary px-8 py-4 text-base"
            >
              See How It Works
            </button>
          </div>

          <p className="text-text-muted font-label text-xs">
            No credit card required - Free tier includes 3 daily scans per module
          </p>
        </div>

        {/* Scroll indicator */}
        <button
          onClick={scrollToHow}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-text-muted hover:text-text-secondary transition-colors animate-bounce"
        >
          <ChevronDown size={24} />
        </button>
      </section>

      {/* Stats */}
      <section className="py-16 px-6 border-y border-border-color bg-bg-secondary/50">
        <div className="max-w-5xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map(({ value, label }) => (
            <div key={label} className="text-center space-y-2">
              <p className="font-display text-4xl sm:text-5xl" style={{ color: '#FF3B3B' }}>{value}</p>
              <p className="text-text-muted font-body text-sm leading-relaxed">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Modules */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 space-y-3">
            <p className="text-accent-blue font-label text-xs tracking-widest">THREE MODULES. ONE WATCHDOG.</p>
            <h2 className="font-heading font-bold text-3xl sm:text-4xl text-text-primary">
              Intelligence built for today's threats.
            </h2>
          </div>

          <div className="space-y-4">
            {modules.map(({ id, icon: Icon, name, tagline, description, color, bullets }) => (
              <div
                key={id}
                className="card overflow-hidden"
                style={{
                  borderColor: expandedModule === id ? `${color}30` : undefined,
                  boxShadow: expandedModule === id ? `0 0 30px ${color}10` : undefined,
                }}
              >
                <button
                  className="w-full flex items-center justify-between p-6 hover:bg-bg-tertiary transition-colors"
                  onClick={() => setExpandedModule(expandedModule === id ? null : id)}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ background: `${color}15` }}
                    >
                      <Icon size={22} style={{ color }} />
                    </div>
                    <div className="text-left">
                      <p className="font-display text-2xl tracking-wider" style={{ color }}>{name}</p>
                      <p className="text-text-secondary font-label font-medium text-sm">{tagline}</p>
                    </div>
                  </div>
                  <ChevronDown
                    size={18}
                    className="text-text-muted transition-transform"
                    style={{ transform: expandedModule === id ? 'rotate(180deg)' : 'none' }}
                  />
                </button>

                {expandedModule === id && (
                  <div className="px-6 pb-6 page-fade">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 border-t border-border-color">
                      <p className="text-text-secondary font-body text-sm leading-relaxed col-span-1 sm:col-span-2">
                        {description}
                      </p>
                      <div className="space-y-2">
                        {bullets.map((b) => (
                          <div key={b} className="flex items-center gap-2">
                            <CheckCircle size={14} style={{ color }} />
                            <span className="text-text-secondary font-body text-sm">{b}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-end">
                        <button
                          onClick={() => navigate('/auth')}
                          className="inline-flex items-center gap-2 font-label font-medium text-sm transition-colors"
                          style={{ color }}
                        >
                          Try {name} Free
                          <ArrowRight size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 px-6 bg-bg-secondary/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 space-y-3">
            <p className="text-accent-blue font-label text-xs tracking-widest">SIMPLE BY DESIGN</p>
            <h2 className="font-heading font-bold text-3xl sm:text-4xl text-text-primary">How DOBERMAN works.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map(({ n, title, desc }, i) => (
              <div key={n} className="relative">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="font-display text-4xl text-text-muted">{n}</span>
                    {i < steps.length - 1 && (
                      <div className="hidden md:block flex-1 h-px bg-border-color" />
                    )}
                  </div>
                  <h3 className="font-heading font-bold text-text-primary">{title}</h3>
                  <p className="text-text-muted font-body text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why DOBERMAN */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 space-y-3">
            <p className="text-accent-blue font-label text-xs tracking-widest">WHY DOBERMAN</p>
            <h2 className="font-heading font-bold text-3xl sm:text-4xl text-text-primary">Built for real threats.</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              { icon: Shield, title: 'Multi-modal protection', desc: 'DOBERMAN covers the three biggest emerging threat vectors: synthetic media, IoT devices, and social engineering - all in one platform.', color: '#3B82F6' },
              { icon: TrendingUp, title: 'Intelligence, not alerts', desc: 'No vague warnings. DOBERMAN gives you a score, an explanation, and a specific next step. Every time.', color: '#00D46A' },
              { icon: AlertTriangle, title: 'Threats are evolving', desc: 'Deepfakes, IoT exploits, and AI-powered phishing are the new normal. DOBERMAN was built specifically for the AI era.', color: '#FFB020' },
              { icon: Zap, title: 'Instant deployment', desc: 'Sign up in 30 seconds. No hardware. No integration. Just open DOBERMAN and start analyzing threats immediately.', color: '#8B5CF6' },
            ].map(({ icon: Icon, title, desc, color }) => (
              <div
                key={title}
                className="card p-6 space-y-3"
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = `${color}30`
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = ''
                }}
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${color}15` }}>
                  <Icon size={18} style={{ color }} />
                </div>
                <h3 className="font-heading font-bold text-text-primary">{title}</h3>
                <p className="text-text-muted font-body text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-bg-secondary/50 border-y border-border-color">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h2 className="font-display text-5xl sm:text-7xl tracking-widest text-text-primary">
            DEPLOY THE<br />WATCHDOG.
          </h2>
          <p className="text-text-muted font-body text-base">
            Free. Instant. No credit card required.
          </p>
          <button
            onClick={() => navigate('/auth')}
            className="btn-primary px-10 py-4 text-lg mx-auto"
            style={{ boxShadow: '0 0 40px rgba(59,130,246,0.25)' }}
          >
            <Zap size={20} />
            Get Started Free
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border-color">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-display text-xl tracking-widest text-text-muted">DOBERMAN</span>
          <div className="flex gap-6">
            {['Privacy', 'Terms', 'Contact'].map((link) => (
              <span key={link} className="text-text-muted font-label text-xs hover:text-text-secondary cursor-pointer transition-colors">
                {link}
              </span>
            ))}
          </div>
          <p className="text-text-muted font-label text-xs">
            2025 DOBERMAN. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
