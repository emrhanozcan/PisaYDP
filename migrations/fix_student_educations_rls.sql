-- Enable RLS on student_educations table just in case it was enabled by default but with no policies (DENY ALL)
ALTER TABLE student_educations ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to perform all operations
-- Drop policy if exists to avoid errors on re-run
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON student_educations;

CREATE POLICY "Allow all operations for authenticated users" 
ON student_educations 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Allow anon users (if needed for development/testing via API keys)
DROP POLICY IF EXISTS "Allow all operations for anon users" ON student_educations;

CREATE POLICY "Allow all operations for anon users" 
ON student_educations 
FOR ALL 
TO anon 
USING (true) 
WITH CHECK (true);
