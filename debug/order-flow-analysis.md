# Order Placement Flow - File Analysis

## 1. Frontend Entry Point: CheckoutForm.tsx

**Location**: `src/components/CheckoutForm.tsx`
**Function**: `placeOrder()` (line ~169)

```typescript
async function placeOrder() {
  if (!validateForm()) {
    return;
  }
  
  setLoading(true); 
  setError(null); 
  setResult(null);
  
  try {
    const token = (await supabase.auth.getSession()).data.session?.access_token;
    const userId = (await supabase.auth.getSession()).data.session?.user?.id || null;
    
    const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/place-order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json", 
        ...(token && { "Authorization": `Bearer ${token}` })
      },
      body: JSON.stringify({
        userId,
        quantity,
        shipping,
        notes,
        source: "site_checkout"
      })
    });
    
    // Error handling logic...
  } catch (e: any) {
    setError(e.message || String(e));
  } finally {
    setLoading(false);
  }
}
```

## 2. Supabase Client Configuration

**Location**: `src/lib/supabase.ts`
**Purpose**: Handles Supabase client initialization and auth

```typescript
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Creates the Supabase client used for auth.getSession()
```

## 3. Edge Function Handler

**Location**: `supabase/functions/place-order/index.ts`
**Purpose**: Main order processing logic

```typescript
Deno.serve(async (req: Request) => {
  // CORS preflight handling
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    // 1. Parse request body
    let body;
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // 2. Extract user ID from auth or body
    const authHeader = req.headers.get("Authorization");
    let userId = body?.userId || null;
    
    if (!userId && authHeader?.startsWith("Bearer ")) {
      // Auth token validation...
    }

    // 3. Initialize Supabase client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // 4. Fetch active product from database
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, name, price, image_url')
      .eq('is_active', true)
      .limit(1)
      .single();

    // 5. Validate shipping data
    const s = body?.shipping ?? {};
    const missing = ["name","phone","address1","city","state","postal","country"]
      .filter((k) => !s[k]);

    // 6. Calculate totals
    const qty = Math.max(1, Number(body?.quantity ?? 1));
    const subtotal = Math.round(product.price * 100) * qty;
    const shipping = 599;
    const tax = Math.round(subtotal * 0.07);
    const total = subtotal + shipping + tax;

    // 7. Create order (try RPC first, fallback to manual)
    const { data: rpcData, error: rpcError } = await supabase.rpc("create_order_with_items", {
      // RPC parameters...
    });

    // 8. Return success response
    return new Response(JSON.stringify({
      ok: true,
      order: rpcData,
      totals: { /* calculated totals */ }
    }), { 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });

  } catch (e: any) {
    // Error handling...
  }
});
```

## 4. Database Tables Involved

### Products Table
- **ID**: `36560b30-1659-4bc8-8274-ad2084aec8b4` (your active product)
- **Fields**: `id`, `name`, `price`, `image_url`, `is_active`

### Orders Table
- **Purpose**: Stores order header information
- **Key Fields**: `user_id`, `order_number`, `status`, `total_cents`, shipping address fields

### Order Items Table
- **Purpose**: Stores individual line items for each order
- **Key Fields**: `order_id`, `product_id`, `quantity`, `unit_price_cents`

## 5. Environment Variables Required

```
VITE_SUPABASE_URL=https://yhfezbnnjjpyqrmhdcez.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_URL=https://yhfezbnnjjpyqrmhdcez.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 6. Expected Flow Sequence

1. **User clicks "PLACE ORDER"** → `placeOrder()` function called
2. **Form validation** → `validateForm()` checks required fields
3. **Auth session retrieval** → Gets user token and ID from Supabase
4. **HTTP request** → POST to Edge Function with order data
5. **Edge Function processing** → Validates, fetches product, calculates totals
6. **Database operations** → Creates order and order items
7. **Success response** → Returns order details to frontend
8. **UI update** → Shows success page with order confirmation

## Current Issue Analysis

The "Failed to fetch" error suggests either:
- CORS preflight is failing (should be fixed now)
- Network connectivity issue
- Edge Function deployment issue
- Missing environment variables in Supabase

Check your Supabase Edge Function logs to see the actual error occurring on the backend.