import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import ShoesBagsApp from './ShoesBagsApp.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ShoesBagsApp />
  </StrictMode>,
) 