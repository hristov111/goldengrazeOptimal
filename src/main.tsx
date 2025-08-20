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
  console.log('🔍 TikTok Pixel Code from env:', pixelCode, 'type:', typeof pixelCode, 'length:', pixelCode?.length);
  console.log('🔍 Marketing consent granted:', initialConsent.marketing);
  
  if (pixelCode && pixelCode.trim() !== '' && pixelCode !== 'your_pixel_code_here') {
    console.log('🚀 Loading TikTok Pixel...');
    loadTikTokPixel(pixelCode);
    
    // Also fire a page event after a short delay to ensure pixel is ready
    setTimeout(() => {
      if ((window as any).ttq) {
        console.log('🎯 Firing delayed page event for pixel detection');
        (window as any).ttq.page();
      }
    }, 1000);
  } else {
    console.error("❌ Invalid or missing VITE_TIKTOK_PIXEL_CODE:", pixelCode);
    console.error("Expected: 20-character pixel ID, got:", typeof pixelCode, pixelCode?.length, "characters");
    console.error("Add VITE_TIKTOK_PIXEL_CODE=YOUR_20_CHAR_PIXEL_ID to your .env file");
  }
} else {
  console.log('🚫 TikTok Pixel not loaded - marketing consent not granted');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
