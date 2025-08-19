# Admin Dashboard Setup Guide

## Step 1: Add Your Admin Email

1. Open `src/components/admin/AdminRoute.tsx`
2. Add your email to the `ADMIN_EMAILS` array:

```typescript
const ADMIN_EMAILS = [
  'admin@mygoldengraze.com',
  'goldengraze1@outlook.com',
  'your-email@example.com'  // Replace with your actual email
];
```

## Step 2: Create Admin Account

### Option A: Sign Up Through the Website
1. Go to `/signup` on your website
2. Create an account using one of the admin emails from Step 1
3. Use a strong password (e.g., `AdminPass123!`)
4. Complete the signup process

### Option B: Create Admin User in Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Users**
3. Click **Add User**
4. Fill in:
   - **Email**: One of the emails from your ADMIN_EMAILS array
   - **Password**: A secure password (e.g., `AdminPass123!`)
   - **Email Confirm**: Set to `true` (so you don't need to verify email)
5. Click **Create User**

## Step 3: Access Admin Dashboard

1. Sign in to your website using the admin email and password
2. Navigate to `/admin` in your browser
3. You should now see the admin dashboard

## Example Admin Credentials

For testing purposes, you can use:
- **Email**: `admin@mygoldengraze.com`
- **Password**: `AdminPass123!`

## Security Notes

- Always use strong passwords for admin accounts
- Consider enabling 2FA in production
- Regularly review admin access
- Use environment variables for admin emails in production

## Troubleshooting

If you can't access the admin dashboard:

1. **Check your email**: Make sure it's in the ADMIN_EMAILS array
2. **Verify login**: Ensure you're signed in with the correct account
3. **Check browser console**: Look for any authentication errors
4. **Clear browser cache**: Sometimes helps with auth issues

## Production Deployment

For production, consider:
1. Moving ADMIN_EMAILS to environment variables
2. Setting up proper email verification
3. Implementing role-based permissions in the database
4. Adding audit logs for admin actions