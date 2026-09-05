-- Stores a service-specific price for each mentor/student assignment.
ALTER TABLE public.mentor_assignments
ADD COLUMN IF NOT EXISTS service_prices jsonb NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.mentor_assignments.service_prices IS
'Map of service_type ID to the mentor-specific price for this student assignment';

-- Preserve current behaviour for existing assignments by copying global prices.
UPDATE public.mentor_assignments AS assignment
SET service_prices = COALESCE((
    SELECT jsonb_object_agg(service_type.id::text, service_type.unit_price)
    FROM public.service_types AS service_type
    WHERE service_type.id::text = ANY(assignment.allowed_service_ids)
), '{}'::jsonb)
WHERE assignment.service_prices = '{}'::jsonb
  AND assignment.allowed_service_ids IS NOT NULL;

ALTER TABLE public.mentor_assignments
DROP CONSTRAINT IF EXISTS mentor_assignments_service_prices_is_object;

ALTER TABLE public.mentor_assignments
ADD CONSTRAINT mentor_assignments_service_prices_is_object
CHECK (jsonb_typeof(service_prices) = 'object');
