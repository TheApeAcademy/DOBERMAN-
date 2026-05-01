/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#080B0F',
        'bg-secondary': '#0D1117',
        'bg-tertiary': '#161B22',
        'border-color': '#21262D',
        'accent-red': '#FF3B3B',
        'accent-amber': '#FFB020',
        'accent-green': '#00D46A',
        'accent-blue': '#3B82F6',
        'text-primary': '#E6EDF3',
        'text-secondary': '#8B949E',
        'text-muted': '#484F58',
      },
      fontFamily: {
        'display': ['"Bebas Neue"', 'sans-serif'],
        'heading': ['Syne', 'sans-serif'],
        'body': ['"DM Mono"', 'monospace'],
        'label': ['Inter', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.4s ease-in-out',
        'count-up': 'countUp 1s ease-out',
        'scan-line': 'scanLine 8s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scanLine: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
      },
    },
  },
  plugins: [],
}
