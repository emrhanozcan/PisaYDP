-- Add unit_price column to service_logs table
ALTER TABLE service_logs ADD COLUMN IF NOT EXISTS unit_price numeric;

-- Update status constraint if it exists (assuming it might be a text column with checks)
-- If it's a simple text column, no change needed. 
-- In most Supabase/Postgres setups for this project, it's just text.
