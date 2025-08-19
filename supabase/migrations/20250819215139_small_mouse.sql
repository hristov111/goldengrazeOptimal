/*
  # Complete Product System with Images and Admin

  1. New Tables
    - Update products table with slug and price_cents
    - Ensure product_images table exists with proper structure
    - Add isAdmin column to profiles

  2. Security
    - Enable RLS on products table
    - Add policies for public read and admin management
    - Ensure product_images are publicly readable

  3. Sample Data
    - Seed products with realistic slugs and data
    - Add sample product images
*/

-- Update products table structure
DO $$
BEGIN
  -- Add slug column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'slug'
  ) THEN
    ALTER TABLE products ADD COLUMN slug text;
  END IF;
END $$;

-- Make slug unique and not null
UPDATE products SET slug = 'whipped-tallow-balm-' || LOWER(REPLACE(name, ' ', '-')) WHERE slug IS NULL;
ALTER TABLE products ALTER COLUMN slug SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'products' AND constraint_name = 'products_slug_key'
  ) THEN
    ALTER TABLE products ADD CONSTRAINT products_slug_key UNIQUE (slug);
  END IF;
END $$;

-- Ensure price_cents exists and is properly set
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'price_cents'
  ) THEN
    ALTER TABLE products ADD COLUMN price_cents integer;
  END IF;
END $$;

-- Update price_cents from existing price column
UPDATE products SET price_cents = ROUND(price * 100) WHERE price_cents IS NULL AND price IS NOT NULL;
UPDATE products SET price_cents = 4800 WHERE price_cents IS NULL; -- Default $48.00

-- Add constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE table_name = 'products' AND constraint_name = 'products_price_cents_check'
  ) THEN
    ALTER TABLE products ADD CONSTRAINT products_price_cents_check CHECK (price_cents >= 0);
  END IF;
END $$;

-- Add indexes
CREATE INDEX IF NOT EXISTS products_slug_idx ON products (slug);
CREATE INDEX IF NOT EXISTS products_active_idx ON products (is_active);

-- Ensure isAdmin column exists in profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'isadmin'
  ) THEN
    ALTER TABLE profiles ADD COLUMN isAdmin boolean NOT NULL DEFAULT false;
  END IF;
END $$;

-- Enable RLS on products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "public read active products" ON products;
DROP POLICY IF EXISTS "admin manage products" ON products;

-- Create new policies
CREATE POLICY "public read active products"
  ON products FOR SELECT
  USING (is_active = true);

CREATE POLICY "admin manage products"
  ON products FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.isadmin = true
    )
  );

-- Ensure product_images table has proper RLS
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "product_images public read" ON product_images;

-- Allow public read of product images
CREATE POLICY "product_images public read"
  ON product_images FOR SELECT
  USING (true);

-- Update existing products with proper slugs and data
UPDATE products SET 
  slug = 'whipped-tallow-balm-4oz',
  short_description = 'Luxuriously whipped tallow balm that melts into your skin, providing deep nourishment with ancestral wisdom.',
  description = '<p>Our signature whipped tallow balm combines grass-fed beef tallow with organic botanicals to create a luxurious skincare experience. Rich in fat-soluble vitamins A, D, E, and K, this balm deeply nourishes and restores your skin''s natural barrier.</p><p>Hand-whipped in small batches using traditional methods, each jar contains the pure essence of ancestral skincare wisdom. The light, airy texture absorbs quickly without leaving a greasy residue.</p>',
  category = 'balm',
  price_cents = 4800,
  images = '["https://images.pexels.com/photos/4041392/pexels-photo-4041392.jpeg"]'::jsonb
WHERE name LIKE '%Golden Graze%' OR name LIKE '%Tallow%';

