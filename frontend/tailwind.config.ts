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
        navy: '#1e40af',
        charcoal: '#36454F',
        accent: {
          DEFAULT: '#f59e0b',
          light: '#fcd34d',
          dark: '#b45309',
        },
        primary: {
          DEFAULT: '#2563eb',
          light: '#3b82f6',
          dark: '#1e40af',
        },
        secondary: {
          DEFAULT: '#10b981',
          light: '#6ee7b7',
          dark: '#047857',
        },
        light: {
          base: '#ffffff',
          foreground: '#1e293b',
        },
        dark: {
          base: '#36454F',
          foreground: '#f9fafb',
        },
      },
    },
  },
  plugins: [],
})

export default config
