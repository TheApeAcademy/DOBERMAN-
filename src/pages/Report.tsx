import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BookOpen, Download, ArrowRight, Eye, Wifi, Brain, Newspaper, Globe, Database, Layers, Shield } from 'lucide-react'
import { Layout } from '../components/layout/Layout'
import { useAuth } from '../hooks/useAuth'
import { REPORT } from '../data/reportContent'
import { DownloadModal } from '../components/report/DownloadModal'

const IN_VIEW = {
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.7, ease: [0.25, 0.1, 0.25, 1] as const },
  viewport: { once: true, margin: '-40px' },
}

const chapterIcons = [Shield, Eye, Layers, Database, Layers, Shield, BookOpen]
const chapterColors = [
  'rgba(255,255,255,0.9)',
  'rgba(48,209,88,0.9)',
  'rgba(255,149,0,0.9)',
  'rgba(100,210,255,0.9)',
  'rgba(191,90,242,0.9)',
  'rgba(48,209,88,0.9)',
  'rgba(255,255,255,0.6)',
]

const highlights = [
  { icon: Eye, label: 'EYES', sub: 'Deepfake Detection', color: 'var(--safe)' },
  { icon: Wifi, label: 'NOSE', sub: 'IoT Intelligence', color: 'var(--warning)' },
  { icon: Brain, label: 'BRAIN', sub: 'AI Analyst', color: 'rgba(191,90,242,0.9)' },
  { icon: Newspaper, label: 'NEWS', sub: 'Credibility', color: 'var(--danger)' },
  { icon: Globe, label: 'EXTENSION', sub: 'Browser', color: 'rgba(100,210,255,0.9)' },
  { icon: Database, label: 'SUPABASE', sub: 'PostgreSQL + RLS', color: 'rgba(255,255,255,0.6)' },
  { icon: Layers, label: 'EDGE FNS', sub: 'Deno Serverless', color: 'rgba(255,149,0,0.9)' },
  { icon: Shield, label: 'HIVE AI', sub: 'Vision Models', color: 'rgba(48,209,88,0.9)' },
]

