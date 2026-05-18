/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        /* Legacy names mapped to CHROME VOID palette */
        'bg-primary': '#09090b',
        'bg-secondary': '#0d0d10',
        'bg-tertiary': '#111116',
        'border-color': 'rgba(255,255,255,0.10)',
        'accent-red': '#FF2D2D',
        'accent-amber': '#FF9500',
        'accent-green': '#30D158',
        'accent-blue': '#ABABAB',
        'text-primary': '#FFFFFF',
        'text-secondary': '#94A3B8',
        'text-muted': '#64748B',
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
