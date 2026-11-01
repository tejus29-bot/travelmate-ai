-- ============================================================
-- TravelMate AI - Migration 002: Security Hardening Patch
-- ============================================================
-- Purpose:
--   1. Harden SECURITY DEFINER search_path on user creation trigger.
--   2. Enforce strict immutability of itinerary-to-trip relationship (trip_id).
--   3. Add explicit WITH CHECK clauses to all UPDATE policies to prevent ownership tampering.
--   4. Preserve intentional public trip-sharing functionality.
--
-- Note: Safe to execute on existing databases with zero downtime.
-- ============================================================

-- ============================================================
-- 1. SECURITY DEFINER SEARCH PATH HARDENING
-- ============================================================
-- Problem: Without an explicit search_path, a SECURITY DEFINER function
-- runs with elevated privileges using whatever search path was set by the caller,
-- which could allow schema-poisoning attacks.
-- Fix: Force search_path to strictly use 'public' and 'pg_temp'.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$;

-- ============================================================
-- 2. PREVENT ITINERARY TRIP_ID MUTATION
-- ============================================================
-- Problem: An existing itinerary should never have its parent trip_id changed.
-- Allowing trip_id modification on UPDATE could allow an attacker or buggy client
-- to reassign itineraries between different trips.
-- Fix: A BEFORE UPDATE trigger that rejects any change to trip_id.

CREATE OR REPLACE FUNCTION public.prevent_itinerary_trip_id_change()
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
    IF NEW.trip_id <> OLD.trip_id THEN
        RAISE EXCEPTION 'Security violation: The trip_id of an itinerary is immutable and cannot be changed.';
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_itinerary_trip_id_change ON public.itineraries;

CREATE TRIGGER trg_prevent_itinerary_trip_id_change
    BEFORE UPDATE ON public.itineraries
    FOR EACH ROW 
    EXECUTE FUNCTION public.prevent_itinerary_trip_id_change();

-- ============================================================
-- 3. HARDEN USERS UPDATE POLICY (WITH CHECK)
-- ============================================================
-- Problem: The original UPDATE policy had USING (auth.uid() = id) but lacked
-- an explicit WITH CHECK clause.
-- Fix: Recreate with both USING (qualifies existing row) and WITH CHECK (verifies updated row).

DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;

CREATE POLICY "Users can update their own profile"
    ON public.users 
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- ============================================================
-- 4. HARDEN TRIPS UPDATE POLICY (WITH CHECK)
-- ============================================================
-- Problem: The original UPDATE policy lacked an explicit WITH CHECK clause.
-- A user must never be able to transfer trip ownership to another user_id.
-- Fix: Explicitly enforce auth.uid() = user_id on both the current and resulting row.

DROP POLICY IF EXISTS "Users can update their own trips" ON public.trips;

CREATE POLICY "Users can update their own trips"
    ON public.trips 
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 5. HARDEN ITINERARIES UPDATE POLICY (WITH CHECK)
-- ============================================================
-- Problem: The original UPDATE policy lacked an explicit WITH CHECK clause.
-- Fix: Recreate with both USING and WITH CHECK to guarantee the updated row
-- still links to a trip owned by the authenticated user.

DROP POLICY IF EXISTS "Users can update itineraries for their trips" ON public.itineraries;

CREATE POLICY "Users can update itineraries for their trips"
    ON public.itineraries 
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.trips
            WHERE trips.id = itineraries.trip_id
            AND trips.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.trips
            WHERE trips.id = itineraries.trip_id
            AND trips.user_id = auth.uid()
        )
    );

-- ============================================================
-- 6. VERIFICATION QUERY (Run to verify all active policies)
-- ============================================================
-- You can run this SELECT query in Supabase to inspect all your hardened policies:
--
-- SELECT 
--     schemaname,
--     tablename,
--     policyname,
--     permissive,
--     roles,
--     cmd,
--     qual AS using_expression,
--     with_check AS with_check_expression
-- FROM pg_policies
-- WHERE schemaname = 'public'
-- ORDER BY tablename, policyname;
