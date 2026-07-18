
-- 1. Fix profiles.id default: auth.uid() is meaningless server-side; use gen_random_uuid()
ALTER TABLE public.profiles ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- 2. Add missing bio column (present in TypeScript types but not in DB)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio text;

-- 3. Replace handle_new_user with a robust version:
--    - Explicit search_path to prevent schema resolution issues
--    - ON CONFLICT (id) DO NOTHING prevents duplicate PK crashes on retry
--    - Includes bio as nullable from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, bio)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.email, ''),
    NEW.raw_user_meta_data->>'bio'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
