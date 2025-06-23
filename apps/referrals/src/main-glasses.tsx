import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import GlassesApp from './GlassesApp.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GlassesApp />
  </StrictMode>,
) 