/*
  # Ensure Profile Creation for Admin Access

  1. Profile Creation
    - Add trigger to automatically create profiles for new users
    - Ensure all existing users have profiles
    - Set default is_admin = false for all profiles

  2. Security
    - Maintain existing RLS policies
    - Ensure profiles are created with proper defaults
*/

-- Create profiles for any existing users who don't have them
INSERT INTO profiles (id, full_name, is_admin)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data->>'full_name', split_part(au.email, '@', 1)) as full_name,
  false as is_admin
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- Create or replace the trigger function to auto-create profiles
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, full_name, is_admin)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    false
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new user profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();