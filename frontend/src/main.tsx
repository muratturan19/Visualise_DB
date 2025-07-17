import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import ProDashboard from './ProDashboard.jsx'
import ErrorBoundary from './components/ErrorBoundary'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <ProDashboard />
    </ErrorBoundary>
  </StrictMode>,
)
