-- Add second university columns to branch_students
ALTER TABLE branch_students
ADD COLUMN IF NOT EXISTS university2_id UUID REFERENCES universities(id),
ADD COLUMN IF NOT EXISTS department2 TEXT,
ADD COLUMN IF NOT EXISTS program2 TEXT,
ADD COLUMN IF NOT EXISTS grade2 TEXT;

-- Create an index for faster searching on the second university
CREATE INDEX IF NOT EXISTS idx_branch_students_university2_id ON branch_students(university2_id);
