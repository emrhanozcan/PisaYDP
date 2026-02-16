-- CRITICAL FIX: Ensure branch_students table has scholarship_types column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'branch_students' 
        AND column_name = 'scholarship_types'
    ) THEN
        ALTER TABLE public.branch_students
        ADD COLUMN scholarship_types text[] DEFAULT '{}';
        
        RAISE NOTICE 'Added scholarship_types to branch_students';
    END IF;
END $$;

-- Ensure scholarship_tracking has ALL required columns (Idempotent check)
ALTER TABLE public.scholarship_tracking
ADD COLUMN IF NOT EXISTS application_tuition_fee text,
ADD COLUMN IF NOT EXISTS application_tuition_fee_status text,
ADD COLUMN IF NOT EXISTS application_isee_status text,
ADD COLUMN IF NOT EXISTS application_isee_status_status text,
ADD COLUMN IF NOT EXISTS application_dorm_status text,
ADD COLUMN IF NOT EXISTS application_dorm_status_status text,
ADD COLUMN IF NOT EXISTS application_scholarship_status text,
ADD COLUMN IF NOT EXISTS application_scholarship_status_status text,

ADD COLUMN IF NOT EXISTS documents_survey text,
ADD COLUMN IF NOT EXISTS documents_survey_status text,
ADD COLUMN IF NOT EXISTS documents_turkish text,
ADD COLUMN IF NOT EXISTS documents_turkish_status text,
ADD COLUMN IF NOT EXISTS documents_italian text,
ADD COLUMN IF NOT EXISTS documents_italian_status text,

ADD COLUMN IF NOT EXISTS credentials_school_username text,
ADD COLUMN IF NOT EXISTS credentials_school_password text,
ADD COLUMN IF NOT EXISTS credentials_isee_username text,
ADD COLUMN IF NOT EXISTS credentials_isee_password text,

ADD COLUMN IF NOT EXISTS result_ranking text,
ADD COLUMN IF NOT EXISTS result_status text,
ADD COLUMN IF NOT EXISTS result_block_account text,
ADD COLUMN IF NOT EXISTS result_italy_lease text,
ADD COLUMN IF NOT EXISTS result_iban text,
ADD COLUMN IF NOT EXISTS result_notes text,

ADD COLUMN IF NOT EXISTS caf_appointment_date text,
ADD COLUMN IF NOT EXISTS caf_appointment_status text,

ADD COLUMN IF NOT EXISTS date_application text,
ADD COLUMN IF NOT EXISTS date_isee text,
ADD COLUMN IF NOT EXISTS date_lease_upload text,

ADD COLUMN IF NOT EXISTS info_document_list text;

-- Fix permissions just in case
GRANT ALL ON public.branch_students TO postgres, service_role;
GRANT ALL ON public.scholarship_tracking TO postgres, service_role;
-- Allow authenticated users (if RLS is on)
GRANT SELECT, INSERT, UPDATE ON public.branch_students TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.scholarship_tracking TO authenticated;
