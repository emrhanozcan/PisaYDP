-- Add attachments column to service_logs table
ALTER TABLE service_logs
ADD COLUMN IF NOT EXISTS attachments TEXT[] DEFAULT '{}';

COMMENT ON COLUMN service_logs.attachments IS 'Array of file URLs or Base64 strings for service log attachments';
