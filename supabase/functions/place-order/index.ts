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
    // Parse request body
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON in request body" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Get user ID from auth header or body
    const authHeader = req.headers.get("Authorization");
    userId = body?.userId || null;
    
    if (!userId && authHeader?.startsWith("Bearer ")) {
      try {
        const supabaseAuth = createClient(
          Deno.env.get("SUPABASE_URL")!,
          Deno.env.get("SUPABASE_ANON_KEY")!
        );
        
        const { data: { user } } = await supabaseAuth.auth.getUser(authHeader.substring(7));
        userId = user?.id || null;
      } catch {
        // If token is invalid, continue with null userId (guest checkout)
      }
    }

    // Initialize Supabase client
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
      return new Response(JSON.stringify({ 
        error: "No active products available in the database",
        details: productError?.message 
      }), { 
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Validate shipping data
    const s = body?.shipping ?? {};
    const missing = ["name","phone","address1","city","state","postal","country"]
      .filter((k) => !s[k]);
    if (missing.length) {
      return new Response(JSON.stringify({ error: `Missing required fields: ${missing.join(", ")}` }), { 
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    if ((s.country || "").toUpperCase() !== "US") {
      return new Response(JSON.stringify({ error: "Only US shipping is currently supported" }), { 
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Get the first available product from the database
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, name, price, image_url')
      .eq('is_active', true)
      .limit(1)
      .single();
    
    if (productError || !product) {
      return new Response(JSON.stringify({ 
        error: "No active products available in the database",
        details: productError?.message 
      }), { 
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

    // Totals
    const subtotal = PRODUCT.unit_price_cents * qty;
    const shipping = 599;           // flat $5.99 example
    const tax = Math.round(subtotal * 0.07); // 7% example
    const total = subtotal + shipping + tax;

    const orderNumber = makeOrderNumber();

    // Check if RPC function exists, if not create order manually
    const { data: rpcData, error: rpcError } = await supabase.rpc("create_order_with_items", {
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

    if (rpcError) {
      // If RPC doesn't exist, create order manually
      if (rpcError.message?.includes('function') && rpcError.message?.includes('does not exist')) {
        // Create order manually
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .insert({
            user_id: userId,
            order_number: orderNumber,
            status: 'pending',
            currency: PRODUCT.currency,
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
          return new Response(JSON.stringify({ 
            error: "Failed to create order",
            details: orderError.message 
          }), { 
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }
        
        // Create order items
        const { error: itemsError } = await supabase
          .from('order_items')
          .insert({
            order_id: orderData.id,
            product_id: PRODUCT.product_id,
            sku: PRODUCT.sku,
            product_name: PRODUCT.product_name,
            quantity: qty,
            unit_price_cents: PRODUCT.unit_price_cents,
            image_url: PRODUCT.image_url,
            currency: PRODUCT.currency
          });
        
        if (itemsError) {
          return new Response(JSON.stringify({ 
            error: "Failed to create order items",
            details: itemsError.message 
          }), { 
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }
        
        // Use orderData as the result
        const data = orderData;
        
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
      } else {
        return new Response(JSON.stringify({ 
          error: "Database operation failed",
          details: rpcError.message 
        }), { 
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
    }

    return new Response(JSON.stringify({
      ok: true,
      order: rpcData,
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
    return new Response(JSON.stringify({ 
      error: "Internal server error",
      details: String(e?.message ?? e) 
    }), { 
      status: 500,
      headers: { 
        ...corsHeaders,
        "Content-Type": "application/json" 
      }
    });
  }
});