-- Add Codice Fiscale columns to branch_students table
ALTER TABLE branch_students
ADD COLUMN IF NOT EXISTS codice_fiscale_handler TEXT,
ADD COLUMN IF NOT EXISTS codice_fiscale_arrival_date DATE,
ADD COLUMN IF NOT EXISTS codice_fiscale_appointment_date DATE,
ADD COLUMN IF NOT EXISTS codice_fiscale_place TEXT,
ADD COLUMN IF NOT EXISTS codice_fiscale_time TIME,
ADD COLUMN IF NOT EXISTS codice_fiscale_status TEXT;

-- Add comments for clarity
COMMENT ON COLUMN branch_students.codice_fiscale_handler IS 'Codice Fiscale - İşlemi Yapan Kişi';
COMMENT ON COLUMN branch_students.codice_fiscale_arrival_date IS 'Codice Fiscale - Geliş Tarihi';
COMMENT ON COLUMN branch_students.codice_fiscale_appointment_date IS 'Codice Fiscale - Randevu Tarihi';
COMMENT ON COLUMN branch_students.codice_fiscale_place IS 'Codice Fiscale - Yeri';
COMMENT ON COLUMN branch_students.codice_fiscale_time IS 'Codice Fiscale - Saati';
COMMENT ON COLUMN branch_students.codice_fiscale_status IS 'Codice Fiscale - Durumu';
