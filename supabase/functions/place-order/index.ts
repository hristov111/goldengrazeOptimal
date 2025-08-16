import { createClient } from 'npm:@supabase/supabase-js@2'

// Read environment variables at boot
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

function buildCorsHeaders(req: Request) {
  const origin = req.headers.get('Origin') || '*';
  return {
    // Reflect Origin so credentialless/dev hosts work
    'Access-Control-Allow-Origin': origin,
    'Vary': 'Origin',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    // Include all headers that supabase-js sends
    'Access-Control-Allow-Headers':
      'authorization, apikey, x-client-info, content-type, idempotency-key',
    'Access-Control-Max-Age': '86400',
  };
}

function makeOrderNumber() {
  const ts = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0,14); // YYYYMMDDhhmmss
  const rand = Math.floor(Math.random() * 1e5).toString().padStart(5, '0');
  return `GG-${ts}-${rand}`;
}

function dollars(cents: number) {
  return (cents / 100).toFixed(2);
}

Deno.serve(async (req: Request) => {
  const corsHeaders = buildCorsHeaders(req);

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    // Check environment variables
    if (!SUPABASE_URL || !SERVICE_ROLE) {
      console.error("Missing environment variables:", {
        SUPABASE_URL: !!SUPABASE_URL,
        SERVICE_ROLE: !!SERVICE_ROLE
      });
      
      return new Response(JSON.stringify({ 
        error: "Edge Function configuration error",
        details: "Missing Supabase environment variables. Please check your Supabase project settings."
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

    // Get user ID from body
    const userId = body?.userId || null;

    // Get the first available product from the database
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, name, price, image_url')
      .eq('is_active', true)
      .limit(1)
      .single();
    
    if (productError || !product) {
      console.error("Product fetch error:", productError);
      return new Response(JSON.stringify({ 
        error: "No active products available",
        details: productError?.message || "Unable to find products in database"
      }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Validate and normalize shipping data
    const s = body?.shipping ?? {};
    const clean = (v: unknown) => String(v ?? '').trim();
    s.name = clean(s.name);
    s.phone = clean(s.phone);
    s.address1 = clean(s.address1);
    s.address2 = clean(s.address2);
    s.city = clean(s.city);
    s.state = clean(s.state).toUpperCase();
    s.postal = clean(s.postal);
    s.country = (clean(s.country) || 'US').toUpperCase();
    
    const missing = ["name","phone","address1","city","state","postal","country"]
      .filter((k) => !s[k]);
    if (missing.length) {
      return new Response(JSON.stringify({ error: `Missing required fields: ${missing.join(", ")}` }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Validate ZIP code format
    if (!/^\d{5}(-\d{4})?$/.test(s.postal)) {
      return new Response(JSON.stringify({ error: "Invalid US ZIP code format" }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    if (s.country !== "US") {
      return new Response(JSON.stringify({ error: "Only US shipping is currently supported" }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const qty = Math.max(1, Number(body?.quantity ?? 1));

    // Calculate totals
    const subtotal = Math.round(product.price * 100) * qty; // Convert to cents
    const shipping = 599;           // flat $5.99
    const tax = Math.round(subtotal * 0.07); // 7% tax
    const total = subtotal + shipping + tax;

    const orderNumber = makeOrderNumber();

    // Create order
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        order_number: orderNumber,
        status: 'pending',
        currency: 'USD',
        subtotal_cents: subtotal,
        shipping_cents: shipping,
        tax_cents: tax,
        total_cents: total,
        shipping_name: s.name,
        shipping_phone: s.phone,
        shipping_address1: s.address1,
        shipping_address2: s.address2 || null,
        shipping_city: s.city,
        shipping_state: s.state,
        shipping_postal: s.postal,
        shipping_country: s.country,
        metadata: {
          source: body?.source ?? null,
          notes: body?.notes ?? null,
        }
      })
      .select()
      .single();
    
    if (orderError) {
      console.error("Order creation error:", orderError);
      return new Response(JSON.stringify({ 
        error: "Failed to create order",
        details: orderError.message 
      }), { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Create order items
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert({
        order_id: orderData.id,
        product_id: product.id,
        sku: 'GG-TALLOW-4OZ',
        product_name: product.name,
        quantity: qty,
        unit_price_cents: Math.round(product.price * 100),
        image_url: product.image_url,
        currency: 'USD'
      });
    
    if (itemsError) {
      console.error("Order items creation error:", itemsError);
      return new Response(JSON.stringify({ 
        error: "Failed to create order items",
        details: itemsError.message 
      }), { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Create order event for traceability
    await supabase.from('order_events').insert({
      order_id: orderData.id,
      type: 'created',
      message: 'Order created via site_checkout'
    });
    
    return new Response(JSON.stringify({
      ok: true,
      order: orderData,
      totals: {
        subtotal_cents: subtotal,
        shipping_cents: shipping,
        tax_cents: tax,
        total_cents: total,
        human: {
          subtotal: `$${dollars(subtotal)}`,
          shipping: `$${dollars(shipping)}`,
          tax: `$${dollars(tax)}`,
          total: `$${dollars(total)}`
        }
      }
    }), { 
      headers: { 
        ...corsHeaders,
        'Content-Type': 'application/json' 
      } 
    });

  } catch (e: any) {
    console.error("Edge Function error:", e);
    return new Response(JSON.stringify({ 
      error: "Internal server error",
      details: String(e?.message ?? e) 
    }), { 
      status: 500,
      headers: { 
        ...corsHeaders,
        'Content-Type': 'application/json' 
      }
    });
  }
});