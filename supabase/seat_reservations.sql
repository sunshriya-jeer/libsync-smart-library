-- ==============================================================================
-- LibSync: Seat Reservations Schema, RLS, and Atomic RPC Functions
-- ==============================================================================

-- 1. Update seats_status_check on public.seats to allow 'reserved'
ALTER TABLE public.seats DROP CONSTRAINT IF EXISTS seats_status_check;

ALTER TABLE public.seats ADD CONSTRAINT seats_status_check
  CHECK (status IN ('free', 'occupied', 'maintenance', 'reserved'));

-- 2. Table Grants for public.library_reservations
GRANT SELECT, INSERT, UPDATE, DELETE ON public.library_reservations TO authenticated;
GRANT SELECT ON public.library_reservations TO anon;

-- 3. Row Level Security Policies on public.library_reservations
ALTER TABLE public.library_reservations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow staff and reservation owner read access" ON public.library_reservations;
CREATE POLICY "Allow staff and reservation owner read access"
ON public.library_reservations
FOR SELECT
TO authenticated
USING (
  is_staff() OR student_id IN (
    SELECT id FROM public.students WHERE profile_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Allow students and staff to insert reservation" ON public.library_reservations;
CREATE POLICY "Allow students and staff to insert reservation"
ON public.library_reservations
FOR INSERT
TO authenticated
WITH CHECK (
  is_staff() OR student_id IN (
    SELECT id FROM public.students WHERE profile_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Allow students and staff to update reservation" ON public.library_reservations;
CREATE POLICY "Allow students and staff to update reservation"
ON public.library_reservations
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

-- Allow staff full seat update access, and linked students to update only the seat in their active reservation
DROP POLICY IF EXISTS "Allow authenticated to update seat status for reservations" ON public.seats;
DROP POLICY IF EXISTS "Allow staff and reserving student to update seat status" ON public.seats;
CREATE POLICY "Allow staff and reserving student to update seat status"
ON public.seats
FOR UPDATE
TO authenticated
USING (
  is_staff() OR id IN (
    SELECT seat_id FROM public.library_reservations
    WHERE student_id IN (
      SELECT id FROM public.students WHERE profile_id = auth.uid()
    )
    AND status = 'reserved'
  )
)
WITH CHECK (
  status IN ('free', 'occupied', 'reserved', 'maintenance')
  AND (
    is_staff() OR id IN (
      SELECT seat_id FROM public.library_reservations
      WHERE student_id IN (
        SELECT id FROM public.students WHERE profile_id = auth.uid()
      )
      AND status = 'reserved'
    )
  )
);

-- 3. Atomic Database RPC: Create a seat reservation
CREATE OR REPLACE FUNCTION public.create_student_seat_reservation(
  p_student_id uuid,
  p_seat_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_seat public.seats%ROWTYPE;
  v_existing_res public.library_reservations%ROWTYPE;
  v_existing_session public.library_sessions%ROWTYPE;
  v_new_res public.library_reservations%ROWTYPE;
  v_caller_id uuid := auth.uid();
  v_is_authorized boolean := false;
BEGIN
  -- 1. Verify authenticated user
  IF v_caller_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'code', 'UNAUTHENTICATED',
      'error', 'Authentication required. Please sign in.'
    );
  END IF;

  -- 2. Authorization check: caller must be staff or the student whose profile matches p_student_id
  IF is_staff() THEN
    v_is_authorized := true;
  ELSIF EXISTS (SELECT 1 FROM public.students WHERE id = p_student_id AND profile_id = v_caller_id) THEN
    v_is_authorized := true;
  END IF;

  IF NOT v_is_authorized THEN
    RETURN jsonb_build_object(
      'success', false,
      'code', 'FORBIDDEN',
      'error', 'You are not authorized to create a reservation for this student.'
    );
  END IF;

  -- 3. Check student active session in library_sessions (student already inside)
  SELECT * INTO v_existing_session
  FROM public.library_sessions
  WHERE student_id = p_student_id AND status = 'active'
  LIMIT 1;

  IF FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'code', 'ALREADY_INSIDE',
      'error', 'You currently have an active study session inside the library. Reservations are only for students outside.'
    );
  END IF;

  -- 4. Check existing active reservation for student
  SELECT * INTO v_existing_res
  FROM public.library_reservations
  WHERE student_id = p_student_id
    AND status = 'reserved'
    AND (expires_at IS NULL OR expires_at > now())
  LIMIT 1;

  IF FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'code', 'ALREADY_HAS_RESERVATION',
      'error', 'You already have an active seat reservation. Please use or cancel your existing reservation before creating a new one.'
    );
  END IF;

  -- 5. Lock seat row exclusively to prevent race conditions
  SELECT * INTO v_seat
  FROM public.seats
  WHERE id = p_seat_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'code', 'SEAT_NOT_FOUND',
      'error', 'The requested seat could not be found.'
    );
  END IF;

  IF v_seat.status <> 'free' THEN
    RETURN jsonb_build_object(
      'success', false,
      'code', 'SEAT_NOT_AVAILABLE',
      'error', 'Seat ' || v_seat.seat_number || ' is no longer available (status: ' || v_seat.status || '). Please choose another seat.'
    );
  END IF;

  -- 6. Insert new reservation (30 minutes expiry window)
  INSERT INTO public.library_reservations (
    student_id,
    seat_id,
    reserved_at,
    expires_at,
    status
  ) VALUES (
    p_student_id,
    p_seat_id,
    now(),
    now() + interval '30 minutes',
    'reserved'
  ) RETURNING * INTO v_new_res;

  -- 7. Update seat status to reserved
  UPDATE public.seats
  SET
    status = 'reserved',
    updated_at = now()
  WHERE id = p_seat_id;

  RETURN jsonb_build_object(
    'success', true,
    'reservation', jsonb_build_object(
      'id', v_new_res.id,
      'student_id', v_new_res.student_id,
      'seat_id', v_new_res.seat_id,
      'reserved_at', v_new_res.reserved_at,
      'expires_at', v_new_res.expires_at,
      'status', v_new_res.status,
      'created_at', v_new_res.created_at
    ),
    'seat', jsonb_build_object(
      'id', v_seat.id,
      'seat_number', v_seat.seat_number,
      'section', v_seat.section,
      'status', 'reserved'
    )
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_student_seat_reservation(uuid, uuid) TO authenticated;

-- 4. Atomic Database RPC: Cancel student seat reservation
CREATE OR REPLACE FUNCTION public.cancel_student_seat_reservation(
  p_reservation_id uuid,
  p_student_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_res public.library_reservations%ROWTYPE;
BEGIN
  SELECT * INTO v_res
  FROM public.library_reservations
  WHERE id = p_reservation_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'code', 'NOT_FOUND',
      'error', 'Reservation not found.'
    );
  END IF;

  IF v_res.student_id <> p_student_id AND NOT is_staff() THEN
    RETURN jsonb_build_object(
      'success', false,
      'code', 'FORBIDDEN',
      'error', 'You are not authorized to cancel this reservation.'
    );
  END IF;

  IF v_res.status = 'reserved' THEN
    UPDATE public.library_reservations
    SET
      status = 'cancelled',
      cancelled_at = now()
    WHERE id = p_reservation_id;

    UPDATE public.seats
    SET
      status = 'free',
      updated_at = now()
    WHERE id = v_res.seat_id AND status = 'reserved';
  END IF;

  RETURN jsonb_build_object('success', true);
END;
$$;

GRANT EXECUTE ON FUNCTION public.cancel_student_seat_reservation(uuid, uuid) TO authenticated;

-- 5. Atomic Database RPC: Expire a seat reservation
CREATE OR REPLACE FUNCTION public.expire_student_seat_reservation(
  p_reservation_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_res public.library_reservations%ROWTYPE;
BEGIN
  SELECT * INTO v_res
  FROM public.library_reservations
  WHERE id = p_reservation_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'code', 'NOT_FOUND',
      'error', 'Reservation not found.'
    );
  END IF;

  IF v_res.status = 'reserved' THEN
    UPDATE public.library_reservations
    SET
      status = 'expired'
    WHERE id = p_reservation_id;

    UPDATE public.seats
    SET
      status = 'free',
      updated_at = now()
    WHERE id = v_res.seat_id AND status = 'reserved';
  END IF;

  RETURN jsonb_build_object('success', true);
END;
$$;

GRANT EXECUTE ON FUNCTION public.expire_student_seat_reservation(uuid) TO authenticated;
