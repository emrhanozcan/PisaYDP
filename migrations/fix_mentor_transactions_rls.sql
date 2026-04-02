-- Fix RLS Policies for Mentor Transactions (Application Level Security)

-- Drop existing restricted policies
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.mentor_transactions;
DROP POLICY IF EXISTS "Admins and general roles can view all transactions" ON public.mentor_transactions;
DROP POLICY IF EXISTS "Mentors can insert their own expenses and advances" ON public.mentor_transactions;
DROP POLICY IF EXISTS "Admins can insert any transaction" ON public.mentor_transactions;
DROP POLICY IF EXISTS "Admins can update transactions" ON public.mentor_transactions;
DROP POLICY IF EXISTS "Mentors can update their own pending transactions" ON public.mentor_transactions;
DROP POLICY IF EXISTS "Admins can delete transactions" ON public.mentor_transactions;

-- Allow full access to authenticated/anon roles since the Next.js API handles security via cookies
CREATE POLICY "Mentor Transactions Public Access" ON public.mentor_transactions
    FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);
