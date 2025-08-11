import "dotenv/config";
import express from "express";
import crypto from "crypto";
import { clientInfo, buildEventPayload, sendToTikTok } from "./tiktok.js";

const app = express();

// Middleware
app.use(express.json({ limit: "1mb" }));

// Enable trust proxy for accurate IP detection
app.set('trust proxy', true);

// CORS for development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Health check
app.get("/api/tiktok/health", (_req, res) => {
  res.json({ 
    ok: true, 
    timestamp: new Date().toISOString(),
    config: {
      hasToken: !!process.env.TIKTOK_ACCESS_TOKEN,
      endpoint: process.env.TIKTOK_API_ENDPOINT,
      mode: process.env.TIKTOK_PAYLOAD_MODE || "default"
    }
  });
});

function ensure(val, name) {
  if (val === undefined || val === null || val === "") {
    const err = new Error(`Missing required field: ${name}`);
    err.status = 400;
    throw err;
  }
}

async function handleEvent(req, res, event) {
  try {
    console.log(`🎯 Processing ${event} event:`, req.body);
    
    const b = req.body || {};
    const ctx = clientInfo(req, b);
    const event_id = b.event_id || crypto.randomUUID();
    const url = b.url || req.get("referer") || process.env.APP_BASE_URL || "https://mygoldengraze.com";

    // Common validation for value events (skip for CompleteRegistration)
    if (event !== "CompleteRegistration") {
      ensure(b.value, "value");
      ensure(b.currency, "currency");
      ensure(b.content_id, "content_id");
      ensure(b.content_type, "content_type");
      ensure(b.content_name, "content_name");
    }

    // Validate numeric value if provided
    if (b.value !== undefined && (isNaN(parseFloat(b.value)) || parseFloat(b.value) < 0)) {
      const err = new Error("Value must be a valid positive number");
      err.status = 400;
      throw err;
    }

    const payload = buildEventPayload(
      {
        event,
        event_id,
        url,
        value: b.value ? parseFloat(b.value) : undefined,
        currency: b.currency,
        content_id: b.content_id,
        content_type: b.content_type,
        content_name: b.content_name
      },
      { 
        email: b.email, 
        phone: b.phone, 
        external_id: b.external_id 
      },
      ctx
    );

    const tiktokRes = await sendToTikTok(payload);
    
    console.log(`✅ ${event} event sent successfully`);
    res.json({ 
      ok: true, 
      event, 
      event_id, 
      timestamp: new Date().toISOString(),
      tiktok: tiktokRes 
    });
    
  } catch (e) {
    const status = e.status || 500;
    console.error(`❌ ${event} event failed:`, e.message);
    res.status(status).json({ 
      ok: false, 
      error: e.message || "Unknown error",
      event,
      timestamp: new Date().toISOString()
    });
  }
}

// TikTok event endpoints
app.post("/api/tiktok/complete_registration", (req, res) =>
  handleEvent(req, res, "CompleteRegistration")
);

app.post("/api/tiktok/place_order", (req, res) =>
  handleEvent(req, res, "PlaceAnOrder")
);

app.post("/api/tiktok/add_to_cart", (req, res) =>
  handleEvent(req, res, "AddToCart")
);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('💥 Unhandled error:', err);
  res.status(500).json({ 
    ok: false, 
    error: 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    ok: false, 
    error: 'Endpoint not found',
    available: [
      'GET /api/tiktok/health',
      'POST /api/tiktok/complete_registration',
      'POST /api/tiktok/place_order',
      'POST /api/tiktok/add_to_cart'
    ]
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`🚀 TikTok S2S API listening on port ${port}`);
  console.log(`📊 Health check: http://localhost:${port}/api/tiktok/health`);
  console.log(`🔧 Payload mode: ${process.env.TIKTOK_PAYLOAD_MODE || "default"}`);
});