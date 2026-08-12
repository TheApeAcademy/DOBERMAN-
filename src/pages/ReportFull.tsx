import { useState, useRef, useEffect } from 'react'
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

// Match the Layout component's own breakpoint (1024px)
function useIsMobile() {
  const [mobile, setMobile] = useState(() => window.innerWidth < 1024)
  useEffect(() => {
    const handler = () => setMobile(window.innerWidth < 1024)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return mobile
}

export default function ReportFull() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const isMobile = useIsMobile()
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
      <div style={{ padding: '0 16px 16px', borderBottom: '1px solid var(--ovw-0p06)', marginBottom: 8 }}>
        <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.2em', color: 'var(--ovw-0p2)', textTransform: 'uppercase' }}>Navigation</p>
      </div>

      {FRONT_SECTIONS.map(({ id, label }) => (
        <button
          key={id}
          onClick={() => scrollTo(id)}
          className="report-nav-item"
          style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '8px 16px', width: '100%',
            textAlign: 'left', background: activeSection === id ? 'var(--ovw-0p06)' : 'transparent',
            border: 'none', transition: 'all 0.15s', cursor: 'pointer',
          }}
        >
          {activeSection === id && <div style={{ width: 2, height: 14, background: 'white', borderRadius: 1, flexShrink: 0 }} />}
          <p style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: activeSection === id ? 'var(--ovw-0p9)' : 'var(--ovw-0p4)', letterSpacing: '0.03em' }}>{label}</p>
        </button>
      ))}

      <div style={{ padding: '12px 16px 4px' }}>
        <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.15em', color: 'var(--ovw-0p15)', textTransform: 'uppercase' }}>Chapters</p>
      </div>

      {REPORT.chapters.map((ch) => (
        <div key={ch.number}>
          <button
            onClick={() => { toggleChapter(ch.number); scrollTo(`ch-${ch.number}`) }}
            className="report-nav-item"
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', width: '100%', textAlign: 'left', background: activeSection === `ch-${ch.number}` ? 'var(--ovw-0p06)' : 'transparent', border: 'none', cursor: 'pointer', transition: 'all 0.15s' }}
          >
            <span style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, sans-serif', fontSize: 14, letterSpacing: '0.1em', color: 'var(--ovw-0p25)', width: 18, flexShrink: 0 }}>{ch.number}</span>
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: activeSection === `ch-${ch.number}` ? 'var(--ovw-0p9)' : 'var(--ovw-0p4)', flex: 1, lineHeight: 1.3 }}>{ch.title}</p>
            <ChevronDown size={12} style={{ color: 'var(--ovw-0p2)', transform: expanded[ch.number] ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }} />
          </button>
          {expanded[ch.number] && ch.sections.map((sec) => (
            <button
              key={sec.id}
              onClick={() => scrollTo(sec.id)}
              className="report-nav-item"
              style={{ display: 'block', padding: '6px 16px 6px 44px', width: '100%', textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer', transition: 'all 0.15s' }}
            >
              <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: activeSection === sec.id ? 'var(--ovw-0p7)' : 'var(--ovw-0p25)', lineHeight: 1.4 }}>{sec.heading}</p>
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
          <p style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--ovw-0p4)' }}>References</p>
        </button>
      </div>
    </>
  )

  return (
    <Layout profile={profile} onSignOut={signOut} title="Technical Report — Full Document">
      <style>{`.report-nav-item:hover { background: var(--ovw-0p04) !important; }`}</style>

      <div style={{ display: 'flex', height: 'calc(100vh - 56px)', overflow: 'hidden', position: 'relative' }}>

        {/* ── MOBILE NAV DRAWER (JS-controlled, no CSS media queries) ── */}
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
                  background: 'var(--surface-neutral)', borderRight: '1px solid var(--ovw-0p1)',
                  overflowY: 'auto', paddingTop: 20,
                  backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px 16px', borderBottom: '1px solid var(--ovw-0p07)', marginBottom: 4 }}>
                  <span style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, sans-serif', fontSize: 16, letterSpacing: '0.15em', color: 'var(--ovw-0p7)' }}>Contents</span>
                  <button onClick={() => setNavOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--ovw-0p4)', cursor: 'pointer', padding: 4 }}>
                    <X size={16} />
                  </button>
                </div>
                <NavContent />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* ── DESKTOP SIDEBAR — only rendered when NOT mobile ── */}
        {!isMobile && (
          <aside style={{
            width: 260, height: '100%', borderRight: '1px solid var(--ovw-0p07)',
            overflowY: 'auto', flexShrink: 0, padding: '20px 0',
            background: 'var(--surface-neutral)', display: 'flex', flexDirection: 'column',
          }}>
            <NavContent />
          </aside>
        )}

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
            borderBottom: '1px solid var(--ovw-0p06)',
            background: 'var(--void)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
            gap: 8,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
              {/* Contents button — only on mobile */}
              {isMobile && (
                <button
                  onClick={() => setNavOpen(true)}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--ovw-0p06)', border: '1px solid var(--ovw-0p1)', borderRadius: 7, color: 'var(--ovw-0p6)', padding: '6px 10px', cursor: 'pointer', flexShrink: 0 }}
                >
                  <BookOpen size={13} />
                </button>
              )}
              <button
                onClick={() => navigate('/report')}
                style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: 'var(--ovw-0p4)', fontFamily: 'JetBrains Mono', fontSize: 11, cursor: 'pointer', flexShrink: 0 }}
              >
                <ChevronLeft size={14} />
                <span>Report</span>
              </button>
              <span style={{ color: 'var(--ovw-0p15)', fontFamily: 'JetBrains Mono', fontSize: 11, flexShrink: 0 }}>/</span>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--ovw-0p35)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Full Document</span>
            </div>
            <button
              onClick={() => setDownloadOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: 'var(--ovw-0p06)', border: '1px solid var(--ovw-0p12)', borderRadius: 8, color: 'var(--text-1)', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, sans-serif', fontWeight: 600, fontSize: 12, cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap' }}
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
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.18em', color: 'var(--ovw-0p2)', marginBottom: 6, textTransform: 'uppercase' }}>
              Precious Cornerstone University, Ibadan
            </p>
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.18em', color: 'var(--ovw-0p2)', marginBottom: 20, textTransform: 'uppercase' }}>
              Department of Cyber Security
            </p>
            <img
              src="/pcu-logo.jpeg"
              alt="Precious Cornerstone University"
              style={{ width: 80, height: 80, objectFit: 'contain', display: 'block', margin: '0 auto 20px' }}
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
            />
            <h1 style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, sans-serif', fontSize: 'clamp(52px, 16vw, 120px)', letterSpacing: '0.15em', lineHeight: 0.88, marginBottom: 20, background: 'linear-gradient(135deg, #fff 0%, var(--ovw-0p6) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              DOBERMAN
            </h1>
            <p style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, sans-serif', fontWeight: 500, fontSize: 'clamp(13px, 2.5vw, 20px)', color: 'var(--ovw-0p5)', maxWidth: 540, margin: '0 auto 40px', lineHeight: 1.55, padding: '0 8px' }}>
              Design and Implementation of a Multi-Module AI-Powered Cybersecurity Intelligence Platform
            </p>
            <div style={{ display: 'inline-block', textAlign: 'left', padding: 'clamp(16px, 4vw, 28px) clamp(16px, 5vw, 36px)', background: 'var(--ovw-0p03)', border: '1px solid var(--ovw-0p09)', borderRadius: 16, maxWidth: '100%' }}>
              {[
                ['Author', 'Olusanu Joshua Bankole'],
                ['Matric', '2022/493'],
                ['Supervisor', 'Dr. Osutokun Kemi'],
                ['University', 'Precious Cornerstone University, Ibadan'],
                ['Programme', 'B.Sc. Cyber Security'],
                ['Session', '2025/2026'],
              ].map(([key, val]) => (
                <div key={key} style={{ display: 'flex', gap: 'clamp(12px, 3vw, 24px)', marginBottom: 8, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.1em', color: 'var(--ovw-0p25)', width: 70, flexShrink: 0, textTransform: 'uppercase', paddingTop: 1 }}>{key}</span>
                  <span style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, sans-serif', fontWeight: 600, fontSize: 13, color: 'var(--ovw-0p75)', flex: 1, minWidth: 0 }}>{val}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <div style={{ maxWidth: 800, margin: '0 auto' }}>

            {/* Abstract */}
            <section id="section-abstract" style={{ marginBottom: 64 }}>
              <SectionLabel>Abstract</SectionLabel>
              {REPORT.abstract.split('\n\n').map((para, i) => (
                <BodyText key={i} noIndent>{para}</BodyText>
              ))}
              <p style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, sans-serif', fontSize: 13, color: 'var(--ovw-0p45)', marginTop: 20, lineHeight: 1.7 }}>
                <em>Keywords:</em> {REPORT.keywords.join(', ')}
              </p>
            </section>

            {/* Dedication */}
            <section id="section-dedication" style={{ marginBottom: 64 }}>
              <SectionLabel>Dedication</SectionLabel>
              {REPORT.dedication.split('\n\n').map((para, i) => (
                <p key={i} style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, sans-serif', fontSize: 15, fontStyle: 'italic', color: 'var(--ovw-0p5)', lineHeight: 1.8, marginBottom: 16, textAlign: 'center', textIndent: 0 }}>{para}</p>
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
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32, paddingBottom: 16, borderBottom: '1px solid var(--ovw-0p08)', flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, sans-serif', fontSize: 'clamp(36px, 8vw, 56px)', letterSpacing: '0.1em', color: 'var(--ovw-0p06)', lineHeight: 1 }}>{chapter.number}</span>
                  <h2 style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, sans-serif', fontWeight: 800, fontSize: 'clamp(20px, 4vw, 36px)', color: 'var(--text-1)', lineHeight: 1.15, flex: 1, minWidth: 0 }}>
                    {chapter.title}
                  </h2>
                </div>

                {chapter.sections.map((section) => (
                  <div key={section.id} id={`section-${section.id}`} style={{ marginBottom: 48 }}>
                    <h3 style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, sans-serif', fontWeight: 700, fontSize: 16, color: 'var(--ovw-0p85)', marginBottom: 16, paddingLeft: 12, borderLeft: '2px solid var(--ovw-0p15)' }}>
                      {section.heading}
                    </h3>
                    {section.body.map((para, i) => (
                      <BodyText key={i}>{para}</BodyText>
                    ))}
                    {section.images && section.images.length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, margin: '24px 0 8px' }}>
                        {section.images.map((img, i) => (
                          <Figure key={i} src={img.src} caption={img.caption} />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </section>
            ))}

            {/* References */}
            <section id="section-references" style={{ marginBottom: 72 }}>
              <h2 style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, sans-serif', fontWeight: 700, fontSize: 22, color: 'var(--ovw-0p9)', textAlign: 'center', marginBottom: 28, letterSpacing: '0.02em' }}>References</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {REPORT.references.map((ref) => (
                  <div key={ref.number} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--ovw-0p22)', flexShrink: 0, paddingTop: 4, minWidth: 26, textAlign: 'right' }}>
                      [{ref.number}]
                    </span>
                    <p style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, sans-serif', fontSize: 13, color: 'var(--ovw-0p55)', lineHeight: 1.75, margin: 0 }}>
                      {renderText(ref.citation)}
                      {ref.url && (
                        <> <a href={ref.url} target="_blank" rel="noopener noreferrer"
                               style={{ color: 'rgba(100,210,255,0.65)', textDecoration: 'underline', textUnderlineOffset: '2px', wordBreak: 'break-all' }}>
                          {ref.url}
                        </a></>
                      )}
                    </p>
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
                    <pre key={j} style={{ fontFamily: 'JetBrains Mono', fontSize: 11, background: 'var(--ovw-0p03)', border: '1px solid var(--ovw-0p08)', borderRadius: 12, padding: '20px 24px', overflowX: 'auto', color: 'var(--ovw-0p6)', lineHeight: 1.7, marginBottom: 20, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      {para}
                    </pre>
                  ) : (
                    <BodyText key={j}>{para}</BodyText>
                  )
                })}
                {app.images && app.images.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20, marginTop: 24 }}>
                    {app.images.map((img, j) => (
                      <Figure key={j} src={img.src} caption={img.caption} compact />
                    ))}
                  </div>
                )}
              </section>
            ))}

          </div>
        </main>
      </div>

      <DownloadModal open={downloadOpen} onClose={() => setDownloadOpen(false)} />
    </Layout>
  )
}

