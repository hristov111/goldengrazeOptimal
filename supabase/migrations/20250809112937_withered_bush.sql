/*
  # E-commerce Orders System

  1. New Tables
    - `orders` - Main order records with status, totals, shipping info
    - `order_items` - Individual items within each order
    - `order_events` - Timeline events for order status changes
  
  2. Security
    - Enable RLS on all tables
    - Users can only read their own orders and related data
    - Optional: Allow users to cancel pending/processing orders
  
  3. Features
    - Order status tracking (pending → paid → shipped → delivered)
    - Shipping information and tracking
    - Event timeline for order history
    - Support for multiple currencies
*/

-- ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_number text NOT NULL UNIQUE,
  status text NOT NULL CHECK (status IN (
    'pending','processing','paid','packed','shipped',
    'out_for_delivery','delivered','canceled','refunded'
  )),
  currency text NOT NULL DEFAULT 'USD',
  subtotal_cents int NOT NULL DEFAULT 0,
  shipping_cents int NOT NULL DEFAULT 0,
  tax_cents int NOT NULL DEFAULT 0,
  total_cents int NOT NULL DEFAULT 0,
  placed_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  shipping_name text,
  shipping_phone text,
  shipping_address1 text,
  shipping_address2 text,
  shipping_city text,
  shipping_state text,
  shipping_postal text,
  shipping_country text,
  carrier text,
  tracking_number text,
  tracking_url text,
  estimated_delivery date,
  metadata jsonb
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_number ON public.orders(order_number);

-- ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id text,
  sku text,
  product_name text NOT NULL,
  image_url text,
  quantity int NOT NULL CHECK (quantity > 0),
  unit_price_cents int NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD'
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);

-- ORDER EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.order_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN (
    'created','paid','packed','shipped','out_for_delivery','delivered','canceled','refunded','note'
  )),
  message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_events_order_id ON public.order_events(order_id);

-- ENABLE RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_events ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES
CREATE POLICY "Read own orders"
ON public.orders FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Read items of own orders"
ON public.order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid())
);

CREATE POLICY "Read events of own orders"
ON public.order_events FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid())
);

-- Optional: allow self-cancel while not shipped
CREATE POLICY "Customer cancel pending/processing"
ON public.orders FOR UPDATE
USING (auth.uid() = user_id AND status IN ('pending','processing'))
WITH CHECK (status = 'canceled');

-- UPDATED_AT TRIGGER
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN 
  NEW.updated_at = now(); 
  RETURN NEW; 
END $$;

DROP TRIGGER IF EXISTS orders_touch_updated_at ON public.orders;
CREATE TRIGGER orders_touch_updated_at 
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();