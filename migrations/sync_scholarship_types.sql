-- Sync scholarship_types from students to branch_students
-- This is needed because branch_students is a separate table, not a view, and we added the column recently.

DO $$
BEGIN
    UPDATE public.branch_students bs
    SET scholarship_types = s.scholarship_types
    FROM public.students s
    WHERE bs.id = s.id 
      AND s.scholarship_types IS NOT NULL 
      AND s.scholarship_types != '{}';

    RAISE NOTICE 'Synced scholarship_types for matching students.';
END $$;
