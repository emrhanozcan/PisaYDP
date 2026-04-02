-- Create Mentor Transactions Table
CREATE TABLE IF NOT EXISTS public.mentor_transactions (
    id TEXT PRIMARY KEY DEFAULT (uuid_generate_v4()::text),
    mentor_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('expense', 'advance', 'payment')),
    amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
    description TEXT,
    receipt_url TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.mentor_transactions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own transactions"
    ON public.mentor_transactions
    FOR SELECT
    USING (auth.uid()::text = mentor_id);

CREATE POLICY "Admins and general roles can view all transactions"
    ON public.mentor_transactions
    FOR SELECT
    USING (





         
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()::text AND users.role IN ('admin', 'italy_staff', 'branch_user')
        )
    );

CREATE POLICY "Mentors can insert their own expenses and advances"
    ON public.mentor_transactions
    FOR INSERT
    WITH CHECK (auth.uid()::text = mentor_id AND type IN ('expense', 'advance'));

CREATE POLICY "Admins can insert any transaction"
    ON public.mentor_transactions
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()::text AND users.role IN ('admin', 'italy_staff')
        )
    );

CREATE POLICY "Admins can update transactions"
    ON public.mentor_transactions
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()::text AND users.role IN ('admin', 'italy_staff')
        )
    );

CREATE POLICY "Mentors can update their own pending transactions"
    ON public.mentor_transactions
    FOR UPDATE
    USING (auth.uid()::text = mentor_id AND status = 'pending');

CREATE POLICY "Admins can delete transactions"
    ON public.mentor_transactions
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()::text AND users.role IN ('admin', 'italy_staff')
        )
    );

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION set_mentor_transactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS mentor_transactions_updated_at_trigger ON public.mentor_transactions;
CREATE TRIGGER mentor_transactions_updated_at_trigger
    BEFORE UPDATE ON public.mentor_transactions
    FOR EACH ROW
    EXECUTE PROCEDURE set_mentor_transactions_updated_at();
