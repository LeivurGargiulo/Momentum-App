import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n' // Initialize i18n
import App from './App.jsx'
import { registerSW } from './utils/pwa.js'

// Register service worker for PWA functionality
registerSW();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)