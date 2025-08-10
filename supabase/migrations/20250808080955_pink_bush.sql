/*
  # Remove redundant email and hash_password columns from profiles

  1. Changes
    - Remove `email` column from profiles table (auth.users already has this)
    - Remove `hash_password` column from profiles table (auth handles passwords)
    - Drop the email index since column is being removed
    - Update trigger to not populate email (auth.users.email is the source of truth)

  2. Rationale
    - Supabase Auth (auth.users) is the single source of truth for email and passwords
    - Duplicating this data creates unnecessary complexity and potential sync issues
    - Follow Supabase best practices: profiles table for app-specific data only
*/

-- Drop the email index first
DROP INDEX IF EXISTS profiles_email_idx;

-- Remove the redundant columns
ALTER TABLE profiles DROP COLUMN IF EXISTS email;
ALTER TABLE profiles DROP COLUMN IF EXISTS hash_password;

-- Update the trigger to only handle app-specific profile data
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'full_name', ''));
  RETURN new;
END; $$;