-- Create recipes table to store user-generated cocktail recipes
CREATE TABLE IF NOT EXISTS recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  ingredients TEXT[] NOT NULL,
  instructions TEXT[] NOT NULL,
  glassware TEXT,
  difficulty TEXT CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  estimated_cost_gbp DECIMAL(10, 2),
  recommended_products JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_recipes_user_id ON recipes(user_id);

-- Create index on name for search
CREATE INDEX IF NOT EXISTS idx_recipes_name ON recipes(name);

-- Enable Row Level Security
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can insert their own recipes" ON recipes;
DROP POLICY IF EXISTS "Users can read their own recipes" ON recipes;
DROP POLICY IF EXISTS "Users can update their own recipes" ON recipes;
DROP POLICY IF EXISTS "Users can delete their own recipes" ON recipes;
DROP POLICY IF EXISTS "Admins can read all recipes" ON recipes;
DROP POLICY IF EXISTS "Admins can update all recipes" ON recipes;
DROP POLICY IF EXISTS "Admins can delete all recipes" ON recipes;

-- Create RLS policy: Users can insert their own recipes
CREATE POLICY "Users can insert their own recipes"
  ON recipes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policy: Users can read their own recipes
CREATE POLICY "Users can read their own recipes"
  ON recipes FOR SELECT
  USING (auth.uid() = user_id);

-- Create RLS policy: Users can update their own recipes
CREATE POLICY "Users can update their own recipes"
  ON recipes FOR UPDATE
  USING (auth.uid() = user_id);

-- Create RLS policy: Users can delete their own recipes
CREATE POLICY "Users can delete their own recipes"
  ON recipes FOR DELETE
  USING (auth.uid() = user_id);

-- Create RLS policy: Admins can read all recipes
CREATE POLICY "Admins can read all recipes"
  ON recipes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create RLS policy: Admins can update all recipes
CREATE POLICY "Admins can update all recipes"
  ON recipes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create RLS policy: Admins can delete all recipes
CREATE POLICY "Admins can delete all recipes"
  ON recipes FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
