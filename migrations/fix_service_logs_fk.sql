-- Drop the foreign key constraint on student_id to allow logging for Branch Students
-- Branch Students are in a separate table (branch_students) but use the same ID column in service_logs.

DO $$ 
BEGIN
    -- Attempt to drop standard constraint name
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'service_logs_student_id_fkey') THEN
        ALTER TABLE service_logs DROP CONSTRAINT service_logs_student_id_fkey;
    END IF;

    -- Attempt to drop other common naming if it exists (e.g. if created differently)
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_service_logs_students') THEN
        ALTER TABLE service_logs DROP CONSTRAINT fk_service_logs_students;
    END IF;
END $$;

-- Verify or Add constraint? No, we just need to allow IDs from branch_students which are not in students table.
-- So we cannot have a single FK to students table.
-- We rely on application logic to ensure ID validity.
