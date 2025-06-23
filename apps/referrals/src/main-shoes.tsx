import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import ShoesApp from './ShoesApp.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ShoesApp />
  </StrictMode>,
) 