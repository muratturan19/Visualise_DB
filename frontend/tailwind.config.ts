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
        deepNavy: '#1e293b',
        steelBlue: '#334155',
        brightBlue: '#3b82f6',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        neutral: {
          white: '#ffffff',
          light: '#f8fafc',
          medium: '#e2e8f0',
          dark: '#64748b',
          black: '#0f172a',
        },
        accent: {
          DEFAULT: '#3b82f6',
          light: '#60a5fa',
          dark: '#1d4ed8',
        },
        primary: {
          DEFAULT: '#1e293b',
          light: '#334155',
          dark: '#0f172a',
        },
        secondary: {
          DEFAULT: '#334155',
          light: '#64748b',
          dark: '#1e293b',
        },
        light: {
          base: '#ffffff',
          foreground: '#1e293b',
        },
        dark: {
          base: '#0f172a',
          foreground: '#f8fafc',
        },
      },
    },
  },
  plugins: [],
})

export default config
