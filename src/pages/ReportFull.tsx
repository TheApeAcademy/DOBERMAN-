import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, Download, ChevronDown, BookOpen, X } from 'lucide-react'
import { Layout } from '../components/layout/Layout'
import { useAuth } from '../hooks/useAuth'
import { REPORT } from '../data/reportContent'
import { DownloadModal } from '../components/report/DownloadModal'

const FRONT_SECTIONS = [
  { id: 'abstract', label: 'Abstract' },
  { id: 'dedication', label: 'Dedication' },
  { id: 'acknowledgements', label: 'Acknowledgements' },
]

export default function ReportFull() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [activeSection, setActiveSection] = useState<string>('abstract')
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [downloadOpen, setDownloadOpen] = useState(false)
  const [navOpen, setNavOpen] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  const scrollTo = (id: string) => {
    setActiveSection(id)
    const el = document.getElementById(`section-${id}`)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setNavOpen(false)
  }

  const toggleChapter = (num: string) => {
    setExpanded((prev) => ({ ...prev, [num]: !prev[num] }))
  }

  const NavContent = () => (
    <>
      <div style={{ padding: '0 16px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: 8 }}>
        <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase' }}>Navigation</p>
      </div>

      {FRONT_SECTIONS.map(({ id, label }) => (
        <button
          key={id}
          onClick={() => scrollTo(id)}
          className="report-nav-item"
          style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '8px 16px', width: '100%',
            textAlign: 'left', background: activeSection === id ? 'rgba(255,255,255,0.06)' : 'transparent',
            border: 'none', transition: 'all 0.15s', cursor: 'pointer',
          }}
        >
          {activeSection === id && <div style={{ width: 2, height: 14, background: 'white', borderRadius: 1, flexShrink: 0 }} />}
          <p style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: activeSection === id ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.4)', letterSpacing: '0.03em' }}>{label}</p>
        </button>
      ))}

      <div style={{ padding: '12px 16px 4px' }}>
        <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.15)', textTransform: 'uppercase' }}>Chapters</p>
      </div>

      {REPORT.chapters.map((ch) => (
        <div key={ch.number}>
          <button
            onClick={() => { toggleChapter(ch.number); scrollTo(`ch-${ch.number}`) }}
            className="report-nav-item"
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', width: '100%', textAlign: 'left', background: activeSection === `ch-${ch.number}` ? 'rgba(255,255,255,0.06)' : 'transparent', border: 'none', cursor: 'pointer', transition: 'all 0.15s' }}
          >
            <span style={{ fontFamily: 'Bebas Neue', fontSize: 14, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.25)', width: 18, flexShrink: 0 }}>{ch.number}</span>
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: activeSection === `ch-${ch.number}` ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.4)', flex: 1, lineHeight: 1.3 }}>{ch.title}</p>
            <ChevronDown size={12} style={{ color: 'rgba(255,255,255,0.2)', transform: expanded[ch.number] ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }} />
          </button>
          {expanded[ch.number] && ch.sections.map((sec) => (
            <button
              key={sec.id}
              onClick={() => scrollTo(sec.id)}
              className="report-nav-item"
              style={{ display: 'block', padding: '6px 16px 6px 44px', width: '100%', textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer', transition: 'all 0.15s' }}
            >
              <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: activeSection === sec.id ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.25)', lineHeight: 1.4 }}>{sec.heading}</p>
            </button>
          ))}
        </div>
      ))}

      <div style={{ padding: '4px 16px' }}>
        <button
          onClick={() => scrollTo('references')}
          className="report-nav-item"
          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', width: '100%', textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer' }}
        >
          <p style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>References</p>
        </button>
      </div>
    </>
  )

  return (
    <Layout profile={profile} onSignOut={signOut} title="Technical Report — Full Document">
      <style>{`
        .report-nav-item:hover { background: rgba(255,255,255,0.04) !important; }
        .report-desktop-sidebar { display: flex; }
        @media (max-width: 768px) {
          .report-desktop-sidebar { display: none !important; }
          .report-mobile-nav-btn { display: flex !important; }
        }
        .report-mobile-nav-btn { display: none; }
      `}</style>

      <div style={{ display: 'flex', height: 'calc(100vh - 56px)', overflow: 'hidden', position: 'relative' }}>

        {/* ── MOBILE NAV DRAWER ── */}
        <AnimatePresence>
          {navOpen && (
            <>
              <motion.div
                key="overlay"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 50 }}
                onClick={() => setNavOpen(false)}
              />
              <motion.div
                key="drawer"
                initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
                transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                style={{
                  position: 'fixed', left: 0, top: 0, bottom: 0, width: 280, zIndex: 51,
                  background: 'rgba(8,8,10,0.98)', borderRight: '1px solid rgba(255,255,255,0.1)',
                  overflowY: 'auto', paddingTop: 20,
                  backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)', marginBottom: 4 }}>
                  <span style={{ fontFamily: 'Bebas Neue', fontSize: 16, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.7)' }}>Contents</span>
                  <button onClick={() => setNavOpen(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: 4 }}>
                    <X size={16} />
                  </button>
                </div>
                <NavContent />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* ── DESKTOP SIDEBAR ── */}
        <aside
          className="report-desktop-sidebar"
          style={{
            width: 260, height: '100%', borderRight: '1px solid rgba(255,255,255,0.07)',
            overflowY: 'auto', flexShrink: 0, padding: '20px 0',
            background: 'rgba(4,4,4,0.98)', flexDirection: 'column',
          }}
        >
          <NavContent />
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main
          ref={contentRef}
          style={{ flex: 1, overflowY: 'auto', padding: 'clamp(16px, 4vw, 48px)', background: 'var(--void)', position: 'relative', minWidth: 0 }}
        >
          {/* Sticky top bar */}
          <div style={{
            position: 'sticky', top: 0, zIndex: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 32, padding: '12px 0',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            background: 'var(--void)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
            gap: 8,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
              {/* Mobile nav toggle */}
              <button
                className="report-mobile-nav-btn"
                onClick={() => setNavOpen(true)}
                style={{ alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 7, color: 'rgba(255,255,255,0.6)', padding: '6px 10px', cursor: 'pointer', flexShrink: 0 }}
              >
                <BookOpen size={13} />
              </button>
              <button
                onClick={() => navigate('/report')}
                style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontFamily: 'JetBrains Mono', fontSize: 11, cursor: 'pointer', flexShrink: 0 }}
              >
                <ChevronLeft size={14} />
                <span>Report</span>
              </button>
              <span style={{ color: 'rgba(255,255,255,0.15)', fontFamily: 'JetBrains Mono', fontSize: 11, flexShrink: 0 }}>/</span>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'rgba(255,255,255,0.35)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Full Document</span>
            </div>
            <button
              onClick={() => setDownloadOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, color: 'white', fontFamily: 'Syne', fontWeight: 600, fontSize: 12, cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap' }}
            >
              <Download size={12} /> Download
            </button>
          </div>

          {/* Title page */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            style={{ textAlign: 'center', marginBottom: 80, paddingTop: 16 }}
          >
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.2)', marginBottom: 6, textTransform: 'uppercase' }}>
              Precious Cornerstone University, Ibadan
            </p>
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.2)', marginBottom: 40, textTransform: 'uppercase' }}>
              Department of Cyber Security
            </p>
            <h1 style={{ fontFamily: 'Bebas Neue', fontSize: 'clamp(52px, 16vw, 120px)', letterSpacing: '0.15em', lineHeight: 0.88, marginBottom: 20, background: 'linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.6) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              DOBERMAN
            </h1>
            <p style={{ fontFamily: 'Syne', fontWeight: 500, fontSize: 'clamp(13px, 2.5vw, 20px)', color: 'rgba(255,255,255,0.5)', maxWidth: 540, margin: '0 auto 40px', lineHeight: 1.55, padding: '0 8px' }}>
              Design and Implementation of a Multi-Module AI-Powered Cybersecurity Intelligence Platform
            </p>
            <div style={{ display: 'inline-block', textAlign: 'left', padding: 'clamp(16px, 4vw, 28px) clamp(16px, 5vw, 36px)', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 16, maxWidth: '100%' }}>
              {[
                ['Author', 'Olusanu Joshua Bankole'],
                ['Matric', '2022/493'],
                ['Supervisor', 'Dr. Osutokun Kemi'],
                ['University', 'Precious Cornerstone University, Ibadan'],
                ['Programme', 'B.Sc. Cyber Security'],
                ['Session', '2025/2026'],
              ].map(([key, val]) => (
                <div key={key} style={{ display: 'flex', gap: 'clamp(12px, 3vw, 24px)', marginBottom: 8, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.25)', width: 70, flexShrink: 0, textTransform: 'uppercase', paddingTop: 1 }}>{key}</span>
                  <span style={{ fontFamily: 'Syne', fontWeight: 600, fontSize: 13, color: 'rgba(255,255,255,0.75)', flex: 1, minWidth: 0 }}>{val}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <div style={{ maxWidth: 800, margin: '0 auto' }}>

            {/* Abstract */}
            <section id="section-abstract" style={{ marginBottom: 64 }}>
              <SectionLabel>Abstract</SectionLabel>
              {REPORT.abstract.split('\n\n').map((para, i) => (
                <BodyText key={i}>{para}</BodyText>
              ))}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 20 }}>
                {REPORT.keywords.map((kw) => (
                  <span key={kw} style={{ fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.1em', color: 'var(--safe)', background: 'rgba(48,209,88,0.06)', border: '1px solid rgba(48,209,88,0.15)', padding: '4px 10px', borderRadius: 4 }}>{kw}</span>
                ))}
              </div>
            </section>

            {/* Dedication */}
            <section id="section-dedication" style={{ marginBottom: 64 }}>
              <SectionLabel>Dedication</SectionLabel>
              {REPORT.dedication.split('\n\n').map((para, i) => (
                <p key={i} style={{ fontFamily: 'Syne', fontSize: 15, fontStyle: 'italic', color: 'rgba(255,255,255,0.5)', lineHeight: 1.8, marginBottom: 16, textAlign: 'center' }}>{para}</p>
              ))}
            </section>

            {/* Acknowledgements */}
            <section id="section-acknowledgements" style={{ marginBottom: 64 }}>
              <SectionLabel>Acknowledgements</SectionLabel>
              {REPORT.acknowledgements.split('\n\n').map((para, i) => (
                <BodyText key={i}>{para}</BodyText>
              ))}
            </section>

            {/* Chapters */}
            {REPORT.chapters.map((chapter) => (
              <section key={chapter.number} id={`section-ch-${chapter.number}`} style={{ marginBottom: 72 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32, paddingBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.08)', flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: 'Bebas Neue', fontSize: 'clamp(36px, 8vw, 56px)', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.06)', lineHeight: 1 }}>{chapter.number}</span>
                  <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 'clamp(20px, 4vw, 36px)', color: 'white', lineHeight: 1.15, flex: 1, minWidth: 0 }}>
                    {chapter.title}
                  </h2>
                </div>

                {chapter.sections.map((section) => (
                  <div key={section.id} id={`section-${section.id}`} style={{ marginBottom: 48 }}>
                    <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 16, color: 'rgba(255,255,255,0.85)', marginBottom: 16, paddingLeft: 12, borderLeft: '2px solid rgba(255,255,255,0.15)' }}>
                      {section.heading}
                    </h3>
                    {section.body.map((para, i) => (
                      <BodyText key={i}>{para}</BodyText>
                    ))}
                  </div>
                ))}
              </section>
            ))}

            {/* References */}
            <section id="section-references" style={{ marginBottom: 72 }}>
              <SectionLabel>References</SectionLabel>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {REPORT.references.map((ref) => (
                  <div key={ref.number} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'rgba(255,255,255,0.3)', flexShrink: 0, paddingTop: 2, width: 28 }}>[{ref.number}]</span>
                    <p style={{ fontFamily: 'Syne', fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.65 }}>{ref.citation}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Appendices */}
            {REPORT.appendices.map((app, i) => (
              <section key={i} style={{ marginBottom: 64 }}>
                <SectionLabel>{app.title}</SectionLabel>
                {app.content.map((para, j) => {
                  const isCode = para.includes('\n') && (para.includes('CREATE') || para.includes('Deno.serve') || para.includes('//'))
                  return isCode ? (
                    <pre key={j} style={{ fontFamily: 'JetBrains Mono', fontSize: 11, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '20px 24px', overflowX: 'auto', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, marginBottom: 20, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      {para}
                    </pre>
                  ) : (
                    <BodyText key={j}>{para}</BodyText>
                  )
                })}
              </section>
            ))}

          </div>
        </main>
      </div>

      <DownloadModal open={downloadOpen} onClose={() => setDownloadOpen(false)} />
    </Layout>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
        <div style={{ height: 1, width: 32, background: 'rgba(255,255,255,0.12)' }} />
        <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.25em', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase' }}>{children}</p>
        <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
      </div>
    </div>
  )
}

function BodyText({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontFamily: 'Syne', fontSize: 14, color: 'rgba(255,255,255,0.55)', lineHeight: 1.85, marginBottom: 16, textAlign: 'justify' }}>
      {children}
    </p>
  )
}
