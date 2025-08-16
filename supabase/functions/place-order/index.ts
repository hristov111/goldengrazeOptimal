import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function makeOrderNumber() {
  const n = Math.floor(Math.random() * 1e6).toString().padStart(6, "0");
  const y = new Date().getFullYear();
  return `GG-${y}-${n}`;
}

function dollars(cents: number) {
  return (cents / 100).toFixed(2);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const body = await req.json();
    const authHeader = req.headers.get("Authorization");
    let userId = null;
    
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      // For simplicity, we'll get userId from the request body if provided
      userId = body?.userId || null;
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get the first available product from the database
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, name, price, image_url')
      .eq('is_active', true)
      .limit(1)
      .single();
    
    if (productError || !product) {
      return new Response(JSON.stringify({ error: "No products available" }), { 
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const PRODUCT = {
      product_id: product.id,
      sku: "GG-TALLOW-4OZ", 
      product_name: product.name,
      unit_price_cents: Math.round(product.price * 100), // Convert to cents
      image_url: product.image_url || "https://cdn.example.com/gg-4oz.jpg",
      currency: "USD",
    };

    const qty = Math.max(1, Number(body?.quantity ?? 1));

    // Validate shipping (US)
    const s = body?.shipping ?? {};
    const missing = ["name","phone","address1","city","state","postal","country"]
      .filter((k) => !s[k]);
    if (missing.length) {
      return new Response(JSON.stringify({ error: `Missing: ${missing.join(", ")}` }), { 
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    if ((s.country || "").toUpperCase() !== "US") {
      return new Response(JSON.stringify({ error: "Only US shipping supported" }), { 
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Totals
    const subtotal = PRODUCT.unit_price_cents * qty;
    const shipping = 599;           // flat $5.99 example
    const tax = Math.round(subtotal * 0.07); // 7% example
    const total = subtotal + shipping + tax;

    const orderNumber = makeOrderNumber();

    // RPC call
    const { data, error } = await supabase.rpc("create_order_with_items", {
      p_user_id: userId,
      p_order_number: orderNumber,
      p_currency: PRODUCT.currency,
      p_subtotal_cents: subtotal,
      p_shipping_cents: shipping,
      p_tax_cents: tax,
      p_total_cents: total,
      p_shipping_name: s.name,
      p_shipping_phone: s.phone,
      p_shipping_address1: s.address1,
      p_shipping_address2: s.address2 ?? "",
      p_shipping_city: s.city,
      p_shipping_state: s.state,
      p_shipping_postal: s.postal,
      p_shipping_country: s.country,
      p_metadata: {
        source: body?.source ?? null,
        notes: body?.notes ?? null,
      },
      p_items: [{
        product_id: PRODUCT.product_id,
        sku: PRODUCT.sku,
        product_name: PRODUCT.product_name,
        quantity: qty,
        unit_price_cents: PRODUCT.unit_price_cents,
        image_url: PRODUCT.image_url,
        currency: PRODUCT.currency
      }]
    });

    if (error) throw error;

    return new Response(JSON.stringify({
      ok: true,
      order: data,
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
        "Content-Type": "application/json" 
      } 
    });

  } catch (e: any) {
    return new Response(JSON.stringify({ error: String(e?.message ?? e) }), { 
      status: 500,
      headers: { 
        ...corsHeaders,
        "Content-Type": "application/json" 
      }
    });
  }
});