-- ==============================================================================
-- LibSync: Student Account <-> Student Record Linking & Security Configuration
-- ==============================================================================

-- 1. Secure Database RPC for linking an authenticated user to an existing student record
CREATE OR REPLACE FUNCTION public.link_student_account(
  p_student_id text,
  p_college_barcode text,
  p_full_name text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_student public.students%ROWTYPE;
BEGIN
  -- 1. Ensure caller is authenticated
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'code', 'UNAUTHENTICATED',
      'error', 'Authentication required. Please sign in.'
    );
  END IF;

  -- 2. Verify caller is not already linked to a student record
  IF EXISTS (SELECT 1 FROM public.students WHERE profile_id = v_user_id) THEN
    RETURN jsonb_build_object(
      'success', false,
      'code', 'ACCOUNT_ALREADY_LINKED',
      'error', 'This account is already linked to another student record.'
    );
  END IF;

  -- 3. Search for student by Student ID / PRN (case-insensitive trim)
  SELECT * INTO v_student
  FROM public.students
  WHERE LOWER(TRIM(student_id)) = LOWER(TRIM(p_student_id));

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'code', 'STUDENT_NOT_FOUND',
      'error', 'No library record found matching Student ID ' || quote_literal(p_student_id) || '. Please verify with the library desk.'
    );
  END IF;

  -- 4. Verify college barcode matches existing library record
  IF v_student.college_barcode IS NULL OR TRIM(v_student.college_barcode) <> TRIM(p_college_barcode) THEN
    RETURN jsonb_build_object(
      'success', false,
      'code', 'BARCODE_MISMATCH',
      'error', 'The college barcode provided does not match the library record on file for this Student ID.'
    );
  END IF;

  -- 5. Verify student status is active
  IF v_student.status <> 'active' THEN
    RETURN jsonb_build_object(
      'success', false,
      'code', 'STUDENT_INACTIVE',
      'error', 'This student record is currently marked inactive. Please visit the library circulation desk.'
    );
  END IF;

  -- 6. Verify record is not already claimed
  IF v_student.profile_id IS NOT NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'code', 'STUDENT_ALREADY_LINKED',
      'error', 'This student record is already linked to an existing account.'
    );
  END IF;

  -- 7. Ensure corresponding profile row exists in public.profiles with role = 'student'
  INSERT INTO public.profiles (id, role, full_name)
  VALUES (
    v_user_id,
    'student',
    COALESCE(NULLIF(TRIM(p_full_name), ''), v_student.full_name)
  )
  ON CONFLICT (id) DO UPDATE
  SET
    role = 'student',
    full_name = COALESCE(NULLIF(TRIM(p_full_name), ''), public.profiles.full_name, v_student.full_name);

  -- 8. Link student record by setting profile_id
  UPDATE public.students
  SET
    profile_id = v_user_id,
    updated_at = now()
  WHERE id = v_student.id;

  RETURN jsonb_build_object(
    'success', true,
    'student_id', v_student.student_id,
    'full_name', v_student.full_name
  );
END;
$$;

-- Grant execution to authenticated users
GRANT EXECUTE ON FUNCTION public.link_student_account(text, text, text) TO authenticated;

-- 2. Row Level Security Policies on public.students
-- Enable RLS (already enabled, safe to ensure)
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- Drop legacy or conflicting SELECT policies
DROP POLICY IF EXISTS "Allow staff and linked students read access" ON public.students;
DROP POLICY IF EXISTS "Staff can view all students" ON public.students;
DROP POLICY IF EXISTS "Users can view student records" ON public.students;

-- Allow staff full view, and students view of ONLY their own linked record:
CREATE POLICY "Allow staff and linked students read access"
ON public.students
FOR SELECT
TO authenticated
USING (
  is_staff() OR profile_id = auth.uid()
);

-- NOTE: Keep existing staff-only INSERT/UPDATE/DELETE policies on public.students intact.
-- Students are never granted direct UPDATE privileges on public.students.

-- 3. Row Level Security Policies on public.profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() = id OR is_staff()
);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = id
);

-- Database-level protection against profile role tampering
CREATE OR REPLACE FUNCTION public.prevent_profile_role_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
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
