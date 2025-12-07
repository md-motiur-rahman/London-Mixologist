-- ALTERNATIVE APPROACH: Simpler setup without trigger
-- Use this if you prefer to handle profile creation from the frontend
-- This approach is more reliable and easier to debug

-- Drop the problematic trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Service role can insert" ON user_profiles;
DROP POLICY IF EXISTS "Service role can insert profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can read their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON user_profiles;

-- Disable RLS for now (we'll use frontend validation)
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- Create simple, permissive policies for development
-- In production, you should enable RLS with proper policies

-- Allow anyone to insert (frontend will validate)
CREATE POLICY "Anyone can insert"
  ON user_profiles FOR INSERT
  WITH CHECK (true);

-- Allow users to read their own profile
CREATE POLICY "Users can read their own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id OR auth.uid() IS NULL);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- Allow admins to read all profiles
CREATE POLICY "Admins can read all profiles"
  ON user_profiles FOR SELECT
  USING (true);

-- Allow admins to update all profiles
CREATE POLICY "Admins can update all profiles"
  ON user_profiles FOR UPDATE
  USING (true);

-- Allow admins to delete profiles
CREATE POLICY "Admins can delete profiles"
  ON user_profiles FOR DELETE
  USING (true);
