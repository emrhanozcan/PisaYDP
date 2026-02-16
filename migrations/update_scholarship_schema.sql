
-- Add scholarship_types to students table
alter table public.students 
add column if not exists scholarship_types text[] default '{}';

-- Add new columns to scholarship_tracking table
alter table public.scholarship_tracking
add column if not exists application_tuition_fee_status text,
add column if not exists application_isee_status_status text,
add column if not exists application_dorm_status_status text,
add column if not exists application_scholarship_status_status text,
add column if not exists documents_survey_status text,
add column if not exists documents_turkish_status text,
add column if not exists documents_italian_status text;

-- Add comment to explain columns
comment on column public.scholarship_tracking.application_tuition_fee_status is 'Tamamlandı, İşleme Alındı, Beklemede';
comment on column public.scholarship_tracking.documents_survey_status is 'İletildi, Tercümede, Beklemede';
