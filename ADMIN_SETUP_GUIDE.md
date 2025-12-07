# Admin Dashboard Setup Guide

## Overview

The admin dashboard is now fully integrated with a Supabase `user_profiles` table that tracks user roles and types. This guide explains how to set up and use the admin system.

---

## Database Setup

### 1. Create the User Profiles Table

Run the SQL migration in your Supabase dashboard:

**Path:** `/supabase/migrations/001_create_user_profiles.sql`

This migration creates:
- `user_profiles` table with role-based access control
- Automatic user profile creation on signup via trigger
- Row-level security (RLS) policies for data protection
- Indexes for fast lookups

**Key Fields:**
- `id` (UUID) - References auth.users
- `email` (TEXT) - User email
- `full_name` (TEXT) - User's full name
- `role` (TEXT) - Either 'user' or 'admin'
- `subscription_status` - 'active' or 'inactive'
- `subscription_plan` - 'free' or 'premium'
- `provider` - 'email', 'google', 'apple', etc.
- `created_at` / `updated_at` - Timestamps

### 2. Steps to Apply Migration

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy the entire contents of `/supabase/migrations/001_create_user_profiles.sql`
5. Paste into the SQL editor
6. Click **Run**

---

## How User Roles Are Determined

### User Creation Flow

When a user signs up:

1. **Supabase Auth** creates an auth user
2. **Trigger Function** automatically creates a `user_profiles` record with:
   - `role: 'user'` (default)
   - `provider: 'email'` (or 'google', 'apple', etc.)
   - `subscription_status: 'inactive'`
   - `subscription_plan: 'free'`

3. **Frontend** calls `createOrUpdateUserProfile()` to ensure the profile exists

### Checking User Role

The role is fetched from the database in two ways:

#### Option 1: Direct Database Query (Recommended)
```typescript
import { fetchUserProfile } from './services/supabaseClient';

const profile = await fetchUserProfile(userId);
console.log(profile.role); // 'user' or 'admin'
```

#### Option 2: From User Metadata (Fallback)
```typescript
const user = mapSupabaseUserToProfile(authUser);
console.log(user.role); // Falls back to metadata if DB unavailable
```

---

## Making a User an Admin

### Method 1: Supabase Dashboard (Easiest)

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Run this query:
```sql
UPDATE user_profiles
SET role = 'admin'
WHERE email = 'user@example.com';
```

3. The user will be an admin on their next login

### Method 2: Programmatically

```typescript
import { supabase } from './services/supabaseClient';

async function makeUserAdmin(email: string) {
  const { data, error } = await supabase
    .from('user_profiles')
    .update({ role: 'admin' })
    .eq('email', email);
  
  if (error) console.error('Error:', error);
  return data;
}
```

### Method 3: Direct Database Insert (For Existing Users)

If a user already exists in auth but not in `user_profiles`:

```sql
INSERT INTO user_profiles (id, email, full_name, role, provider)
SELECT id, email, raw_user_meta_data->>'full_name', 'admin', 'email'
FROM auth.users
WHERE email = 'user@example.com'
ON CONFLICT (id) DO UPDATE SET role = 'admin';
```

---

## Accessing the Admin Dashboard

### Requirements

1. ✅ User must be logged in
2. ✅ User's `role` must be `'admin'` in the database
3. ✅ URL must contain the hash `#adminmixlock`

### Steps to Access

1. **Log in** with an admin account
2. **Navigate to:** `http://localhost:5173/#adminmixlock`
   - Or your production URL with `#adminmixlock`
3. The app will automatically show the admin dashboard

### What You'll See

The admin dashboard has three modules:

#### 1. **Users Module** (Active User Management)
- View all users with details
- See authentication provider (Google, Apple, Email)
- Check user status and last login
- Edit or delete users

#### 2. **App Tools Module** (Application Management)
- Feature toggles (High-Res Image Gen, Social Login, Maintenance Mode)
- System status monitoring
- API health checks
- Database latency metrics
- Active session count

#### 3. **Affiliate Module** (Affiliate Link Management)
- Manage affiliate links
- Track click-through rates (CTR)
- Monitor performance metrics
- Add new affiliate links

---

## Code Integration Points

### 1. User Authentication (`UserAuth.tsx`)

