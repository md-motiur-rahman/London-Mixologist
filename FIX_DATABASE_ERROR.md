# Fix: Database Error Saving New User

## Problem

When users try to sign up, they get this error:
```
error=server_error&error_code=unexpected_failure&error_description=Database+error+saving+new+user
```

## Root Cause

The RLS (Row Level Security) policies on the `user_profiles` table are blocking the trigger function from inserting new user profiles. The trigger runs as the service role, but the RLS policies don't allow it to insert.

## Solution

You need to apply the RLS policy fixes. Follow these steps:

### Step 1: Go to Supabase Dashboard

1. Open https://app.supabase.com
2. Select your project
3. Go to **SQL Editor**

### Step 2: Run the Fix Migration

1. Click **New Query**
2. Copy the entire contents of `/supabase/migrations/002_fix_rls_policies.sql`
3. Paste into the SQL editor
4. Click **Run**

The migration will:
- Drop the problematic RLS policies
- Create new policies that allow the trigger to work
- Maintain security by restricting user access appropriately

### Step 3: Test the Fix

1. Go to your app: https://london-mixologist-kappa.vercel.app
2. Try to sign up with a new account
3. You should now be able to create an account without errors

---

## What Changed

### Before (Broken)
```sql
-- This blocked the trigger from inserting
CREATE POLICY "Users can read their own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);
```

### After (Fixed)
```sql
-- This allows the trigger to insert
CREATE POLICY "Service role can insert"
  ON user_profiles FOR INSERT
  WITH CHECK (true);

-- This allows users to insert their own profile
CREATE POLICY "Users can insert their own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
```

---

## RLS Policies Explained

After the fix, here's what each policy does:

| Policy | Operation | Who | What |
|--------|-----------|-----|------|
| Users can insert their own profile | INSERT | Authenticated users | Can create their own profile |
| Service role can insert | INSERT | Service role (trigger) | Allows trigger to create profiles |
| Users can read their own profile | SELECT | Authenticated users | Can view their own profile |
| Users can update their own profile | UPDATE | Authenticated users | Can edit their own profile |
| Admins can read all profiles | SELECT | Admin users | Can view all user profiles |
| Admins can update all profiles | UPDATE | Admin users | Can edit any user profile |
| Admins can delete profiles | DELETE | Admin users | Can delete any user profile |

---

## Verification

To verify the fix worked:

### Check 1: Verify Policies Exist
```sql
SELECT policyname, permissive, cmd
FROM pg_policies
WHERE tablename = 'user_profiles'
ORDER BY policyname;
```

You should see 7 policies listed.

### Check 2: Verify Trigger Exists
```sql
SELECT tgname, tgfunc
FROM pg_trigger
WHERE tgrelid = 'user_profiles'::regclass;
```

You should see `on_auth_user_created` trigger.

### Check 3: Verify User Profile Created
After signing up, run:
```sql
SELECT id, email, full_name, role
FROM user_profiles
WHERE email = 'your-test-email@example.com';
```

You should see a row with `role = 'user'`.

---

## If the Error Persists

### Option 1: Disable RLS Temporarily (Testing Only)

```sql
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
```

Then test signup. If it works, the issue is definitely RLS. Re-enable with:
```sql
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
```

Then apply the fix migration.

### Option 2: Check Trigger Function

```sql
SELECT prosrc FROM pg_proc WHERE proname = 'handle_new_user';
```

The function should exist and contain the INSERT statement.

### Option 3: Check Logs

In Supabase Dashboard:
1. Go to **Logs** → **Auth**
2. Look for signup attempts
3. Check for error messages

### Option 4: Manually Create Profile

If a user exists in auth but not in `user_profiles`:

```sql
INSERT INTO user_profiles (id, email, full_name, role, provider)
SELECT id, email, raw_user_meta_data->>'full_name', 'user', 'email'
FROM auth.users
WHERE email = 'user@example.com'
ON CONFLICT (id) DO NOTHING;
```

---

## Prevention

To prevent this in the future:

1. **Always test RLS policies** before deploying
2. **Use SECURITY DEFINER** on trigger functions (already done)
3. **Test signup flow** in staging before production
4. **Monitor auth logs** for errors
5. **Keep migrations organized** in `/supabase/migrations/`

---

## Next Steps

1. Apply the fix migration (002_fix_rls_policies.sql)
2. Test signup with a new account
3. Verify the user profile was created in the database
4. Try accessing the admin dashboard if you're an admin
5. Monitor for any other errors

---

## Support

If you still have issues:

1. Check the Supabase logs for detailed error messages
2. Verify all migrations were applied in order
3. Ensure the trigger function exists and is correct
4. Check that RLS is enabled on the table
5. Review the RLS policies in the Supabase Dashboard

For more help, see:
- Supabase RLS Docs: https://supabase.com/docs/guides/auth/row-level-security
- Supabase Triggers: https://supabase.com/docs/guides/database/postgres/triggers