export default function Report() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [downloadOpen, setDownloadOpen] = useState(false)

  return (
    <Layout profile={profile} onSignOut={signOut} title="Technical Report">
      <div style={{ padding: 'clamp(16px, 4vw, 40px)', maxWidth: 1100, margin: '0 auto' }}>

        {/* ── HERO ── */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          className="glass"
          style={{ padding: 'clamp(32px, 6vw, 64px)', borderRadius: 28, marginBottom: 32, position: 'relative', overflow: 'hidden' }}
        >
          <div style={{ position: 'absolute', top: 0, right: 0, width: 400, height: 400, background: 'radial-gradient(circle at top right, rgba(48,209,88,0.04), transparent 70%)', pointerEvents: 'none' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
            <img
              src="/pcu-logo.png"
              alt="Precious Cornerstone University"
              style={{ width: 44, height: 44, objectFit: 'contain', flexShrink: 0 }}
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
            />
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.25em', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase' }}>
              [ FINAL YEAR PROJECT — 2025/2026 ]
            </p>
          </div>

          <h1 style={{ fontFamily: 'Bebas Neue', fontSize: 'clamp(52px, 10vw, 96px)', letterSpacing: '0.12em', lineHeight: 0.9, marginBottom: 16 }}>
            DOBERMAN
          </h1>
          <p style={{ fontFamily: 'Syne', fontWeight: 600, fontSize: 'clamp(14px, 2.5vw, 20px)', color: 'rgba(255,255,255,0.65)', maxWidth: 700, lineHeight: 1.5, marginBottom: 32 }}>
            Design and Implementation of a Multi-Module AI-Powered Cybersecurity Intelligence Platform
          </p>

          {/* Author chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 40 }}>
            {[
              { label: 'Olusanu Joshua Bankole' },
              { label: 'Matric: 2022/493' },
              { label: 'Supervisor: Dr. Osutokun Kemi' },
              { label: 'PCU, Ibadan' },
              { label: 'B.Sc. Cyber Security' },
              { label: '2025/2026' },
            ].map(({ label }) => (
              <span key={label} style={{ fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '5px 12px', borderRadius: 6 }}>
                {label}
              </span>
            ))}
          </div>

          {/* CTA buttons */}
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <motion.button
              whileHover={{ scale: 1.03, boxShadow: '0 0 30px rgba(255,255,255,0.12)' }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/report/full')}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 28px', background: 'white', color: 'black', fontFamily: 'Syne', fontWeight: 700, fontSize: 14, border: 'none', borderRadius: 12 }}
            >
              <BookOpen size={16} />
              View Full Document
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setDownloadOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 28px', background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 12, color: 'white', fontFamily: 'Syne', fontWeight: 600, fontSize: 14, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12)' }}
            >
              <Download size={16} />
              Download
            </motion.button>
          </div>
        </motion.div>

        {/* ── ABSTRACT ── */}
        <motion.div {...IN_VIEW} className="glass" style={{ padding: '32px 36px', borderRadius: 24, marginBottom: 32 }}>
          <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.3)', marginBottom: 16, textTransform: 'uppercase' }}>Abstract</p>
          {REPORT.abstract.split('\n\n').map((para, i) => (
            <p key={i} style={{ fontFamily: 'Syne', fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.75, marginBottom: i < REPORT.abstract.split('\n\n').length - 1 ? 16 : 0 }}>
              {para}
            </p>
          ))}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 20 }}>
            {REPORT.keywords.map((kw) => (
              <span key={kw} style={{ fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.1em', color: 'var(--safe)', background: 'rgba(48,209,88,0.07)', border: '1px solid rgba(48,209,88,0.2)', padding: '4px 10px', borderRadius: 4 }}>
                {kw}
              </span>
            ))}
          </div>
        </motion.div>

        {/* ── TECH HIGHLIGHTS ── */}
        <motion.div {...IN_VIEW} style={{ marginBottom: 32 }}>
          <p style={{ fontFamily: 'JetBrains Mono', fontSize: 11, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.3)', marginBottom: 16, textTransform: 'uppercase' }}>
            Platform Highlights
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
            {highlights.map(({ icon: Icon, label, sub, color }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                viewport={{ once: true }}
                className="glass"
                style={{ padding: '20px 22px', borderRadius: 16, display: 'flex', alignItems: 'center', gap: 14 }}
              >
                <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color.replace('0.9', '0.1')}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={16} style={{ color }} />
                </div>
                <div>
                  <p style={{ fontFamily: 'Bebas Neue', fontSize: 18, letterSpacing: '0.1em', lineHeight: 1 }}>{label}</p>
                  <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>{sub}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── CHAPTER OVERVIEW ── */}
        <motion.div {...IN_VIEW} style={{ marginBottom: 40 }}>
          <p style={{ fontFamily: 'JetBrains Mono', fontSize: 11, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.3)', marginBottom: 16, textTransform: 'uppercase' }}>
            Chapter Overview
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {REPORT.chapters.map((ch, i) => {
              const Icon = chapterIcons[i] || BookOpen
              const color = chapterColors[i] || 'rgba(255,255,255,0.6)'
              return (
                <motion.button
                  key={ch.number}
                  initial={{ opacity: 0, x: -24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.07 }}
                  viewport={{ once: true }}
                  whileHover={{ x: 4, borderColor: 'rgba(255,255,255,0.16)' }}
                  onClick={() => navigate('/report/full')}
                  className="glass"
                  style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '18px 22px', borderRadius: 16, textAlign: 'left', transition: 'all 0.2s' }}
                >
                  <span style={{ fontFamily: 'Bebas Neue', fontSize: 24, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.15)', width: 32, flexShrink: 0 }}>
                    {ch.number}
                  </span>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color.replace('0.9', '0.08')}`, border: `1px solid ${color.replace('0.9', '0.2')}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={15} style={{ color }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 14, color: 'rgba(255,255,255,0.85)', marginBottom: 3 }}>
                      {ch.title}
                    </p>
                    <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>
                      {ch.sections.length} sections
                    </p>
                  </div>
                  <ArrowRight size={14} style={{ color: 'rgba(255,255,255,0.2)', flexShrink: 0 }} />
                </motion.button>
              )
            })}
          </div>
        </motion.div>

        {/* ── BOTTOM CTA ── */}
        <motion.div {...IN_VIEW} className="glass" style={{ padding: '32px', borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
          <div>
            <p style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 18, color: 'white', marginBottom: 4 }}>
              Ready to read the full document?
            </p>
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>
              {REPORT.chapters.length} chapters · {REPORT.references.length} references · IEEE citation format
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/report/full')}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', background: 'white', color: 'black', fontFamily: 'Syne', fontWeight: 700, fontSize: 13, border: 'none', borderRadius: 10 }}
            >
              <BookOpen size={14} />
              Read Full Report
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setDownloadOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 10, color: 'white', fontFamily: 'Syne', fontWeight: 600, fontSize: 13 }}
            >
              <Download size={14} />
              Download
            </motion.button>
          </div>
        </motion.div>

      </div>

      <DownloadModal open={downloadOpen} onClose={() => setDownloadOpen(false)} />
    </Layout>
  )
}
