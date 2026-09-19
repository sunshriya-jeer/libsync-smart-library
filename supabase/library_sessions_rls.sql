-- ==============================================================================
-- LibSync: Library Sessions Row Level Security (RLS) & Permissions
-- ==============================================================================

-- 1. Table Grants for public.library_sessions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.library_sessions TO authenticated;

-- 2. Ensure Row Level Security is Enabled
ALTER TABLE public.library_sessions ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing/restrictive SELECT policies
DROP POLICY IF EXISTS "Allow staff and session owner read access" ON public.library_sessions;
DROP POLICY IF EXISTS "Allow staff and linked students read access" ON public.library_sessions;
DROP POLICY IF EXISTS "Students can view own sessions" ON public.library_sessions;
DROP POLICY IF EXISTS "Users can view own sessions" ON public.library_sessions;
DROP POLICY IF EXISTS "Staff can view all sessions" ON public.library_sessions;
DROP POLICY IF EXISTS "Allow authenticated read access" ON public.library_sessions;

-- 4. Create SELECT Policy: Authenticated staff (admin/librarian) have full read access;
--    Students have read access ONLY to their own linked session records.
CREATE POLICY "Allow staff and session owner read access"
ON public.library_sessions
FOR SELECT
TO authenticated
USING (
  is_staff() OR student_id IN (
    SELECT id FROM public.students WHERE profile_id = auth.uid()
  )
);

-- 5. Create INSERT Policy: Staff can create sessions for students; students can insert their own.
DROP POLICY IF EXISTS "Allow staff and session owner insert access" ON public.library_sessions;
CREATE POLICY "Allow staff and session owner insert access"
ON public.library_sessions
FOR INSERT
TO authenticated
WITH CHECK (
  is_staff() OR student_id IN (
    SELECT id FROM public.students WHERE profile_id = auth.uid()
  )
);

-- 6. Create UPDATE Policy: Staff can update sessions (e.g., checkout/exit_time); students can update their own.
DROP POLICY IF EXISTS "Allow staff and session owner update access" ON public.library_sessions;
CREATE POLICY "Allow staff and session owner update access"
ON public.library_sessions
FOR UPDATE
TO authenticated
USING (
  is_staff() OR student_id IN (
    SELECT id FROM public.students WHERE profile_id = auth.uid()
  )
)
WITH CHECK (
  is_staff() OR student_id IN (
    SELECT id FROM public.students WHERE profile_id = auth.uid()
  )
);
