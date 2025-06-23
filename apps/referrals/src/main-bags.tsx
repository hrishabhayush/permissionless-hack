import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import BagsApp from './BagsApp.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BagsApp />
  </StrictMode>,
) 