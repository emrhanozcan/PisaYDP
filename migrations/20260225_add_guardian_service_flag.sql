-- Add guardian_service column to branch_students table
ALTER TABLE branch_students ADD COLUMN IF NOT EXISTS guardian_service VARCHAR(10) DEFAULT 'Hayır';

-- Update existing records if necessary (they will already have 'Hayır' due to default, but being explicit)
UPDATE branch_students SET guardian_service = 'Hayır' WHERE guardian_service IS NULL;
