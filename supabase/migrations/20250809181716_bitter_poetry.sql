/*
  # Create product images table and storage

  1. New Tables
    - `product_images`
      - `id` (uuid, primary key)
      - `product_id` (uuid, foreign key to products)
      - `storage_path` (text, for private bucket)
      - `public_url` (text, for public bucket)
      - `alt` (text, alt text for accessibility)
      - `sort_order` (int, for ordering images)
      - `is_primary` (boolean, primary image flag)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `product_images` table
    - Add policy for public read access to product images

  3. Indexes
    - Index on product_id for efficient queries
    - Composite index on product_id and sort_order for ordering
*/

-- Create product_images table
CREATE TABLE IF NOT EXISTS product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  storage_path text,
  public_url text,
  alt text,
  sort_order int DEFAULT 0,
  is_primary boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "product_images public read"
ON product_images FOR SELECT USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_sort ON product_images(product_id, sort_order);

-- Insert sample product images for existing products
DO $$
DECLARE
    product_record RECORD;
BEGIN
    -- Get the first product to add sample images
    SELECT id INTO product_record FROM products LIMIT 1;
    
    IF product_record.id IS NOT NULL THEN
        -- Insert sample images for the product
        INSERT INTO product_images (product_id, public_url, alt, sort_order, is_primary) VALUES
        (product_record.id, '/balm_images/firstPic.png', 'Golden Graze Whipped Tallow Balm - Main View', 0, true),
        (product_record.id, '/product_images/golden_graze1.png', 'Golden Graze Whipped Tallow Balm - Close Up', 1, false),
        (product_record.id, '/product_images/multipleGoldenGraze.png', 'Golden Graze Product Collection', 2, false),
        (product_record.id, '/product_images/holding.jpg', 'Golden Graze in Hand', 3, false),
        (product_record.id, '/product_images/upperBalm.jpg', 'Golden Graze Top View', 4, false);
    END IF;
END $$;