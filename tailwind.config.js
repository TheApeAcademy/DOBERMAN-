/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        /* Legacy names mapped to CHROME VOID palette — routed through the
           CSS custom properties in index.css so these classes flip with
           [data-theme] instead of being pinned to dark values. */
        'bg-primary': 'var(--void)',
        'bg-secondary': 'var(--void-1)',
        'bg-tertiary': 'var(--void-2)',
        'border-color': 'var(--glass-border)',
        'accent-red': 'var(--danger)',
        'accent-amber': 'var(--warning)',
        'accent-green': 'var(--safe)',
        'accent-blue': 'var(--chrome-mid)',
        'text-primary': 'var(--text-1)',
        'text-secondary': 'var(--text-2)',
        'text-muted': 'var(--text-3)',
      },
      fontFamily: {
        'display': ['"Bebas Neue"', 'sans-serif'],
        'heading': ['Inter', 'sans-serif'],
        'body': ['Inter', 'sans-serif'],
        'label': ['Inter', 'sans-serif'],
        'mono': ['"Geist Mono"', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.4s ease-in-out',
        'spin': 'spin 0.8s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        spin: {
          to: { transform: 'rotate(360deg)' },
        },
      },
    },
  },
  plugins: [],
}
