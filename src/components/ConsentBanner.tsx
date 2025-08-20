import React, { useState } from "react";
import { setConsent, getConsent } from "../lib/tiktok";

export default function ConsentBanner() {
  const [open, setOpen] = useState(!getConsent().marketing);
  
  if (!open) return null;
  
  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 bg-stone-900 text-white p-4 rounded-lg shadow-2xl border border-amber-400/20 max-w-md mx-auto">
      <div className="mb-3">
        <h3 className="font-medium text-amber-400 mb-1">Cookie Consent</h3>
        <p className="text-sm text-stone-300">
          We use cookies for marketing analytics (TikTok). Accept to help us improve your experience.
        </p>
      </div>
      
      <div className="flex space-x-3">
        <button
          className="flex-1 bg-amber-400 hover:bg-amber-500 text-black px-4 py-2 rounded-lg font-medium text-sm transition-colors"
          onClick={async () => {
            const next = { marketing: true };
            setConsent(next);
            localStorage.setItem("consent", JSON.stringify(next));
            
            // Load TikTok pixel when consent is granted
            const pixelCode = import.meta.env.TIKTOK_PIXEL_CODE as string;
            if (pixelCode && pixelCode !== 'your_pixel_code_here') {
              const { loadTikTokPixel } = await import('../lib/tiktok');
              loadTikTokPixel(pixelCode);
              console.log('🎯 TikTok Pixel loaded after consent granted');
            }
            
            setOpen(false);
          }}
        >
          Accept
        </button>
        <button
          className="flex-1 border border-stone-600 hover:bg-stone-800 px-4 py-2 rounded-lg font-medium text-sm transition-colors"
          onClick={() => {
            const next = { marketing: false };
            setConsent(next);
            localStorage.setItem("consent", JSON.stringify(next));
            setOpen(false);
          }}
        >
          Decline
        </button>
      </div>
    </div>
  );
}