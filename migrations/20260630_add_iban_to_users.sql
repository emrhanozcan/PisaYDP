-- Migration: Add IBAN column to users table
-- Date: 2026-06-30

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS iban TEXT;
