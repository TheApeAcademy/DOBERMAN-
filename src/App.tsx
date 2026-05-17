import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { GlobalChrome3D } from './components/3d/ChromeScene'
import Landing from './pages/Landing'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import Eyes from './pages/Eyes'
import Nose from './pages/Nose'
import Brain from './pages/Brain'
import News from './pages/News'
import NewsArticle from './pages/NewsArticle'
import Breach from './pages/Breach'
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
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/share-target" element={<ProtectedRoute><ShareTarget /></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/eyes" element={<ProtectedRoute><Eyes /></ProtectedRoute>} />
      <Route path="/nose" element={<ProtectedRoute><Nose /></ProtectedRoute>} />
      <Route path="/brain" element={<ProtectedRoute><Brain /></ProtectedRoute>} />
      <Route path="/news" element={<ProtectedRoute><News /></ProtectedRoute>} />
      <Route path="/news/article" element={<ProtectedRoute><NewsArticle /></ProtectedRoute>} />
      <Route path="/breach" element={<ProtectedRoute><Breach /></ProtectedRoute>} />
      <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
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
