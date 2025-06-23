import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import ShoesGlassesApp from './ShoesGlassesApp.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ShoesGlassesApp />
  </StrictMode>,
) 