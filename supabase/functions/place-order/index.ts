import { createClient } from 'npm:@supabase/supabase-js@2';

// ---- Config (server-side env; set as Supabase function secrets) ----
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || ''; // optional, for decoding user if token provided

// Build robust CORS headers (reflect Origin)
function cors(req: Request) {
  const origin = req.headers.get('Origin') || '*';
  return {
    'Access-Control-Allow-Origin': origin,
    'Vary': 'Origin',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    // supabase-js sends these headers
    'Access-Control-Allow-Headers':
      'authorization, apikey, x-client-info, content-type, idempotency-key',
    'Access-Control-Max-Age': '86400',
  };
}

function makeOrderNumber() {
  const ts = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14); // YYYYMMDDhhmmss
  const rand = Math.floor(Math.random() * 1e5).toString().padStart(5, '0');
  return `GG-${ts}-${rand}`;
}

function dollars(cents: number) {
  return (cents / 100).toFixed(2);
}

Deno.serve(async (req: Request) => {
  const headers = cors(req);

  // Preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }

  // Only POST
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  }

  // Validate env
  if (!SUPABASE_URL || !SERVICE_ROLE) {
    return new Response(JSON.stringify({
      error: 'Function misconfigured: missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY',
    }), { status: 500, headers: { ...headers, 'Content-Type': 'application/json' } });
  }

  // Parse JSON
  let body: any;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

    // Optional user resolution (guest allowed)
    let userId: string | null = body?.userId ?? null;
    const authHeader = req.headers.get('Authorization');
    if (!userId && authHeader?.startsWith('Bearer ') && ANON_KEY) {
      try {
        const authClient = createClient(SUPABASE_URL, ANON_KEY);
        const { data: { user } } = await authClient.auth.getUser(authHeader.slice(7));
        userId = user?.id ?? null;
      } catch { /* ignore: guest checkout allowed */ }
    }

    // ----- Validate shipping -----
    const s = body?.shipping ?? {};
    const clean = (v: unknown) => String(v ?? '').trim();
    s.name = clean(s.name);
    s.email = clean(s.email);
    s.phone = clean(s.phone);
    s.address1 = clean(s.address1);
    s.address2 = clean(s.address2);
    s.city = clean(s.city);
    s.state = clean(s.state).toUpperCase();
    s.postal = clean(s.postal);
    s.country = (clean(s.country) || 'US').toUpperCase();

    const missing = ['name', 'email', 'phone', 'address1', 'city', 'state', 'postal', 'country']
      .filter((k) => !s[k]);
    if (missing.length) {
      return new Response(JSON.stringify({ error: `Missing fields: ${missing.join(', ')}` }), {
        status: 400,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }
    
    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.email)) {
      return new Response(JSON.stringify({ error: 'Invalid email address format' }), {
        status: 400,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }
    
    if (!/^\d{5}(-\d{4})?$/.test(s.postal)) {
      return new Response(JSON.stringify({ error: 'Invalid US ZIP code format' }), {
        status: 400,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }
    if (s.country !== 'US') {
      return new Response(JSON.stringify({ error: 'Only US shipping is supported' }), {
        status: 400,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    // ----- Product (first active) -----
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, name, price, image_url')
      .eq('is_active', true)
      .limit(1)
      .single();

    if (productError || !product) {
      return new Response(JSON.stringify({ error: 'No active products found' }), {
        status: 400,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    const qty = Math.max(1, Number(body?.quantity ?? 1));
    const PRODUCT = {
      product_id: product.id,
      sku: 'GG-TALLOW-4OZ',
      product_name: product.name,
      unit_price_cents: Math.round(Number(product.price) * 100),
      image_url: product.image_url || '',
      currency: 'USD',
    };

    // ----- Totals -----
    const subtotal = PRODUCT.unit_price_cents * qty;
    const shippingCents = 599; // flat rate example
    const tax = Math.round(subtotal * 0.07); // 7% example
    const total = subtotal + shippingCents + tax;

    const orderNumber = makeOrderNumber();

    // ----- Manual inserts (RPC removed for simplicity) -----
    const { data: orderRow, error: orderErr } = await supabase
      .from('orders')
      .insert({
        user_id: userId, // can be null for guest orders
        order_number: orderNumber,
        status: 'pending',
        currency: PRODUCT.currency,
        subtotal_cents: subtotal,
        shipping_cents: shippingCents,
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
          source: body?.source ?? 'site_checkout', 
          notes: body?.notes ?? null,
          guest_email: userId ? null : s.email // Store email for guest orders
        },
      })
      .select()
      .single();

    if (orderErr) {
      return new Response(JSON.stringify({ 
        error: 'Failed to create order', 
        details: orderErr.message 
      }), {
        status: 500, 
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    const { error: itemsErr } = await supabase
      .from('order_items')
      .insert({
        order_id: orderRow.id,
        product_id: PRODUCT.product_id,
        sku: PRODUCT.sku,
        product_name: PRODUCT.product_name,
        quantity: qty,
        unit_price_cents: PRODUCT.unit_price_cents,
        image_url: PRODUCT.image_url,
        currency: PRODUCT.currency,
      });

    if (itemsErr) {
      return new Response(JSON.stringify({ 
        error: 'Failed to create order items', 
        details: itemsErr.message 
      }), {
        status: 500, 
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    // Create order event for traceability
    await supabase.from('order_events').insert({
      order_id: orderRow.id,
      type: 'created',
      message: userId ? 'Order created by authenticated user' : 'Order created by guest user',
    });

    return new Response(JSON.stringify({
      ok: true,
      order: orderRow,
      totals: {
        subtotal_cents: subtotal,
        shipping_cents: shippingCents,
        tax_cents: tax,
        total_cents: total,
        human: {
          subtotal: `$${dollars(subtotal)}`,
          shipping: `$${dollars(shippingCents)}`,
          tax: `$${dollars(tax)}`,
          total: `$${dollars(total)}`,
        },
      },
    }), { 
      status: 200, 
      headers: { ...headers, 'Content-Type': 'application/json' } 
    });

  } catch (e: any) {
    console.error('Edge Function error:', e);
    return new Response(JSON.stringify({ 
      error: 'Internal server error', 
      details: String(e?.message ?? e) 
    }), {
      status: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  }
});