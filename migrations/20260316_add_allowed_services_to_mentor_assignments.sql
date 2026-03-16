-- Migration: Add allowed_service_ids to mentor_assignments
-- Description: Stores individual service types that a mentor is allowed to provide to a specific student.

ALTER TABLE mentor_assignments
ADD COLUMN IF NOT EXISTS allowed_service_ids text[];

-- Optional: Comment on the column
COMMENT ON COLUMN mentor_assignments.allowed_service_ids IS 'List of service_type IDs that this mentor can log for this student';
