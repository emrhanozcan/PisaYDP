-- Fix RLS Policies for Mentor Transactions (Anon Access)
-- Since the application backend handles authorization (using NEXT_PUBLIC_SUPABASE_ANON_KEY),
-- the client runs as "anon" role in the context of Supabase. Therefore we need to allow access.

ALTER TABLE public.mentor_transactions ENABLE ROW LEVEL SECURITY;

-- Drop existing restricted policies
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.mentor_transactions;
DROP POLICY IF EXISTS "Admins and general roles can view all transactions" ON public.mentor_transactions;
DROP POLICY IF EXISTS "Mentors can insert their own expenses and advances" ON public.mentor_transactions;
DROP POLICY IF EXISTS "Admins can insert any transaction" ON public.mentor_transactions;
DROP POLICY IF EXISTS "Admins can update transactions" ON public.mentor_transactions;
DROP POLICY IF EXISTS "Mentors can update their own pending transactions" ON public.mentor_transactions;
DROP POLICY IF EXISTS "Admins can delete transactions" ON public.mentor_transactions;

-- Create comprehensive public/anon policy matching other tables
CREATE POLICY "Mentor Transactions Public Access" ON public.mentor_transactions
    FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);
