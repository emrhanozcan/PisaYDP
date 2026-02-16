-- Create service_notes table
CREATE TABLE IF NOT EXISTS service_notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id TEXT NOT NULL,
    service_type TEXT NOT NULL, -- 'accommodation', 'life_support'
    note TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, service_type)
);

-- Create service_uploads table
CREATE TABLE IF NOT EXISTS service_uploads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id TEXT NOT NULL,
    service_type TEXT NOT NULL, -- 'accommodation', 'life_support'
    file_url TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size INTEGER,
    file_type TEXT,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE service_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_uploads ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON service_notes;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON service_uploads;
DROP POLICY IF EXISTS "Service Notes Access" ON service_notes;
DROP POLICY IF EXISTS "Service Uploads Access" ON service_uploads;

-- Create comprehensive RLS policies
CREATE POLICY "Service Notes Access" ON service_notes
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Service Uploads Access" ON service_uploads
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Create Storage Bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('service-uploads', 'service-uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
DROP POLICY IF EXISTS "Give users access to own folder 1oj01k_0" ON storage.objects;
DROP POLICY IF EXISTS "Service Uploads Storage Access" ON storage.objects;

CREATE POLICY "Service Uploads Storage Access" ON storage.objects
    FOR ALL
    TO authenticated
    USING (bucket_id = 'service-uploads')
    WITH CHECK (bucket_id = 'service-uploads');
