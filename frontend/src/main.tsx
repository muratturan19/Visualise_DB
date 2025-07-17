import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from '@material-tailwind/react'
import './index.css'
import ProDashboard from './ProDashboard.jsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <ProDashboard />
    </ThemeProvider>
  </StrictMode>,
)
