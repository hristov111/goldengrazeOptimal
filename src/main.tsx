import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { loadTikTokPixel, setConsent } from "./lib/tiktok";

// Initialize consent from localStorage
const saved = localStorage.getItem("consent");
const initialConsent = saved ? JSON.parse(saved) : { marketing: false };
setConsent(initialConsent);

// Load TikTok pixel only if consent is already granted
if (initialConsent.marketing) {
  const PIXEL_CODE = import.meta.env.VITE_TIKTOK_PIXEL_CODE as string;
  if (PIXEL_CODE) {
    loadTikTokPixel(PIXEL_CODE);
  } else {
    if (import.meta.env.DEV) {
      console.warn("VITE_TIKTOK_PIXEL_CODE not configured - TikTok tracking disabled");
    }
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
