-- Migration to ensure all Scholarship Tracking fields exist
-- Based on ScholarshipTracking interface in src/types/index.ts

ALTER TABLE public.scholarship_tracking
ADD COLUMN IF NOT EXISTS application_tuition_fee text,
ADD COLUMN IF NOT EXISTS application_isee_status text,
ADD COLUMN IF NOT EXISTS application_dorm_status text,
ADD COLUMN IF NOT EXISTS application_scholarship_status text,

ADD COLUMN IF NOT EXISTS documents_survey text,
ADD COLUMN IF NOT EXISTS documents_turkish text,
ADD COLUMN IF NOT EXISTS documents_italian text,

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
ADD COLUMN IF NOT EXISTS date_lease_upload text;

-- Add standard columns if missing
ALTER TABLE public.scholarship_tracking
ADD COLUMN IF NOT EXISTS created_at timestamp with time zone default timezone('utc'::text, now()) not null,
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone default timezone('utc'::text, now()) not null;

-- Ensure RLS is enabled and policies exist (optional but good practice)
ALTER TABLE public.scholarship_tracking ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'scholarship_tracking' AND policyname = 'Enable read access for all users'
    ) THEN
        CREATE POLICY "Enable read access for all users" ON public.scholarship_tracking FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'scholarship_tracking' AND policyname = 'Enable insert for all users'
    ) THEN
        CREATE POLICY "Enable insert for all users" ON public.scholarship_tracking FOR INSERT WITH CHECK (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'scholarship_tracking' AND policyname = 'Enable update for all users'
    ) THEN
        CREATE POLICY "Enable update for all users" ON public.scholarship_tracking FOR UPDATE USING (true);
    END IF;
END
$$;
