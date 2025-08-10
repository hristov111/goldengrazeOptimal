/*
  # Create products table for Golden Graze

  1. New Tables
    - `products`
      - `id` (uuid, primary key)
      - `name` (text) - Product name
      - `description` (text) - Product description
      - `price` (decimal) - Product price
      - `category` (text) - Product category (balm, accessory, gift-set)
      - `scent` (text) - Scent variant (unscented, lavender, neroli)
      - `size` (text) - Product size (2oz, 4oz, etc.)
      - `stock_quantity` (integer) - Available stock
      - `image_url` (text) - Product image URL
      - `is_active` (boolean) - Whether product is available for sale
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `products` table
    - Add policy for public read access (products are publicly viewable)
    - Add policy for authenticated admin users to manage products
*/

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price decimal(10,2) NOT NULL,
  category text NOT NULL DEFAULT 'balm',
  scent text DEFAULT 'unscented',
  size text DEFAULT '2oz',
  stock_quantity integer DEFAULT 0,
  image_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Policy for public read access (anyone can view products)
CREATE POLICY "Products are publicly readable"
  ON products
  FOR SELECT
  TO public
  USING (is_active = true);

-- Policy for authenticated users to read all products (including inactive)
CREATE POLICY "Authenticated users can read all products"
  ON products
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy for authenticated users to insert/update/delete products (admin functionality)
CREATE POLICY "Authenticated users can manage products"
  ON products
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample products
INSERT INTO products (name, description, price, category, scent, size, stock_quantity, image_url) VALUES
  ('Whipped Tallow Balm - Unscented', 'Pure tallow essence with no added fragrances. Rich in fat-soluble vitamins A, D, E, and K.', 48.00, 'balm', 'unscented', '2oz', 50, '/product-unscented.jpg'),
  ('Whipped Tallow Balm - Lavender', 'Calming Bulgarian lavender for evening rituals. Perfect for relaxation and skin restoration.', 52.00, 'balm', 'lavender', '2oz', 35, '/product-lavender.jpg'),
  ('Whipped Tallow Balm - Neroli', 'Uplifting orange blossom for morning renewal. Energizing and brightening for daily use.', 52.00, 'balm', 'neroli', '2oz', 40, '/product-neroli.jpg'),
  ('Wooden Application Spoon', 'Handcrafted wooden spoon for hygienic balm application. Made from sustainable bamboo.', 12.00, 'accessory', null, 'standard', 100, '/wooden-spoon.jpg'),
  ('Linen Storage Pouch', 'Organic linen pouch for storing your balm and accessories. Naturally antimicrobial.', 18.00, 'accessory', null, 'standard', 75, '/linen-pouch.jpg'),
  ('Complete Ritual Set', 'Everything you need for the perfect tallow ritual. Includes balm, spoon, and pouch.', 68.00, 'gift-set', 'unscented', 'complete', 25, '/ritual-set.jpg');