import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { RelayEnvironmentProvider } from 'react-relay'
import environment from './lib/relay-environment'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <RelayEnvironmentProvider environment={environment}>
        <App />
      </RelayEnvironmentProvider>
    </BrowserRouter>
  </StrictMode>,
)