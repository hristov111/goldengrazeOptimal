/*
  # Add product slugs and admin functionality

  1. Schema Changes
    - Add `slug` column to products table with unique constraint
    - Add `isAdmin` column to profiles table
    - Update products table structure for SEO-friendly URLs
    - Add proper indexes for performance

  2. Security
    - Enable RLS on products table
    - Add policy for public to read active products
    - Add policy for admin to manage all products

  3. Data Migration
    - Generate slugs for existing products
    - Set default admin status for profiles
*/

-- Add slug column to products table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'slug'
  ) THEN
    ALTER TABLE products ADD COLUMN slug text;
  END IF;
END $$;

-- Add unique constraint on slug
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'products' AND constraint_name = 'products_slug_key'
  ) THEN
    ALTER TABLE products ADD CONSTRAINT products_slug_key UNIQUE (slug);
  END IF;
END $$;

-- Update price column to price_cents if needed
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'price_cents'
  ) THEN
    ALTER TABLE products ADD COLUMN price_cents integer;
    -- Convert existing price to cents
    UPDATE products SET price_cents = ROUND(price * 100) WHERE price IS NOT NULL;
    -- Add constraint
    ALTER TABLE products ADD CONSTRAINT products_price_cents_check CHECK (price_cents >= 0);
  END IF;
END $$;

-- Add short_description column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'short_description'
  ) THEN
    ALTER TABLE products ADD COLUMN short_description text;
  END IF;
END $$;

-- Add images jsonb column if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'images'
  ) THEN
    ALTER TABLE products ADD COLUMN images jsonb NOT NULL DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- Add isAdmin column to profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'isAdmin'
  ) THEN
    ALTER TABLE profiles ADD COLUMN isAdmin boolean NOT NULL DEFAULT false;
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS products_slug_idx ON products (slug);
CREATE INDEX IF NOT EXISTS products_active_idx ON products (is_active);
CREATE INDEX IF NOT EXISTS profiles_isAdmin_idx ON profiles (isAdmin) WHERE isAdmin = true;

-- Generate slugs for existing products that don't have them
UPDATE products 
SET slug = LOWER(REGEXP_REPLACE(REGEXP_REPLACE(name, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'))
WHERE slug IS NULL;

-- Ensure all products have slugs
UPDATE products 
SET slug = 'product-' || id::text
WHERE slug IS NULL OR slug = '';

-- Make slug NOT NULL after populating
ALTER TABLE products ALTER COLUMN slug SET NOT NULL;

-- Update images column for existing products
UPDATE products 
SET images = CASE 
  WHEN image_url IS NOT NULL THEN jsonb_build_array(image_url)
  ELSE '[]'::jsonb
END
WHERE images = '[]'::jsonb AND image_url IS NOT NULL;

-- Enable RLS on products if not already enabled
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "public read active products" ON products;
DROP POLICY IF EXISTS "admin manage products" ON products;
DROP POLICY IF EXISTS "Products are publicly readable" ON products;
DROP POLICY IF EXISTS "Authenticated users can manage products" ON products;

-- Create new RLS policies
CREATE POLICY "public read active products"
ON products FOR SELECT
USING (is_active = true);

CREATE POLICY "admin manage products"
ON products FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.isAdmin = true
  )
);