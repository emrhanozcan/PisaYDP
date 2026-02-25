-- Drop table if it exists to ensure clean slate with new schema
DROP TABLE IF EXISTS leads;

CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name TEXT NOT NULL,
    last_name TEXT,
    emails TEXT[],
    phone TEXT,
    nationality TEXT,
    
    -- Citizenship & Residence
    has_italy_residence_permit BOOLEAN DEFAULT false,
    has_other_citizenship BOOLEAN DEFAULT false,
    other_citizenship_country TEXT,
    
    -- Contact & Role
    contact_role TEXT DEFAULT 'student', -- 'student' or 'guardian'
    student_info JSONB DEFAULT '{}'::jsonb, -- Stores student details if contact is guardian
    guardian_info JSONB DEFAULT '{}'::jsonb,
    
    -- Education & Interests
    education_level TEXT,
    english_level TEXT,
    italian_level TEXT,
    work_experience TEXT,
    medical_track TEXT DEFAULT 'none', -- 'none', 'tip_ingilizce', 'both'
    interested_programs TEXT[],
    interested_universities TEXT[],
    interested_countries TEXT[],
    interested_services TEXT[],
    
    -- Dates & Years
    service_year TEXT,
    academic_year TEXT,
    registration_year TEXT,
    
    -- Meeting Info
    meeting_date DATE,
    meeting_time TIME,
    meeting_consultant UUID,
    meeting_type TEXT,
    meeting_summary TEXT,
    
    -- Financials
    discussed_price NUMERIC,
    additional_payment NUMERIC,
    has_discount BOOLEAN DEFAULT false,
    discount_info TEXT,
    price_notes TEXT,
    
    -- Status & Tracking
    source TEXT,
    reference_source TEXT,
    status TEXT DEFAULT 'lead',
    priority TEXT DEFAULT 'medium',
    tracking_status TEXT DEFAULT 'new_lead',
    
    -- Flags
    is_serious_candidate BOOLEAN DEFAULT false,
    visa_info_provided BOOLEAN DEFAULT false,
    contract_sent BOOLEAN DEFAULT false,
    form_completed BOOLEAN DEFAULT false,
    email_sent BOOLEAN DEFAULT false,
    is_registered BOOLEAN DEFAULT false,
    
    -- Follow Up
    follow_up_required BOOLEAN DEFAULT false,
    follow_up_info JSONB DEFAULT '{}'::jsonb, -- date, time, notes, status, etc.
    
    -- Metadata
    created_by UUID,
    branch_id UUID,
    assigned_consultants UUID[],
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
