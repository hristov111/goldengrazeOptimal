/*
  # Fix User Profile Creation Trigger

  This migration ensures that user profiles are automatically created when users sign up through Supabase Auth.

  1. Trigger Function
    - Creates or replaces the `handle_new_user()` function
    - Automatically inserts user profile data when auth user is created
    - Uses SECURITY DEFINER to bypass RLS during profile creation

  2. Trigger Setup
    - Creates trigger on auth.users table
    - Fires after INSERT operations
    - Calls handle_new_user() function

  3. Security
    - Function runs with elevated privileges to create profiles
    - Handles potential conflicts gracefully
*/

-- Create or replace the trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, full_name, email, preferences)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    '{"newsletter": true, "order_updates": true, "marketing_emails": false, "product_recommendations": true}'::jsonb
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN new;
END;
$$;

-- Drop the trigger if it exists and recreate it
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();