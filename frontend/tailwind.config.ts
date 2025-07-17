import withMT from '@material-tailwind/react/utils/withMT'
import type { Config } from 'tailwindcss'

const config: Config = withMT({
  mode: 'jit',
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx,jsx,js}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Roboto', 'ui-sans-serif', 'system-ui'],
      },
      colors: {
        'brand-primary': '#1e293b',
        'brand-secondary': '#334155',
        'brand-accent': '#3b82f6',
        'accent-dark': '#1d4ed8',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        'neutral-white': '#ffffff',
        'neutral-light': '#f8fafc',
        'neutral-medium': '#e2e8f0',
        'neutral-dark': '#64748b',
        'neutral-black': '#0f172a',
      },
      backgroundImage: {
        'gradient-accent': 'linear-gradient(to right, #3b82f6, #1d4ed8)',
        'gradient-header': 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
        'gradient-card': 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
      },
    },
  },
  plugins: [],
})

export default config
