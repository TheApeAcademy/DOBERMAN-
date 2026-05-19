import { useState } from 'react'
import { motion, useDragControls } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Sparkles } from 'lucide-react'

export function DayeFloat() {
  const navigate = useNavigate()
  const dragControls = useDragControls()
  const [dragged, setDragged] = useState(false)

  const handlePointerDown = (e: React.PointerEvent) => {
    dragControls.start(e)
  }

  const handleClick = () => {
    if (!dragged) navigate('/brain')
  }

  return (
    <motion.div
      drag
      dragControls={dragControls}
      dragMomentum={false}
      dragElastic={0}
      onDragStart={() => setDragged(true)}
      onDragEnd={() => setTimeout(() => setDragged(false), 50)}
      whileDrag={{ scale: 1.08, cursor: 'grabbing' }}
      whileHover={{ scale: 1.06 }}
      style={{
        position: 'fixed',
        bottom: 28,
        right: 28,
        zIndex: 9000,
        cursor: 'grab',
        userSelect: 'none',
        touchAction: 'none',
      }}
    >
      <div
        onPointerDown={handlePointerDown}
        onClick={handleClick}
        style={{ position: 'relative' }}
      >
        {/* Outer glow ring */}
        <motion.div
          animate={{ scale: [1, 1.18, 1], opacity: [0.35, 0, 0.35] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            inset: -8,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(48,209,88,0.25) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        {/* Main button */}
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: '50%',
            background: 'linear-gradient(145deg, #3de06a 0%, #25a244 60%, #1a7a32 100%)',
            border: '1px solid rgba(48,209,88,0.5)',
            boxShadow: '0 0 24px rgba(48,209,88,0.35), 0 4px 20px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.25)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
          }}
        >
          <Sparkles size={13} style={{ color: 'rgba(255,255,255,0.9)' }} />
          <span style={{
            fontFamily: 'Bebas Neue',
            fontSize: 12,
            letterSpacing: '0.15em',
            color: 'white',
            lineHeight: 1,
            userSelect: 'none',
          }}>
            DAYE
          </span>
        </div>

        {/* Tooltip */}
        <div style={{
          position: 'absolute',
          right: '110%',
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'rgba(6,6,6,0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 8,
          padding: '6px 12px',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          opacity: 0,
        }}
          className="daye-tooltip"
        >
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.1em' }}>
            AI ANALYST
          </span>
        </div>
      </div>

      <style>{`
        .daye-tooltip { transition: opacity 0.15s; }
        div:hover > div > .daye-tooltip { opacity: 1 !important; }
      `}</style>
    </motion.div>
  )
}
