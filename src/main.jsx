import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import "./lib/sentry";
import "./lib/mixpanel";
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
