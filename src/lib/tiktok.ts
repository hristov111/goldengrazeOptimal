/* global window */
import { v4 as uuidv4 } from "uuid";

// Minimal SHA-256 hashing (Web Crypto)
export async function sha256(input: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(input.trim().toLowerCase());
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

type ConsentState = { marketing: boolean };
let consentState: ConsentState = { marketing: false };
export function setConsent(next: ConsentState) { 
  consentState = next; 
  
  // Load pixel when consent is granted
  if (next.marketing && !pixelLoaded) {
    const pixelCode = import.meta.env.VITE_TIKTOK_PIXEL_CODE as string;
    if (pixelCode) {
      loadTikTokPixel(pixelCode);
    }
  }
}
export function getConsent(): ConsentState { return consentState; }

// Load TikTok pixel script once
let pixelLoaded = false;
let pixelReady = false;
let eventQueue: Array<() => void> = [];

export function loadTikTokPixel(pixelId: string) {
  if (pixelLoaded || typeof window === "undefined") return;
  
  // Validate pixel ID before loading
  if (!pixelId || pixelId.trim() === '' || pixelId === 'your_pixel_code_here') {
    console.error('❌ Invalid TikTok Pixel ID provided:', pixelId);
    return;
  }
  
  console.log('🎯 Loading TikTok Pixel with ID:', pixelId);
  
  (function (w: any, d: Document, t: string, k: string, s: string) {
    w.TiktokAnalyticsObject = k;
    const ttq = (w[k] = w[k] || []);
    ttq.methods = ["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"];
    ttq.setAndDefer = function (t: any, e: any) { t[e] = function () { t.push([e].concat(Array.prototype.slice.call(arguments, 0))); }; };
    for (let i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i]);
    ttq.instance = function (t: any) {
      const e: any = ttq._i || {};
      e[t] = e[t] || [];
      ttq.setAndDefer(e[t], "track"); ttq.setAndDefer(e[t], "identify"); ttq.setAndDefer(e[t], "debug");
      ttq.setAndDefer(e[t], "page"); ttq.setAndDefer(e[t], "on"); ttq.setAndDefer(e[t], "off"); ttq.setAndDefer(e[t], "once"); ttq.setAndDefer(e[t], "ready");
      ttq.setAndDefer(e[t], "alias"); ttq.setAndDefer(e[t], "group"); ttq.setAndDefer(e[t], "enableCookie"); ttq.setAndDefer(e[t], "disableCookie");
      return e[t];
    };
    ttq.load = function (e: string, n?: any) {
      const i = "https://analytics.tiktok.com/i18n/pixel/events.js";
      ttq._i = ttq._i || {};
      ttq._i[e] = [];
      ttq._i[e]._u = i;
      ttq._t = ttq._t || {};
      ttq._t[e] = +new Date();
      ttq._o = ttq._o || {};
      ttq._o[e] = n || {};
      const o = d.createElement(t); o.type = "text/javascript"; o.async = true; o.src = i;
      const a = d.getElementsByTagName(t)[0]; a?.parentNode?.insertBefore(o, a);
    };
    w.ttq = ttq;
  })(window, document, "script", "ttq", "");

  // Initialize the pixel with the validated ID and enable cookies
  console.log('🔧 Calling ttq.load() with pixel ID:', pixelId);
  (window as any).ttq.load(pixelId, {
    debug: import.meta.env.DEV // Enable debug mode in development
  });
  (window as any).ttq.enableCookie();
  
  console.log('🎯 TikTok Pixel loaded with ID:', pixelId);
  
  // Set up ready callback to process queued events and fire page event
  (window as any).ttq.ready(() => {
    console.log('🎯 TikTok Pixel ready with ID:', pixelId, '- firing page event and processing', eventQueue.length, 'queued events');
    
    // Fire the page event - this is crucial for pixel detection
    (window as any).ttq.page();
    
    pixelReady = true;
    // Process all queued events
    eventQueue.forEach(fn => fn());
    eventQueue = [];
  });
  
  pixelLoaded = true;
}

type ContentItem = {
  content_id: string;
  content_type: "product" | "product_group";
  content_name?: string;
};

type CommonPayload = {
  contents: ContentItem[];
  value?: number;
  currency?: string; // e.g., "USD"
};

type EventOptions = { event_id?: string };

function executeOrQueue(fn: () => void) {
  if (pixelReady && (window as any).ttq) {
    fn();
  } else {
    eventQueue.push(fn);
  }
}

export async function identifyPII(pii: {
  email?: string;
  phone_number?: string;
  external_id?: string;
}) {
  if (!getConsent().marketing) return;
  
  executeOrQueue(async () => {
    const payload: any = {};
    if (pii.email) payload.email = await sha256(pii.email);
    if (pii.phone_number) payload.phone_number = await sha256(pii.phone_number);
    if (pii.external_id) payload.external_id = await sha256(pii.external_id);
    (window as any).ttq.identify(payload);
  });
}

function withEventId(opts?: EventOptions) {
  return { event_id: opts?.event_id ?? uuidv4() };
}

// Generic tracker
export function trackEvent<T extends CommonPayload>(
  name:
    | "ViewContent" | "AddToWishlist" | "Search" | "AddPaymentInfo"
    | "AddToCart" | "InitiateCheckout" | "PlaceAnOrder"
    | "CompleteRegistration" | "Purchase",
  payload: T,
  opts?: EventOptions
) {
  if (!getConsent().marketing) return;
  
  executeOrQueue(() => {
    const enriched = { ...payload, currency: payload.currency ?? "USD" };
    (window as any).ttq.track(name, enriched, withEventId(opts));
  });
}

// Specific helpers (strongly typed wrappers)
export const TTQ = {
  viewContent: (payload: CommonPayload, opts?: EventOptions) =>
    trackEvent("ViewContent", payload, opts),

  addToWishlist: (payload: CommonPayload, opts?: EventOptions) =>
    trackEvent("AddToWishlist", payload, opts),

  search: (payload: CommonPayload & { search_string: string }, opts?: EventOptions) =>
    trackEvent("Search", payload as any, opts),

  addPaymentInfo: (payload: CommonPayload, opts?: EventOptions) =>
    trackEvent("AddPaymentInfo", payload, opts),

  addToCart: (payload: CommonPayload, opts?: EventOptions) =>
    trackEvent("AddToCart", payload, opts),

  initiateCheckout: (payload: CommonPayload, opts?: EventOptions) =>
    trackEvent("InitiateCheckout", payload, opts),

  placeAnOrder: (payload: CommonPayload, opts?: EventOptions) =>
    trackEvent("PlaceAnOrder", payload, opts),

  completeRegistration: (payload: CommonPayload, opts?: EventOptions) =>
    trackEvent("CompleteRegistration", payload, opts),

  purchase: (payload: CommonPayload, opts?: EventOptions) =>
    trackEvent("Purchase", payload, opts),
};