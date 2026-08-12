import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useAuth } from './hooks/useAuth'
import { PageWrapper } from './components/ui/PageWrapper'
import Landing from './pages/Landing'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import Eyes from './pages/Eyes'
import Nose from './pages/Nose'
import Brain from './pages/Brain'
import News from './pages/News'
import NewsArticle from './pages/NewsArticle'
import History from './pages/History'
import Settings from './pages/Settings'
import Profile from './pages/Profile'
import ShareTarget from './pages/ShareTarget'
import Globe from './pages/Globe'
import Daye from './pages/Daye'
import Breach from './pages/Breach'
import Report from './pages/Report'
import ReportFull from './pages/ReportFull'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--void)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 20 }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', border: '2px solid var(--ovw-0p08)', borderTop: '2px solid var(--ovw-0p5)', animation: 'spin 0.8s linear infinite' }} />
        <span style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, sans-serif', fontSize: 20, letterSpacing: '0.2em', color: 'var(--text-3)' }}>D0B3RMAN</span>
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
        <Route path="/privacy" element={<PageWrapper><Privacy /></PageWrapper>} />
        <Route path="/terms" element={<PageWrapper><Terms /></PageWrapper>} />
        <Route path="/share-target" element={<ProtectedRoute><ShareTarget /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><PageWrapper><Dashboard /></PageWrapper></ProtectedRoute>} />
        <Route path="/eyes" element={<ProtectedRoute><PageWrapper><Eyes /></PageWrapper></ProtectedRoute>} />
        <Route path="/nose" element={<ProtectedRoute><PageWrapper><Nose /></PageWrapper></ProtectedRoute>} />
        <Route path="/brain" element={<ProtectedRoute><PageWrapper><Brain /></PageWrapper></ProtectedRoute>} />
        <Route path="/news" element={<ProtectedRoute><PageWrapper><News /></PageWrapper></ProtectedRoute>} />
        <Route path="/news/article" element={<ProtectedRoute><PageWrapper><NewsArticle /></PageWrapper></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute><PageWrapper><History /></PageWrapper></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><PageWrapper><Settings /></PageWrapper></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><PageWrapper><Profile /></PageWrapper></ProtectedRoute>} />
        <Route path="/globe" element={<ProtectedRoute><PageWrapper><Globe /></PageWrapper></ProtectedRoute>} />
        <Route path="/deepfake" element={<Navigate to="/eyes" replace />} />
        <Route path="/daye" element={<ProtectedRoute><PageWrapper><Daye /></PageWrapper></ProtectedRoute>} />
        <Route path="/breach" element={<ProtectedRoute><PageWrapper><Breach /></PageWrapper></ProtectedRoute>} />
        <Route path="/report" element={<ProtectedRoute><PageWrapper><Report /></PageWrapper></ProtectedRoute>} />
        <Route path="/report/full" element={<ProtectedRoute><PageWrapper><ReportFull /></PageWrapper></ProtectedRoute>} />
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
      <div style={{ position: 'relative', zIndex: 1 }}>
        <AnimatedRoutes />
      </div>
    </BrowserRouter>
  )
}
