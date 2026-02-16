-- Create a separate table for additional student educations
CREATE TABLE IF NOT EXISTS student_educations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id TEXT NOT NULL REFERENCES branch_students(id) ON DELETE CASCADE,
    university_id TEXT REFERENCES universities(id),
    department TEXT,
    program TEXT,
    grade TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_student_educations_student_id ON student_educations(student_id);
CREATE INDEX IF NOT EXISTS idx_student_educations_university_id ON student_educations(university_id);
