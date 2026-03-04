-- Drop dependent RLS policies first
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON leads;
DROP POLICY IF EXISTS "Enable delete access for public" ON leads;

-- Drop foreign key constraints
ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_branch_id_fkey;
ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_meeting_consultant_fkey;
ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_created_by_fkey;

-- Alter columns to TEXT
ALTER TABLE leads ALTER COLUMN branch_id TYPE TEXT;
ALTER TABLE leads ALTER COLUMN meeting_consultant TYPE TEXT;
ALTER TABLE leads ALTER COLUMN created_by TYPE TEXT;

-- Recreate policies with the new types
CREATE POLICY "Enable delete access for authenticated users" ON leads
    FOR DELETE
    TO authenticated
    USING (auth.uid()::text = created_by);

CREATE POLICY "Enable delete access for public" ON leads
    FOR DELETE
    TO public
    USING (true);
