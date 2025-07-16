import type { Config } from 'tailwindcss'

const config: Config = {
  mode: 'jit',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
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
      },
    },
  },
  plugins: [],
}
export default config
