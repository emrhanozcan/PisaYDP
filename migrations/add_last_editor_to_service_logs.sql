-- Add last_editor_role column to identify if admin or mentor updated the log.
ALTER TABLE service_logs ADD COLUMN IF NOT EXISTS last_editor_role TEXT DEFAULT 'mentor';

-- Optional: Add constraint to restrict values
-- ALTER TABLE service_logs ADD CONSTRAINT check_last_editor_role CHECK (last_editor_role IN ('mentor', 'admin'));
