-- Fix RLS Policies for Custom Auth (Anon Access)

-- 1. Service Notes Table
DROP POLICY IF EXISTS "Service Notes Access" ON service_notes;
CREATE POLICY "Service Notes Public Access" ON service_notes
    FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

-- 2. Service Uploads Table
DROP POLICY IF EXISTS "Service Uploads Access" ON service_uploads;
CREATE POLICY "Service Uploads Public Access" ON service_uploads
    FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

-- 3. Storage Bucket Policy
DROP POLICY IF EXISTS "Service Uploads Storage Access" ON storage.objects;
CREATE POLICY "Service Uploads Bucket Public Access" ON storage.objects
    FOR ALL
    TO public
    USING (bucket_id = 'service-uploads')
    WITH CHECK (bucket_id = 'service-uploads');
