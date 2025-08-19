/*
  # Add isAdmin column to profiles table

  1. Schema Changes
    - Add `is_admin` column to `profiles` table
    - Type: boolean with default value false
    - Ensures all existing and new users are non-admin by default

  2. Security
    - Maintains existing RLS policies
    - Admin status controlled at database level
    - No hardcoded credentials in application code

  3. Notes
    - All existing users will have is_admin = false
    - Admin access must be granted manually in database
    - Provides secure, scalable admin access control
*/

-- Add is_admin column to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'is_admin'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_admin boolean DEFAULT false NOT NULL;
  END IF;
END $$;

-- Create index for efficient admin queries
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin) WHERE is_admin = true;

-- Add comment for documentation
COMMENT ON COLUMN profiles.is_admin IS 'Determines if user has admin dashboard access';