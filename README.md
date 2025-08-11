# TikTok Server-Side Events for Netlify

This repository provides Netlify Functions for sending TikTok server-side events to the TikTok Events API.

## Features

- **Three main endpoints**: CompleteRegistration, PlaceAnOrder, AddToCart
- **PII hashing**: SHA-256 hashing of email, phone, and external_id before sending
- **Flexible payload structure**: Support for both default and nested payload modes
- **Automatic client context**: Extracts IP, User-Agent, ttclid, and ttp from requests
- **CORS support**: Configurable CORS headers for cross-origin requests

## Setup

1. **Deploy to Netlify**:
   - Push this repository to GitHub
   - Connect to Netlify and deploy
   - Set environment variables in Site settings → Environment variables

2. **Environment Variables**:
   ```
      -------
   ```

3. **Local Development**:
   ```bash
   npm install -g netlify-cli
   cp .env.example .env
   # Fill in your TikTok access token
   netlify dev
   ```

## API Endpoints

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

## Testing with cURL

```bash
# Complete Registration
curl -X POST "https://your-site.netlify.app/api/tiktok/complete_registration" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "phone": "+1 555 222 1111",
    "external_id": "user_123",
    "url": "https://mygoldengraze.com/signup-success"
  }'

# Add to Cart
curl -X POST "https://your-site.netlify.app/api/tiktok/add_to_cart" \
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
curl -X POST "https://your-site.netlify.app/api/tiktok/place_order" \
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

## Security Features

- **PII Protection**: All email, phone, and external_id values are SHA-256 hashed before sending
- **Environment Variables**: Sensitive tokens are stored securely in environment variables
- **Input Validation**: Required fields are validated before processing
- **Error Handling**: Clear error messages and proper HTTP status codes

## Payload Modes

The system supports two payload structures via `TIKTOK_PAYLOAD_MODE`:

- **default**: Flat structure with all fields at the root level
- **nested**: Structured with separate `properties` and `user` objects

This flexibility allows easy adaptation to TikTok API changes without code modifications.