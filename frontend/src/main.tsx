import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import ShareView from './pages/ShareView.tsx'

// Simple routing based on pathname
const isShare = window.location.pathname.startsWith('/s/');
const Root = isShare ? ShareView : App;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
