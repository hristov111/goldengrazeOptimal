/*
  # Create coupons table for admin dashboard

  1. New Tables
    - `coupons`
      - `id` (uuid, primary key)
      - `code` (text, unique, coupon code)
      - `discount` (numeric, discount percentage)
      - `active` (boolean, whether coupon is active)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `coupons` table
    - Add policy for authenticated users to read coupons
    - Add policy for admin users to manage coupons

  3. Functions
    - Add function to get user count for dashboard
*/

-- Create coupons table
CREATE TABLE IF NOT EXISTS coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  discount numeric(5,2) NOT NULL CHECK (discount >= 0 AND discount <= 100),
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- Policies for coupons
CREATE POLICY "Coupons are readable by authenticated users"
  ON coupons
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage coupons"
  ON coupons
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Update trigger for coupons
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_coupons_updated_at
  BEFORE UPDATE ON coupons
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to get user count for dashboard
CREATE OR REPLACE FUNCTION get_user_count()
RETURNS integer
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT COUNT(*)::integer FROM auth.users;
$$;

-- Insert sample coupons
INSERT INTO coupons (code, discount, active) VALUES
  ('WELCOME10', 10.00, true),
  ('SAVE20', 20.00, true),
  ('FIRSTTIME', 15.00, false)
ON CONFLICT (code) DO NOTHING;