-- Insert sample products if none exist
INSERT INTO products (name, slug, price_cents, short_description, description, category, images, is_active)
SELECT 
  'Golden Graze Whipped Tallow Balm',
  'whipped-tallow-balm-4oz',
  4800,
  'Luxuriously whipped tallow balm that melts into your skin, providing deep nourishment with ancestral wisdom.',
  '<p>Our signature whipped tallow balm combines grass-fed beef tallow with organic botanicals to create a luxurious skincare experience. Rich in fat-soluble vitamins A, D, E, and K, this balm deeply nourishes and restores your skin''s natural barrier.</p><p>Hand-whipped in small batches using traditional methods, each jar contains the pure essence of ancestral skincare wisdom. The light, airy texture absorbs quickly without leaving a greasy residue.</p>',
  'balm',
  '["https://images.pexels.com/photos/4041392/pexels-photo-4041392.jpeg", "https://images.pexels.com/photos/4041387/pexels-photo-4041387.jpeg"]'::jsonb,
  true
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'whipped-tallow-balm-4oz');

INSERT INTO products (name, slug, price_cents, short_description, description, category, images, is_active)
SELECT 
  'Golden Graze Lavender Dreams',
  'lavender-dreams-tallow-balm',
  5200,
  'Calming lavender-infused tallow balm for evening rituals and peaceful skin restoration.',
  '<p>Infused with organic lavender essential oil, this tallow balm creates a serene bedtime ritual while deeply nourishing your skin. The calming scent promotes relaxation while the nutrient-rich tallow works overnight to restore and rejuvenate.</p><p>Perfect for evening skincare routines, this balm helps you unwind while giving your skin the ancestral nourishment it craves.</p>',
  'balm',
  '["https://images.pexels.com/photos/4041391/pexels-photo-4041391.jpeg", "https://images.pexels.com/photos/4041388/pexels-photo-4041388.jpeg"]'::jsonb,
  true
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'lavender-dreams-tallow-balm');

INSERT INTO products (name, slug, price_cents, short_description, description, category, images, is_active)
SELECT 
  'Golden Graze Citrus Awakening',
  'citrus-awakening-tallow-balm',
  5200,
  'Energizing citrus-scented tallow balm to brighten your morning skincare ritual.',
  '<p>Start your day with this invigorating citrus-infused tallow balm. Organic orange and lemon essential oils awaken your senses while grass-fed tallow provides deep, lasting moisture.</p><p>The uplifting scent energizes your morning routine while delivering the same ancestral nourishment your skin needs to face the day with confidence.</p>',
  'balm',
  '["https://images.pexels.com/photos/4041389/pexels-photo-4041389.jpeg", "https://images.pexels.com/photos/4041390/pexels-photo-4041390.jpeg"]'::jsonb,
  true
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'citrus-awakening-tallow-balm');

-- Add sample product images for the first product
DO $$
DECLARE
  product_uuid uuid;
BEGIN
  -- Get the first product ID
  SELECT id INTO product_uuid FROM products WHERE slug = 'whipped-tallow-balm-4oz' LIMIT 1;
  
  IF product_uuid IS NOT NULL THEN
    -- Insert sample images if they don't exist
    INSERT INTO product_images (product_id, public_url, alt, sort_order, is_primary)
    SELECT 
      product_uuid,
      'https://images.pexels.com/photos/4041392/pexels-photo-4041392.jpeg',
      'Golden Graze Whipped Tallow Balm - Main View',
      0,
      true
    WHERE NOT EXISTS (
      SELECT 1 FROM product_images 
      WHERE product_id = product_uuid AND sort_order = 0
    );

    INSERT INTO product_images (product_id, public_url, alt, sort_order, is_primary)
    SELECT 
      product_uuid,
      'https://images.pexels.com/photos/4041387/pexels-photo-4041387.jpeg',
      'Golden Graze Whipped Tallow Balm - Texture View',
      1,
      false
    WHERE NOT EXISTS (
      SELECT 1 FROM product_images 
      WHERE product_id = product_uuid AND sort_order = 1
    );

    INSERT INTO product_images (product_id, public_url, alt, sort_order, is_primary)
    SELECT 
      product_uuid,
      'https://images.pexels.com/photos/4041388/pexels-photo-4041388.jpeg',
      'Golden Graze Whipped Tallow Balm - Lifestyle',
      2,
      false
    WHERE NOT EXISTS (
      SELECT 1 FROM product_images 
      WHERE product_id = product_uuid AND sort_order = 2
    );
  END IF;
END $$;