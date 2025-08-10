/*
  # Create Cart and Wishlist System

  1. New Tables
    - `cart_items`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `product_id` (uuid, foreign key to products)
      - `quantity` (integer, must be > 0)
      - `added_at` (timestamp)
      - Unique constraint on (user_id, product_id)
    
    - `wishlist_items`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `product_id` (uuid, foreign key to products)
      - `added_at` (timestamp)
      - Unique constraint on (user_id, product_id)

  2. Security
    - Enable RLS on both tables
    - Users can only read/modify their own items
    - Proper indexes for performance

  3. Constraints
    - Cart quantity must be positive
    - Unique product per user in both cart and wishlist
*/

-- CART ITEMS
CREATE TABLE IF NOT EXISTS public.cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity integer NOT NULL CHECK (quantity > 0),
  added_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_id)
);

-- WISHLIST ITEMS
CREATE TABLE IF NOT EXISTS public.wishlist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  added_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_cart_user ON public.cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_product ON public.cart_items(product_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_user ON public.wishlist_items(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_product ON public.wishlist_items(product_id);

-- Enable RLS
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;

-- Cart policies
CREATE POLICY "cart: read own" ON public.cart_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "cart: insert own" ON public.cart_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "cart: update own" ON public.cart_items
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "cart: delete own" ON public.cart_items
  FOR DELETE USING (auth.uid() = user_id);

-- Wishlist policies
CREATE POLICY "wishlist: read own" ON public.wishlist_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "wishlist: insert own" ON public.wishlist_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "wishlist: delete own" ON public.wishlist_items
  FOR DELETE USING (auth.uid() = user_id);