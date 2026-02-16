-- Add photo_url column to students table
ALTER TABLE students ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- Add photo_url column to branch_students table
ALTER TABLE branch_students ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- Note: You should manually create a "student-photos" bucket in Supabase Storage 
-- and set it to PUBLIC access for these URLs to work.
