import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

if ('serviceWorker' in navigator) {
  let refreshing = false
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) return
    refreshing = true
    window.location.reload()
  })
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}service-worker.js?v=1.1.1`, { updateViaCache: 'none' })
      .then(registration => registration.update())
      .catch(error => console.info('Service worker se nepodařilo zaregistrovat:', error.message))
  })
}

createRoot(document.getElementById('root')).render(
  <StrictMode><App /></StrictMode>,
)
