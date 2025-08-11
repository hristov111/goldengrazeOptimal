# TikTok Events API Backend

Node.js Express backend for sending TikTok server-side events through the Events API.

## Setup

1. Install dependencies:
```bash
cd server
npm install
```

2. Configure environment:
```bash
cp .env.example .env
# Edit .env and add your TIKTOK_ACCESS_TOKEN
```

3. Start the server:
```bash
npm start
# or for development with auto-reload:
npm run dev
```

## API Endpoints

### Health Check
```bash
GET /api/tiktok/health
```

### Complete Registration
```bash
POST /api/tiktok/complete_registration
```

**Body:**
```json
{
  "email": "customer@example.com",
  "phone": "+1 (555) 444-3333",
  "external_id": "user_789",
  "value": 0,
  "currency": "USD",
  "url": "https://mygoldengraze.com/signup-success",
  "ttclid": "<ttclid_if_captured>",
  "ttp": "<cookie__ttp_value>"
}
```

### Place Order
```bash
POST /api/tiktok/place_order
```

**Body:**
```json
{
  "value": 49.00,
  "currency": "USD",
  "content_id": "SKU-TALLOW-2OZ",
  "content_type": "product",
  "content_name": "Golden Graze Tallow Balm 2oz",
  "email": "buyer@example.com",
  "phone": "+1555444333",
  "external_id": "user_123",
  "url": "https://mygoldengraze.com/thank-you?order=123"
}
```

### Add to Cart
```bash
POST /api/tiktok/add_to_cart
```

**Body:**
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

## Example Requests

### Complete Registration
```bash
curl -X POST http://localhost:3000/api/tiktok/complete_registration \
  -H 'Content-Type: application/json' \
  -d '{
    "email":"customer@example.com",
    "phone":"+1 (555) 444-3333",
    "external_id":"user_789",
    "value": 0,
    "currency":"USD",
    "url":"https://mygoldengraze.com/signup-success",
    "ttclid":"<ttclid_if_you_captured_it>",
    "ttp":"<cookie__ttp_value>"
  }'
```

### Place Order
```bash
curl -X POST http://localhost:3000/api/tiktok/place_order \
  -H 'Content-Type: application/json' \
  -d '{
    "value": 49.00,
    "currency": "USD",
    "content_id": "SKU-TALLOW-2OZ",
    "content_type": "product",
    "content_name": "Golden Graze Tallow Balm 2oz",
    "email":"buyer@example.com",
    "url":"https://mygoldengraze.com/thank-you?order=123"
  }'
```

### Add to Cart
```bash
curl -X POST http://localhost:3000/api/tiktok/add_to_cart \
  -H 'Content-Type: application/json' \
  -d '{
    "value": 49.00,
    "currency": "USD",
    "content_id": "SKU-TALLOW-2OZ",
    "content_type": "product",
    "content_name": "Golden Graze Tallow Balm 2oz",
    "email":"buyer@example.com",
    "url":"https://mygoldengraze.com/products/tallow-balm-2oz"
  }'
```

## Features

- **PII Protection**: All email, phone, and external_id values are SHA-256 hashed before sending
- **Flexible Payload**: Switch between `default` and `nested` payload modes via `TIKTOK_PAYLOAD_MODE`
- **Client Context**: Automatically extracts IP, User-Agent, ttclid, and ttp from requests
- **Validation**: Proper input validation with clear error messages
- **Logging**: Comprehensive logging for debugging and monitoring
- **Error Handling**: Graceful error handling with proper HTTP status codes

## Security Notes

- Always hash PII (SHA-256) before sending to TikTok
- Keep `TIKTOK_ACCESS_TOKEN` in environment variables, never in client code
- Use unique `event_id` per event to prevent duplicates
- Send server time in seconds (`event_time`)
- Pass `ttclid` (from ad click URL) and `_ttp` cookie when available

## Environment Variables

- `TIKTOK_ACCESS_TOKEN`: Your TikTok Events API access token (required)
- `TIKTOK_API_ENDPOINT`: TikTok Events API endpoint (default: provided)
- `APP_BASE_URL`: Your website base URL for fallback (default: https://mygoldengraze.com)
- `TIKTOK_PAYLOAD_MODE`: Payload structure mode (`default` or `nested`)
- `PORT`: Server port (default: 3000)