/*
  # Create Order RPC and Types

  1. New Types
    - `order_item_input` composite type for order items
  
  2. New Functions
    - `create_order_with_items` - Atomic function to create order, items, and events
  
  3. Security
    - RLS policies for Edge Function access via service role
*/

-- Drop existing type if it exists
DROP TYPE IF EXISTS order_item_input CASCADE;

-- Create composite type for order items
CREATE TYPE order_item_input AS (
  product_id text,
  sku text,
  product_name text,
  quantity integer,
  unit_price_cents integer,
  image_url text,
  currency text
);

-- Atomic RPC: insert into orders, order_items, order_events
CREATE OR REPLACE FUNCTION create_order_with_items(
  p_user_id uuid,
  p_order_number text,
  p_currency text,
  p_subtotal_cents integer,
  p_shipping_cents integer,
  p_tax_cents integer,
  p_total_cents integer,
  p_shipping_name text,
  p_shipping_phone text,
  p_shipping_address1 text,
  p_shipping_address2 text,
  p_shipping_city text,
  p_shipping_state text,
  p_shipping_postal text,
  p_shipping_country text,
  p_metadata jsonb,
  p_items order_item_input[]
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order_id uuid;
  v_now timestamptz := now();
  v_item order_item_input;
BEGIN
  -- Insert order
  INSERT INTO orders (
    user_id, order_number, status, currency,
    subtotal_cents, shipping_cents, tax_cents, total_cents,
    placed_at,
    shipping_name, shipping_phone, shipping_address1, shipping_address2,
    shipping_city, shipping_state, shipping_postal, shipping_country,
    metadata
  ) VALUES (
    p_user_id, p_order_number, 'pending', p_currency,
    p_subtotal_cents, p_shipping_cents, p_tax_cents, p_total_cents,
    v_now,
    p_shipping_name, p_shipping_phone, p_shipping_address1, p_shipping_address2,
    p_shipping_city, p_shipping_state, p_shipping_postal, p_shipping_country,
    p_metadata
  )
  RETURNING id INTO v_order_id;

  -- Insert items
  FOREACH v_item IN ARRAY p_items LOOP
    INSERT INTO order_items (
      order_id, product_id, sku, product_name, quantity, unit_price_cents, image_url, currency
    ) VALUES (
      v_order_id, v_item.product_id, v_item.sku, v_item.product_name, v_item.quantity,
      v_item.unit_price_cents, v_item.image_url, v_item.currency
    );
  END LOOP;

  -- Initial event
  INSERT INTO order_events (order_id, type, message, created_at)
  VALUES (v_order_id, 'created', 'Order created and pending', v_now);

  RETURN jsonb_build_object('order_id', v_order_id, 'order_number', p_order_number, 'status', 'pending');
END;
$$;

-- Grant execute permission to service role for Edge Functions
GRANT EXECUTE ON FUNCTION create_order_with_items TO service_role;