# Admin Access Setup Guide

## Overview

Admin access is now controlled by the `is_admin` column in the `profiles` table. No hardcoded emails or passwords are used.

## Setting Up Admin Access

### Step 1: Create a User Account
1. Go to your website and sign up normally at `/signup`
2. Use any email and password you prefer
3. Complete the registration process

### Step 2: Grant Admin Access in Supabase
1. Open your Supabase project dashboard
2. Go to **Table Editor** → **profiles**
3. Find the user you just created (search by email or name)
4. Click on the row to edit it
5. Change the `is_admin` column from `false` to `true`
6. Save the changes

### Step 3: Access Admin Dashboard
1. Sign in to your website with the user account
2. Navigate to `/admin` in your browser
3. You should now see the admin dashboard

## Alternative: Direct Database Update

You can also grant admin access using SQL in the Supabase SQL Editor:

```sql
-- Replace 'user@example.com' with the actual email
UPDATE profiles 
SET is_admin = true 
WHERE id = (
  SELECT id FROM auth.users 
  WHERE email = 'user@example.com'
);
```

## Security Features

✅ **Database-driven access control** - No hardcoded credentials  
✅ **Default non-admin** - All new users are non-admin by default  
✅ **Secure authentication** - Uses Supabase Auth + RLS policies  
✅ **Easy management** - Admin status can be toggled in database  

## Managing Admin Users

### View Current Admins
```sql
SELECT p.id, p.full_name, u.email, p.created_at
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE p.is_admin = true;
```

### Remove Admin Access
```sql
UPDATE profiles 
SET is_admin = false 
WHERE id = 'user-id-here';
```

### Grant Admin Access
```sql
UPDATE profiles 
SET is_admin = true 
WHERE id = 'user-id-here';
```

## Troubleshooting

**Can't access admin dashboard?**
1. Verify you're signed in
2. Check that `is_admin = true` in the profiles table
3. Clear browser cache and try again
4. Check browser console for errors

**Profile not found?**
- The profile is created automatically when a user signs up
- If missing, it may indicate an issue with the user creation trigger