When a user signs up, the profile is created:

```typescript
if (data.user) {
  // Create user profile in database
  await createOrUpdateUserProfile(
    data.user.id,
    email,
    fullName.trim(),
    'email',
    'user'  // Default role
  );
}
```

### 2. App Initialization (`App.tsx`)

On app load, the user profile is fetched:

```typescript
const initAuth = async () => {
  const { data } = await supabase.auth.getSession();
  if (session?.user) {
    const profile = mapSupabaseUserToProfile(session.user);
    setUser(profile);
  }
};
```

### 3. Admin Check (`App.tsx`)

When rendering views:

```typescript
case AppView.ADMIN:
  return user?.role === 'admin' ? <AdminDashboard /> : <Dashboard />;
```

---

## Database Functions

### `fetchUserProfile(userId: string)`

Fetches a user's profile from the database.

```typescript
const profile = await fetchUserProfile('user-id-here');
// Returns: UserProfile | null
```

### `createOrUpdateUserProfile(...)`

Creates or updates a user profile.

```typescript
const profile = await createOrUpdateUserProfile(
  userId,
  email,
  fullName,
  provider,  // 'email', 'google', etc.
  role       // 'user' or 'admin'
);
```

### `mapSupabaseUserToProfile(user: User)`

Maps Supabase auth user to UserProfile (fallback method).

```typescript
const profile = mapSupabaseUserToProfile(authUser);
```

---

## Row-Level Security (RLS) Policies

The database has RLS enabled with these policies:

1. **Users can read their own profile**
   - Users can only see their own data

2. **Users can update their own profile**
   - Users can only modify their own data

3. **Admins can read all profiles**
   - Admins can view all user profiles

4. **Admins can update all profiles**
   - Admins can modify any user's data

---

## Testing the Setup

### Test 1: Create a New User

1. Go to the app
2. Click "Sign up"
3. Create an account with email/password
4. Check Supabase: `user_profiles` table should have a new row with `role: 'user'`

### Test 2: Make User an Admin

1. In Supabase Dashboard, run:
```sql
UPDATE user_profiles SET role = 'admin' WHERE email = 'your-test-email@example.com';
```

2. Log out and log back in
3. Navigate to `http://localhost:5173/#adminmixlock`
4. You should see the Admin Console

### Test 3: Verify Non-Admin Access

1. Create a regular user account
2. Try to access `http://localhost:5173/#adminmixlock`
3. You should see the Dashboard instead (access denied)

---

## Troubleshooting

### Issue: Admin dashboard not showing

**Solution:**
1. Verify user is logged in
2. Check `user_profiles` table - ensure `role = 'admin'`
3. Check browser console for errors
4. Try logging out and back in
5. Verify URL contains `#adminmixlock`

### Issue: User profile not created on signup

**Solution:**
1. Check if trigger is active: `SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';`
2. Check function exists: `SELECT * FROM pg_proc WHERE proname = 'handle_new_user';`
3. Manually insert profile:
```sql
INSERT INTO user_profiles (id, email, full_name, role, provider)
SELECT id, email, raw_user_meta_data->>'full_name', 'user', 'email'
FROM auth.users
WHERE email = 'user@example.com'
ON CONFLICT (id) DO NOTHING;
```

### Issue: RLS policy blocking access

**Solution:**
1. Ensure user is authenticated
2. Check RLS policies in Supabase Dashboard
3. Verify user has correct role in database
4. Try disabling RLS temporarily for testing (not recommended for production)

---

## Security Best Practices

1. ✅ **Always use RLS** - Enabled by default
2. ✅ **Verify admin role** - Check both auth and database
3. ✅ **Use HTTPS** - Required for production
4. ✅ **Rotate secrets** - Change API keys regularly
5. ✅ **Audit logs** - Monitor admin actions
6. ✅ **Limit admin access** - Only grant to trusted users

---

## Next Steps

1. Apply the SQL migration to your Supabase database
2. Create a test admin user
3. Test accessing the admin dashboard
4. Customize the AdminDashboard component as needed
5. Implement actual admin functionality (currently uses mock data)

---

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Supabase documentation: https://supabase.com/docs
3. Check browser console for error messages
4. Verify all environment variables are set correctly
