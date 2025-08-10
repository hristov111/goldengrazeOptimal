/*
  # Add email and hash_password to profiles table

  1. Changes
    - Add `email` column to store user email
    - Add `hash_password` column to store hashed password
    - Update trigger to populate email from auth.users
    - Add indexes for performance

  2. Security
    - Email is populated from auth.users automatically
    - hash_password can be used for additional validation if needed
    - Maintains existing RLS policies
*/

-- Add email and hash_password columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS hash_password text;

-- Add index on email for performance
CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles(email);

-- Update the trigger function to include email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    new.email
  );
  RETURN new;
END; $$;

-- Recreate the trigger to use updated function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();