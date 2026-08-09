import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import type { ReactNode } from 'react'

const SF = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", system-ui, sans-serif'

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section style={{ marginBottom: 40 }}>
      <h2 style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, sans-serif', fontWeight: 700, fontSize: 20, color: 'rgba(255,255,255,0.92)', marginBottom: 14 }}>{title}</h2>
      <div style={{ fontFamily: SF, fontSize: 14.5, color: 'rgba(255,255,255,0.55)', lineHeight: 1.75 }}>{children}</div>
    </section>
  )
}

export default function Privacy() {
  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff' }}>
      <header style={{ padding: '20px clamp(20px,4vw,48px)', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 16 }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontFamily: SF, fontSize: 13 }}>
          <ArrowLeft size={16} /> Back
        </Link>
        <span style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, sans-serif', fontSize: 18, letterSpacing: '0.2em', marginLeft: 'auto' }}>D0B3RMAN</span>
      </header>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: 'clamp(40px,6vw,72px) clamp(20px,4vw,48px) 96px' }}>
        <p style={{ fontFamily: 'Inter', fontSize: 11, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.3)', marginBottom: 12, textTransform: 'uppercase' }}>
          Last updated August 2026
        </p>
        <h1 style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, sans-serif', fontSize: 'clamp(40px,6vw,64px)', letterSpacing: '0.03em', lineHeight: 1, marginBottom: 32 }}>
          PRIVACY POLICY
        </h1>

        <Section title="Overview">
          <p>
            D0B3RMAN ("we", "us") provides deepfake detection, content verification, breach checking, and
            cyber threat intelligence, through this web app and an optional browser extension. This page
            explains what we collect, why, and how it's used — in both the web app and the extension.
          </p>
        </Section>

        <Section title="What we collect">
          <p style={{ marginBottom: 14 }}><strong style={{ color: 'rgba(255,255,255,0.8)' }}>Account information.</strong> Email address, display name, and any profile details you provide when you sign up, via Supabase Auth.</p>
          <p style={{ marginBottom: 14 }}><strong style={{ color: 'rgba(255,255,255,0.8)' }}>Deepfake scans.</strong> Images, video, or audio you upload are sent to our detection provider (Hive AI) for analysis. The file name, result, and confidence score are saved to your scan history so you can review it later.</p>
          <p style={{ marginBottom: 14 }}><strong style={{ color: 'rgba(255,255,255,0.8)' }}>Breach checks.</strong> Email addresses and phone numbers you submit are saved to your scan history along with the result. <strong style={{ color: 'rgba(255,255,255,0.8)' }}>Passwords are never transmitted or stored in full.</strong> We only send the first 5 characters of your password's SHA-1 hash to HaveIBeenPwned's Pwned Passwords API (k-anonymity) — your actual password never leaves your device, and no password or password hash is ever saved to our database.</p>
          <p style={{ marginBottom: 14 }}><strong style={{ color: 'rgba(255,255,255,0.8)' }}>Content verification.</strong> Headlines, claims, or article text/URLs you submit are analyzed and the result is saved to your history.</p>
          <p style={{ marginBottom: 14 }}><strong style={{ color: 'rgba(255,255,255,0.8)' }}>DAYE conversations.</strong> Messages you send to DAYE (our AI analyst) are stored so the conversation has continuity, and to let you revisit past conversations.</p>
          <p style={{ marginBottom: 14 }}><strong style={{ color: 'rgba(255,255,255,0.8)' }}>Cyber Globe.</strong> Selecting a country to view a threat brief is not tied to your identity beyond normal request logging.</p>
          <p><strong style={{ color: 'rgba(255,255,255,0.8)' }}>Browser extension.</strong> The extension only acts on content you explicitly right-click (an image, selected text, or a link) — it does not read or track pages you haven't invoked it on. It stores your web-app session token locally in the browser (via Chrome's extension storage) so scans you run from the extension are attributed to your account, exactly like being signed in on the website.</p>
        </Section>

        <Section title="Who we share data with">
          <p style={{ marginBottom: 10 }}>We send data to these providers only to perform the action you requested:</p>
          <ul style={{ paddingLeft: 20, margin: 0 }}>
            <li style={{ marginBottom: 8 }}><strong style={{ color: 'rgba(255,255,255,0.8)' }}>Hive AI</strong> — deepfake/synthetic media detection</li>
            <li style={{ marginBottom: 8 }}><strong style={{ color: 'rgba(255,255,255,0.8)' }}>HaveIBeenPwned</strong> — breach and exposed-password checks</li>
            <li style={{ marginBottom: 8 }}><strong style={{ color: 'rgba(255,255,255,0.8)' }}>Anthropic (Claude)</strong> — DAYE's responses and Cyber Globe intelligence briefs</li>
            <li style={{ marginBottom: 8 }}><strong style={{ color: 'rgba(255,255,255,0.8)' }}>Supabase</strong> — our database, authentication, and hosting provider</li>
          </ul>
          <p style={{ marginTop: 14 }}>We do not sell your data, and we do not use it for advertising.</p>
        </Section>

        <Section title="Extension permissions, explained">
          <ul style={{ paddingLeft: 20, margin: 0 }}>
            <li style={{ marginBottom: 8 }}><strong style={{ color: 'rgba(255,255,255,0.8)' }}>activeTab / host permissions</strong> — needed to read the specific image, text, or link you right-click, and to show the result overlay on that page.</li>
            <li style={{ marginBottom: 8 }}><strong style={{ color: 'rgba(255,255,255,0.8)' }}>contextMenus</strong> — adds the right-click "Analyze with D0B3RMAN" options.</li>
            <li style={{ marginBottom: 8 }}><strong style={{ color: 'rgba(255,255,255,0.8)' }}>storage</strong> — holds your session token locally so the extension knows you're signed in.</li>
          </ul>
        </Section>

        <Section title="Data retention">
          <p>
            Scan history (deepfake results, breach check results, verification results, DAYE conversations)
            is kept until you delete it from your History page or delete your account. You can request full
            account deletion at any time by contacting us below.
          </p>
        </Section>

        <Section title="Your rights">
          <p>
            You can review your scan history in-app at any time, and request access to or deletion of your
            data by emailing us. If you're in a jurisdiction with statutory data rights (GDPR, CCPA, or
            similar), those rights apply to you regardless of where our infrastructure is hosted.
          </p>
        </Section>

        <Section title="Contact">
          <p>
            Questions about this policy or your data: <a href="mailto:hello@d0b3rman.ai" style={{ color: 'var(--safe)' }}>hello@d0b3rman.ai</a>
          </p>
        </Section>
      </div>
    </div>
  )
}
