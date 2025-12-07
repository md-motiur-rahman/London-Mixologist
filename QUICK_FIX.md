# Quick Fix for Database Error

## The Problem
Users can't sign up - getting "Database error saving new user"

## The Solution (Choose One)

### ✅ RECOMMENDED: Fix RLS Policies (2 minutes)

1. Go to https://app.supabase.com → Your Project → SQL Editor
2. Click **New Query**
3. Copy & paste this SQL:

```sql
-- Drop existing policies
DROP POLICY IF EXISTS "Service role can insert profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can read their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON user_profiles;

-- Create new policies
CREATE POLICY "Service role can insert"
  ON user_profiles FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can read their own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can read all profiles"
  ON user_profiles FOR SELECT
  USING (auth.uid() IN (SELECT id FROM user_profiles WHERE role = 'admin'));

CREATE POLICY "Admins can update all profiles"
  ON user_profiles FOR UPDATE
  USING (auth.uid() IN (SELECT id FROM user_profiles WHERE role = 'admin'));
```

4. Click **Run**
5. Test signup at https://london-mixologist-kappa.vercel.app

---

### 🔧 ALTERNATIVE: Disable RLS (Quickest, Less Secure)

If the above doesn't work, run this:

```sql
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
```

This disables security checks. **Only for testing!** Re-enable with:
```sql
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
```

---

### 🗑️ NUCLEAR: Delete & Recreate Table

If nothing works, delete the table and start fresh:

```sql
DROP TABLE IF EXISTS user_profiles CASCADE;
```

Then run the migration from `/supabase/migrations/001_create_user_profiles.sql` again.

---

## Verify It Works

1. Sign up at https://london-mixologist-kappa.vercel.app
2. Check Supabase: SQL Editor → Run:
```sql
SELECT * FROM user_profiles ORDER BY created_at DESC LIMIT 1;
```
3. You should see your new user profile

---

## Still Not Working?

Check these in order:

1. **Is the table created?**
   ```sql
   SELECT * FROM user_profiles LIMIT 1;
   ```

2. **Do the policies exist?**
   ```sql
   SELECT policyname FROM pg_policies WHERE tablename = 'user_profiles';
   ```

3. **Is the trigger there?**
   ```sql
   SELECT tgname FROM pg_trigger WHERE tgrelid = 'user_profiles'::regclass;
   ```

4. **Check auth logs:**
   - Supabase Dashboard → Logs → Auth
   - Look for signup attempts and errors

---

## Files to Reference

- **Full Setup Guide:** `ADMIN_SETUP_GUIDE.md`
- **Detailed Fix:** `FIX_DATABASE_ERROR.md`
- **Migration 1:** `supabase/migrations/001_create_user_profiles.sql`
- **Migration 2:** `supabase/migrations/002_fix_rls_policies.sql`
- **Migration 3:** `supabase/migrations/003_alternative_simple_setup.sql`
