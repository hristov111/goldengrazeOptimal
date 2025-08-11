# Golden Graze - TikTok Events Integration

Golden Graze skincare website with TikTok server-side event tracking via Netlify Functions.

## Features

- **React + TypeScript** frontend with Vite
- **Supabase** integration for user management and data
- **TikTok Pixel** tracking with server-side events
- **Netlify Functions** for secure API endpoints
- **Responsive design** with Tailwind CSS

## Setup

### Local Development

1. **Install dependencies**:
   ```bash
   npm ci
   ```

2. **Environment setup**:
   ```bash
   cp .env.example .env
   # Fill in your environment variables
   ```

3. **Start development**:
   ```bash
   npm run dev
   # or for Netlify Functions testing:
   netlify dev
   ```

### Build and Deploy

1. **Build locally** (sanity check):
   ```bash
   npm run build
   ls dist/index.html   # must exist
   ```

2. **Deploy to Netlify**:
   - Push to GitHub
   - Connect to Netlify
   - Set environment variables in Site settings → Environment variables
   - Deploy automatically builds and publishes `dist/`

## TikTok Events API Endpoints

### POST /api/tiktok/complete_registration

Track user registration events.

**Request Body:**
```json
{
  "email": "user@example.com",
  "phone": "+1 555 222 1111",
  "external_id": "user_123",
  "value": 0,
  "currency": "USD",
  "url": "https://mygoldengraze.com/signup-success"
}
```

### POST /api/tiktok/place_order

Track purchase/order completion events.

**Request Body:**
```json
{
  "value": 49.00,
  "currency": "USD",
  "content_id": "SKU-TALLOW-2OZ",
  "content_type": "product",
  "content_name": "Golden Graze Tallow Balm 2oz",
  "email": "buyer@example.com",
  "url": "https://mygoldengraze.com/thank-you?order=123"
}
```

### POST /api/tiktok/add_to_cart

Track add-to-cart events.

**Request Body:**
```json
{
  "value": 49.00,
  "currency": "USD",
  "content_id": "SKU-TALLOW-2OZ",
  "content_type": "product",
  "content_name": "Golden Graze Tallow Balm 2oz",
  "email": "buyer@example.com",
  "url": "https://mygoldengraze.com/products/tallow-balm-2oz"
}
```

### Testing with cURL

```bash
# Complete Registration
curl -X POST "$YOUR_SITE/api/tiktok/complete_registration" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "phone": "+1 555 222 1111",
    "external_id": "user_123",
    "url": "https://mygoldengraze.com/signup-success"
  }'

# Add to Cart
curl -X POST "$YOUR_SITE/api/tiktok/add_to_cart" \
  -H "Content-Type: application/json" \
  -d '{
    "value": 49,
    "currency": "USD",
    "content_id": "SKU-TALLOW-2OZ",
    "content_type": "product",
    "content_name": "Golden Graze Tallow Balm 2oz",
    "email": "buyer@example.com",
    "url": "https://mygoldengraze.com/products/tallow-balm-2oz"
  }'

# Place Order
curl -X POST "$YOUR_SITE/api/tiktok/place_order" \
  -H "Content-Type: application/json" \
  -d '{
    "value": 49,
    "currency": "USD",
    "content_id": "SKU-TALLOW-2OZ",
    "content_type": "product",
    "content_name": "Golden Graze Tallow Balm 2oz",
    "email": "buyer@example.com",
    "url": "https://mygoldengraze.com/thank-you?order=123"
  }'
```

## Environment Variables

Set these in Netlify Site settings → Environment variables:

```
TIKTOK_ACCESS_TOKEN=YOUR_TIKTOK_ACCESS_TOKEN
TIKTOK_PIXEL_CODE=D2D03PJC77U4ENLN9SEG
TIKTOK_ENDPOINT=https://business-api.tiktok.com/open_api/v1.3/event/track/
APP_BASE_URL=https://mygoldengraze.com
TIKTOK_TEST_EVENT_CODE=
TIKTOK_PAYLOAD_MODE=default
CORS_ALLOW_ORIGIN=https://mygoldengraze.com
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Frontend Integration

Include the provided JavaScript helper in your frontend:

```html
<script src="/js/tiktok-s2s.js"></script>
<script>
// Example usage
TT_S2S.addToCart({
  value: 49,
  currency: "USD",
  content_id: "SKU-TALLOW-2OZ",
  content_type: "product",
  content_name: "Golden Graze Tallow Balm 2oz",
  email: "buyer@example.com"
});
</script>
```

## Acceptance Criteria

✅ `npm run build` generates `dist/index.html`  
✅ Netlify deploy logs show "Publishing directory: dist"  
✅ Site root returns the React app (not Netlify 404)  
✅ API routes work under `/api/tiktok/*`  
✅ No secret values in client code or repo  

## Security Features

- **PII Protection**: All email, phone, and external_id values are SHA-256 hashed server-side
- **Environment Variables**: Sensitive tokens stored securely in Netlify environment variables
- **Input Validation**: Required fields validated before processing
- **CORS Protection**: Configurable origin restrictions

## Architecture

- **Frontend**: React + TypeScript + Vite → builds to `dist/`
- **Backend**: Netlify Functions in `/netlify/functions/`
- **Database**: Supabase for user data and products
- **Analytics**: TikTok Pixel + Server-side Events API

The system supports flexible payload structures via `TIKTOK_PAYLOAD_MODE` for easy adaptation to TikTok API changes.