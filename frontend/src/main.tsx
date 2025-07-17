import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import ProDashboard from './ProDashboard.jsx'
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ProDashboard />
  </StrictMode>,
)
