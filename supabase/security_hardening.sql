-- ==============================================================================
-- LibSync: Security Hardening Migration (SEC-01 & SEC-02)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- SEC-01: Fix Profile Role Privilege Escalation
-- ------------------------------------------------------------------------------
-- Ensure Row Level Security is Enabled on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 1. Database-Level Trigger to prevent unauthorized changes to the 'role' column
CREATE OR REPLACE FUNCTION public.prevent_profile_role_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If the role is being altered, check caller authority
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    IF NOT is_staff() THEN
      RAISE EXCEPTION 'Unauthorized: You are not permitted to change your account role.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_prevent_profile_role_escalation ON public.profiles;
CREATE TRIGGER tr_prevent_profile_role_escalation
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_profile_role_escalation();

-- 2. Update profiles RLS UPDATE policy to allow staff and user updates safely
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  auth.uid() = id OR is_staff()
)
WITH CHECK (
  auth.uid() = id OR is_staff()
);

-- ------------------------------------------------------------------------------
-- SEC-02: Remove Anonymous Reservation Grant
-- ------------------------------------------------------------------------------
-- Revoke any anonymous table-level read access on library_reservations
REVOKE SELECT ON public.library_reservations FROM anon;
REVOKE ALL ON public.library_reservations FROM anon;
