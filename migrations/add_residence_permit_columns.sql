-- Add Residence Permit (Permesso di Soggiorno) columns to branch_students table
ALTER TABLE branch_students
ADD COLUMN IF NOT EXISTS residence_permit_handler TEXT,
ADD COLUMN IF NOT EXISTS residence_permit_arrival_date DATE,
ADD COLUMN IF NOT EXISTS residence_permit_appointment_date DATE,
ADD COLUMN IF NOT EXISTS residence_permit_place TEXT,
ADD COLUMN IF NOT EXISTS residence_permit_time TIME,
ADD COLUMN IF NOT EXISTS residence_permit_status TEXT;

-- Add comments for clarity
COMMENT ON COLUMN branch_students.residence_permit_handler IS 'Oturum İzni - İşlemi Yapan Kişi';
COMMENT ON COLUMN branch_students.residence_permit_arrival_date IS 'Oturum İzni - Geliş Tarihi';
COMMENT ON COLUMN branch_students.residence_permit_appointment_date IS 'Oturum İzni - Randevu Tarihi';
COMMENT ON COLUMN branch_students.residence_permit_place IS 'Oturum İzni - Yeri';
COMMENT ON COLUMN branch_students.residence_permit_time IS 'Oturum İzni - Saati';
COMMENT ON COLUMN branch_students.residence_permit_status IS 'Oturum İzni - Durumu';
