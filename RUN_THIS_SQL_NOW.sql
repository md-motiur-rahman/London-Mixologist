-- =============================================
-- RUN THIS SQL IN SUPABASE SQL EDITOR NOW
-- Go to: https://app.supabase.com
-- Select your project → SQL Editor → New Query
-- Paste this entire file and click RUN
-- =============================================

-- Step 1: Remove the problematic trigger that's causing the error
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Step 2: Make sure the table exists (if not, create it)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  subscription_status TEXT NOT NULL DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'inactive')),
  subscription_plan TEXT NOT NULL DEFAULT 'free' CHECK (subscription_plan IN ('free', 'premium')),
  is_affiliate BOOLEAN DEFAULT FALSE,
  amazon_associate_id TEXT,
  phone_number TEXT,
  address TEXT,
  avatar_url TEXT,
  provider TEXT DEFAULT 'email',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Drop ALL existing policies (clean slate)
DROP POLICY IF EXISTS "Service role can insert profiles" ON user_profiles;
DROP POLICY IF EXISTS "Service role can insert" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can read their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON user_profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON user_profiles;
DROP POLICY IF EXISTS "Enable insert for service role" ON user_profiles;
DROP POLICY IF EXISTS "Enable read for users based on user_id" ON user_profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON user_profiles;
DROP POLICY IF EXISTS "Enable read for admins" ON user_profiles;
DROP POLICY IF EXISTS "Enable update for admins" ON user_profiles;
DROP POLICY IF EXISTS "Enable delete for admins" ON user_profiles;
DROP POLICY IF EXISTS "Anyone can insert" ON user_profiles;

-- Step 4: Disable RLS temporarily to allow signups
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- Step 5: Grant permissions
GRANT ALL ON user_profiles TO authenticated;
GRANT ALL ON user_profiles TO anon;
GRANT ALL ON user_profiles TO service_role;

-- Done! Now test signup at your app.
-- After confirming it works, you can re-enable RLS with proper policies.
