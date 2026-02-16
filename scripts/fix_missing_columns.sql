-- MISSING COLUMNS FIX FOR RESIDENCE PERMIT AND CODICE FISCALE
-- Run this in your Supabase SQL Editor

-- 1. Add Residence Permit (Permesso di Soggiorno) columns
ALTER TABLE branch_students
ADD COLUMN IF NOT EXISTS residence_permit_handler TEXT,
ADD COLUMN IF NOT EXISTS residence_permit_arrival_date DATE,
ADD COLUMN IF NOT EXISTS residence_permit_appointment_date DATE,
ADD COLUMN IF NOT EXISTS residence_permit_place TEXT,
ADD COLUMN IF NOT EXISTS residence_permit_time TIME,
ADD COLUMN IF NOT EXISTS residence_permit_status TEXT;

-- 2. Add Codice Fiscale columns
ALTER TABLE branch_students
ADD COLUMN IF NOT EXISTS codice_fiscale_handler TEXT,
ADD COLUMN IF NOT EXISTS codice_fiscale_arrival_date DATE,
ADD COLUMN IF NOT EXISTS codice_fiscale_appointment_date DATE,
ADD COLUMN IF NOT EXISTS codice_fiscale_place TEXT,
ADD COLUMN IF NOT EXISTS codice_fiscale_time TIME,
ADD COLUMN IF NOT EXISTS codice_fiscale_status TEXT;

-- 3. Add column comments for documentation
COMMENT ON COLUMN branch_students.residence_permit_handler IS 'Oturum İzni - İşlemi Yapan Kişi';
COMMENT ON COLUMN branch_students.residence_permit_arrival_date IS 'Oturum İzni - Geliş Tarihi';
COMMENT ON COLUMN branch_students.residence_permit_appointment_date IS 'Oturum İzni - Randevu Tarihi';
COMMENT ON COLUMN branch_students.residence_permit_place IS 'Oturum İzni - Yeri';
COMMENT ON COLUMN branch_students.residence_permit_time IS 'Oturum İzni - Saati';
COMMENT ON COLUMN branch_students.residence_permit_status IS 'Oturum İzni - Durumu';

COMMENT ON COLUMN branch_students.codice_fiscale_handler IS 'Codice Fiscale - İşlemi Yapan Kişi';
COMMENT ON COLUMN branch_students.codice_fiscale_arrival_date IS 'Codice Fiscale - Geliş Tarihi';
COMMENT ON COLUMN branch_students.codice_fiscale_appointment_date IS 'Codice Fiscale - Randevu Tarihi';
COMMENT ON COLUMN branch_students.codice_fiscale_place IS 'Codice Fiscale - Yeri';
COMMENT ON COLUMN branch_students.codice_fiscale_time IS 'Codice Fiscale - Saati';
COMMENT ON COLUMN branch_students.codice_fiscale_status IS 'Codice Fiscale - Durumu';
