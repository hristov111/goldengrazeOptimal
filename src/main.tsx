import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { loadTikTokPixel, setConsent } from "./lib/tiktok";

// Debug environment variables
console.log('🔍 All VITE env vars:', Object.keys(import.meta.env).filter(key => key.startsWith('VITE_')));
console.log('🔍 Raw env object:', import.meta.env);

// Initialize consent from localStorage
const saved = localStorage.getItem("consent");
const initialConsent = saved ? JSON.parse(saved) : { marketing: false };
setConsent(initialConsent);

// Load TikTok pixel only if consent is already granted
if (initialConsent.marketing) {
  const pixelCode = import.meta.env.VITE_TIKTOK_PIXEL_CODE as string;
  console.log('🔍 TikTok Pixel Code from env:', pixelCode, typeof pixelCode);
  console.log('🔍 Marketing consent granted:', initialConsent.marketing);
  
  if (pixelCode && pixelCode !== 'your_pixel_code_here') {
    console.log('🚀 Loading TikTok Pixel...');
    loadTikTokPixel(pixelCode);
  } else {
    if (import.meta.env.DEV) {
      console.warn("⚠️ VITE_TIKTOK_PIXEL_CODE not configured - TikTok tracking disabled");
      console.warn("Add VITE_TIKTOK_PIXEL_CODE=YOUR_PIXEL_ID to your .env file");
    }
  }
} else {
  console.log('🚫 TikTok Pixel not loaded - marketing consent not granted');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
