
-- Fix RLS Policies for Service Logs (Anon Access)

-- Enable RLS (just in case)
ALTER TABLE service_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Enable read access for all users" ON service_logs;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON service_logs;
DROP POLICY IF EXISTS "Enable update for users based on email" ON service_logs;
DROP POLICY IF EXISTS "Service Logs Access" ON service_logs;
DROP POLICY IF EXISTS "Mentors can update own logs" ON service_logs;

-- Create comprehensive public/anon policy
CREATE POLICY "Service Logs Public Access" ON service_logs
    FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);
