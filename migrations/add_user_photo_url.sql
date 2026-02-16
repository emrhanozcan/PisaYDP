-- Migration to add photo_url to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- Update RLS if needed (Admin and the user should be able to update their own photo)
-- Assuming common pattern for RLS in this project:
-- Admins can do anything. Users can update their own profile.

-- Example RLS for users table (adjust if table name/structure varies)
-- CREATE POLICY "Users can update their own photo" ON users
-- FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
