-- Add registration_deadline column to universities table
-- Run this SQL in Supabase SQL Editor

ALTER TABLE universities 
ADD COLUMN IF NOT EXISTS registration_deadline TEXT;

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'universities' AND column_name = 'registration_deadline';
