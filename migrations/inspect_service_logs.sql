
-- Inspect table definition
SELECT 
    column_name, 
    data_type 
FROM 
    information_schema.columns 
WHERE 
    table_name = 'service_logs';

-- Inspect Policies
SELECT *
FROM pg_policies
WHERE tablename = 'service_logs';

-- Check if RLS is enabled
SELECT relname, relrowsecurity
FROM pg_class
WHERE relname = 'service_logs';
