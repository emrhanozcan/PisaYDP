-- Add new status columns for Life Support and Scholarship
ALTER TABLE public.branch_students ADD COLUMN IF NOT EXISTS ydt_status TEXT DEFAULT 'Bekliyor';
ALTER TABLE public.branch_students ADD COLUMN IF NOT EXISTS scholarship_status TEXT DEFAULT 'Bekliyor';

-- Update existing records to have 'Bekliyor' as default if not already set
UPDATE public.branch_students SET residence_permit_status = 'Bekliyor' WHERE residence_permit_status IS NULL OR residence_permit_status = '';
UPDATE public.branch_students SET accommodation_status = 'Bekliyor' WHERE accommodation_status IS NULL OR accommodation_status = '';
UPDATE public.branch_students SET guardian_status = 'Bekliyor' WHERE guardian_status IS NULL OR guardian_status = '';

-- Set defaults for existing columns to 'Bekliyor'
ALTER TABLE public.branch_students ALTER COLUMN residence_permit_status SET DEFAULT 'Bekliyor';
ALTER TABLE public.branch_students ALTER COLUMN accommodation_status SET DEFAULT 'Bekliyor';
ALTER TABLE public.branch_students ALTER COLUMN guardian_status SET DEFAULT 'Bekliyor';