function renderText(text: string): React.ReactNode {
  const parts: React.ReactNode[] = []
  let i = 0
  let k = 0

  while (i < text.length) {
    if (text[i] === '*') {
      const close = text.indexOf('*', i + 1)
      if (close !== -1) {
        parts.push(<em key={k++}>{text.slice(i + 1, close)}</em>)
        i = close + 1
        continue
      }
    }

    if (text.startsWith('https://', i) || text.startsWith('http://', i)) {
      let j = i
      while (j < text.length && text[j] !== ' ' && text[j] !== '\n' && text[j] !== ',' && text[j] !== ')') j++
      const url = text.slice(i, j)
      parts.push(
        <a key={k++} href={url} target="_blank" rel="noopener noreferrer"
           style={{ color: 'rgba(100,210,255,0.7)', textDecoration: 'underline', textUnderlineOffset: '2px' }}>
          {url}
        </a>
      )
      i = j
      continue
    }

    let j = i
    while (j < text.length && text[j] !== '*' && !text.startsWith('https://', j) && !text.startsWith('http://', j)) j++
    if (j > i) { parts.push(text.slice(i, j)); i = j } else { parts.push(text[i]); i++ }
  }

  return <>{parts}</>
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
        <div style={{ height: 1, width: 32, background: 'var(--ovw-0p12)' }} />
        <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.25em', color: 'var(--ovw-0p2)', textTransform: 'uppercase' }}>{children}</p>
        <div style={{ flex: 1, height: 1, background: 'var(--ovw-0p06)' }} />
      </div>
    </div>
  )
}

function Figure({ src, caption, compact }: { src: string; caption: string; compact?: boolean }) {
  return (
    <figure style={{ margin: 0 }}>
      <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid var(--ovw-0p1)', background: 'var(--ovw-0p02)' }}>
        <img src={src} alt={caption} loading="lazy" style={{ display: 'block', width: '100%', height: 'auto' }} />
      </div>
      <figcaption style={{ fontFamily: 'JetBrains Mono', fontSize: compact ? 10 : 11, color: 'var(--ovw-0p4)', lineHeight: 1.6, marginTop: 8, textAlign: 'left' }}>
        {caption}
      </figcaption>
    </figure>
  )
}

function BodyText({ children, noIndent }: { children: React.ReactNode; noIndent?: boolean }) {
  return (
    <p style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, sans-serif', fontSize: 14, color: 'var(--ovw-0p55)', lineHeight: 1.85, marginBottom: 16, textAlign: 'justify', textIndent: noIndent ? 0 : '1.5em' }}>
      {children}
    </p>
  )
}
