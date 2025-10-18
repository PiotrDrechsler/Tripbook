-- Migration: Disable all RLS policies on trips table
-- Purpose: Remove all Row Level Security policies from the trips table
-- Affected tables: trips
-- Special considerations:
--   - This will drop all existing policies but keep RLS enabled on the table
--   - The table will effectively be inaccessible until new policies are created
--   - Consider creating new policies immediately after this migration

-- drop rls policy: authenticated users can select their own trips
-- this removes the policy that allowed authenticated users to view their own trips
drop policy if exists "authenticated users can select their own trips" on public.trips;

-- drop rls policy: authenticated users can insert their own trips
-- this removes the policy that allowed authenticated users to create new trips
drop policy if exists "authenticated users can insert their own trips" on public.trips;

-- drop rls policy: authenticated users can update their own trips
-- this removes the policy that allowed authenticated users to modify their own trips
drop policy if exists "authenticated users can update their own trips" on public.trips;

-- drop rls policy: authenticated users can delete their own trips
-- this removes the policy that allowed authenticated users to delete their own trips
drop policy if exists "authenticated users can delete their own trips" on public.trips;

-- drop rls policy: anonymous users cannot select trips
-- this removes the explicit deny policy for anonymous users trying to view trips
drop policy if exists "anonymous users cannot select trips" on public.trips;

-- drop rls policy: anonymous users cannot insert trips
-- this removes the explicit deny policy for anonymous users trying to create trips
drop policy if exists "anonymous users cannot insert trips" on public.trips;

-- drop rls policy: anonymous users cannot update trips
-- this removes the explicit deny policy for anonymous users trying to modify trips
drop policy if exists "anonymous users cannot update trips" on public.trips;

-- drop rls policy: anonymous users cannot delete trips
-- this removes the explicit deny policy for anonymous users trying to delete trips
drop policy if exists "anonymous users cannot delete trips" on public.trips;

-- note: row level security (rls) remains enabled on the table
-- without any policies, no rows will be accessible to any role
-- you will need to create new policies or disable rls entirely to access the table

