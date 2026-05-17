import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useAuth } from './hooks/useAuth'
import { PageWrapper } from './components/ui/PageWrapper'
import { GlobalChrome3D } from './components/3d/ChromeScene'
import Landing from './pages/Landing'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import Deepfake from './pages/Deepfake'
import Nose from './pages/Nose'
import Daye from './pages/Daye'
import News from './pages/News'
import Breach from './pages/Breach'
import Globe from './pages/Globe'
import History from './pages/History'
import Settings from './pages/Settings'
import Profile from './pages/Profile'
import ShareTarget from './pages/ShareTarget'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--void)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 20 }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.08)', borderTop: '2px solid rgba(255,255,255,0.5)', animation: 'spin 0.8s linear infinite' }} />
        <span style={{ fontFamily: 'Bebas Neue', fontSize: 20, letterSpacing: '0.2em', color: 'var(--text-3)' }}>D0B3RMAN</span>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/auth" replace />
  }

  return <>{children}</>
}

function AnimatedRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<PageWrapper><Auth /></PageWrapper>} />
        <Route path="/share-target" element={<ProtectedRoute><ShareTarget /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><PageWrapper><Dashboard /></PageWrapper></ProtectedRoute>} />

        {/* Core modules */}
        <Route path="/deepfake" element={<ProtectedRoute><PageWrapper><Deepfake /></PageWrapper></ProtectedRoute>} />
        <Route path="/breach" element={<ProtectedRoute><PageWrapper><Breach /></PageWrapper></ProtectedRoute>} />
        <Route path="/nose" element={<ProtectedRoute><PageWrapper><Nose /></PageWrapper></ProtectedRoute>} />
        <Route path="/daye" element={<ProtectedRoute><PageWrapper><Daye /></PageWrapper></ProtectedRoute>} />
        <Route path="/globe" element={<ProtectedRoute><PageWrapper><Globe /></PageWrapper></ProtectedRoute>} />
        <Route path="/news" element={<ProtectedRoute><PageWrapper><News /></PageWrapper></ProtectedRoute>} />

        {/* Legacy redirects */}
        <Route path="/eyes" element={<Navigate to="/deepfake" replace />} />
        <Route path="/brain" element={<Navigate to="/daye" replace />} />

        <Route path="/history" element={<ProtectedRoute><PageWrapper><History /></PageWrapper></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><PageWrapper><Settings /></PageWrapper></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><PageWrapper><Profile /></PageWrapper></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
      <GlobalChrome3D />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <AnimatedRoutes />
      </div>
    </BrowserRouter>
  )
}
