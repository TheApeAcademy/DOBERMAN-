import { StrictMode, Component } from 'react'
import type { ReactNode, ErrorInfo } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('DOBERMAN runtime error:', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          minHeight: '100vh',
          background: '#080B0F',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          fontFamily: 'monospace',
          padding: '24px',
        }}>
          <div style={{ color: '#E6EDF3', fontSize: '32px', letterSpacing: '0.2em' }}>DOBERMAN</div>
          <div style={{
            color: '#FF3B3B',
            fontSize: '13px',
            background: 'rgba(255,59,59,0.1)',
            border: '1px solid rgba(255,59,59,0.3)',
            borderRadius: '8px',
            padding: '16px 20px',
            maxWidth: '500px',
            textAlign: 'center',
            lineHeight: 1.6,
          }}>
            <strong>Configuration required</strong><br />
            Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel project settings, then redeploy.
          </div>
          <div style={{ color: '#484F58', fontSize: '11px' }}>{this.state.error.message}</div>
        </div>
      )
    }
    return this.props.children
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
