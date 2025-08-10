/*
  # Create profiles table following Supabase best practices

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `full_name` (text)
      - `username` (text, unique)
      - `avatar_url` (text)
      - `phone` (text, optional)
      - `date_of_birth` (date, optional)
      - `shipping_address` (jsonb for flexibility)
      - `billing_address` (jsonb for flexibility)
      - `preferences` (jsonb with defaults)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `profiles` table
    - Public read access for profiles
    - Users can insert/update their own profile only

  3. Auto-profile Creation
    - Trigger function to auto-create profile on auth signup
    - Uses raw_user_meta_data from auth.users
    - Security definer for safe RLS bypass
*/

-- Drop existing users table if it exists
DROP TABLE IF EXISTS public.users CASCADE;

-- Create profiles table (1:1 with auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  username text UNIQUE,
  avatar_url text,
  phone text,
  date_of_birth date,
  shipping_address jsonb DEFAULT '{}',
  billing_address jsonb DEFAULT '{}',
  preferences jsonb DEFAULT '{
    "newsletter": true,
    "order_updates": true,
    "marketing_emails": false,
    "product_recommendations": true
  }',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "profiles are readable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Auto-create profile trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'full_name', '')
  );
  RETURN new;
END; $$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();