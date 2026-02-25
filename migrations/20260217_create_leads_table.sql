-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Lead Status Enum (optional, or use check constraint)
-- CREATE TYPE lead_status AS ENUM ('new_lead', 'lead', 'contacted', 'meeting_scheduled', 'proposal_sent', 'enrolled', 'rejected', 'busy', 'no_answer');

CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Personal Info
    first_name TEXT NOT NULL,
    last_name TEXT,
    emails TEXT[] DEFAULT '{}',
    phone TEXT,
    nationality TEXT DEFAULT 'Türkiye',
    
    -- Contact Role (Student vs Guardian)
    contact_role TEXT CHECK (contact_role IN ('student', 'guardian')) DEFAULT 'student',
    student_info JSONB DEFAULT '{}'::jsonb, -- Stores student details if contact_role is guardian

    -- Education & Interest
    education_level TEXT,
    english_level TEXT,
    italian_level TEXT,
    interested_programs TEXT[] DEFAULT '{}',
    interested_universities TEXT[] DEFAULT '{}',
    interested_services TEXT[] DEFAULT '{}',
    
    -- Years
    service_year TEXT DEFAULT '2025',
    academic_year TEXT DEFAULT '2025-2026',
    registration_year TEXT,

    -- Meeting Details
    meeting_date DATE,
    meeting_time TIME,
    meeting_consultant UUID REFERENCES profiles(id) ON DELETE SET NULL,
    meeting_type TEXT CHECK (meeting_type IN ('phone', 'online', 'office', 'whatsapp')) DEFAULT 'phone',
    meeting_summary TEXT,

    -- Lead Status & Source
    source TEXT DEFAULT 'website',
    status TEXT CHECK (status IN ('new_lead', 'lead', 'contacted', 'meeting_scheduled', 'proposal_sent', 'enrolled', 'rejected', 'busy', 'no_answer')) DEFAULT 'new_lead',
    priority TEXT DEFAULT 'medium',
    
    -- Financials
    discussed_price NUMERIC,
    additional_payment NUMERIC,
    has_discount BOOLEAN DEFAULT FALSE,
    discount_info TEXT,

    -- Notes & Assignments
    notes TEXT,
    assigned_consultants TEXT[] DEFAULT '{}', -- Array of user IDs or names? Usually IDs if referencing auth.users or profiles
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    branch_id UUID REFERENCES branches(id) ON DELETE SET NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS leads_created_at_idx ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS leads_status_idx ON leads(status);
CREATE INDEX IF NOT EXISTS leads_meeting_date_idx ON leads(meeting_date);
CREATE INDEX IF NOT EXISTS leads_text_search_idx ON leads USING GIN (to_tsvector('turkish', first_name || ' ' || coalesce(last_name, '') || ' ' || coalesce(phone, '')));

-- RLS Policies (Example)
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for authenticated users" ON leads
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON leads
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users" ON leads
    FOR UPDATE
    TO authenticated
    USING (true);

CREATE POLICY "Enable delete access for authenticated users" ON leads
    FOR DELETE
    TO authenticated
    USING (auth.uid() = created_by); -- Example: only creator can delete, or admin

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_leads_modtime
    BEFORE UPDATE ON leads
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();
