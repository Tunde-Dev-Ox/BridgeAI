import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import "./lib/sentry";
import App from './App.jsx'

pendo.initialize({ visitor: { id: '' } });

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
