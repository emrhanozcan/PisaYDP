-- Add 'parent_payment' to transaction type check constraint
ALTER TABLE public.mentor_transactions DROP CONSTRAINT IF EXISTS mentor_transactions_type_check;
ALTER TABLE public.mentor_transactions ADD CONSTRAINT mentor_transactions_type_check CHECK (type IN ('expense', 'advance', 'payment', 'parent_payment'));






