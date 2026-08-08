import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../../hooks/useTheme'

interface ThemeToggleProps {
  size?: number
}

export function ThemeToggle({ size = 16 }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme()
  const isLight = theme === 'light'

  return (
    <button
      onClick={toggleTheme}
      title={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
      aria-label={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size + 16,
        height: size + 16,
        borderRadius: '50%',
        background: 'var(--ovw-0p05)',
        border: '1px solid var(--glass-border)',
        color: 'var(--text-2)',
        padding: 0,
        transition: 'background 0.2s, border-color 0.2s, color 0.2s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'var(--ovw-0p1)'
        e.currentTarget.style.color = 'var(--text-1)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'var(--ovw-0p05)'
        e.currentTarget.style.color = 'var(--text-2)'
      }}
    >
      {isLight ? <Moon size={size} /> : <Sun size={size} />}
    </button>
  )
}
