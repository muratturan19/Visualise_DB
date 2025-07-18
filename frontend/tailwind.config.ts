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
    },
  },
  plugins: [],
})

export default config
