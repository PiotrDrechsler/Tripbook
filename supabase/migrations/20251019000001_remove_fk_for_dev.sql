-- Migration: Remove foreign key constraint for development
-- Purpose: Temporarily remove FK constraint to allow development without user authentication
-- Affected tables: trips
-- Special considerations:
--   - This removes referential integrity between trips and auth.users
--   - Use ONLY in development environment
--   - TODO: Re-add constraint when authentication is implemented
--   - When re-adding, ensure all trips have valid user_id references

-- drop foreign key constraint on trips.user_id
-- this allows inserting trips without requiring a valid user in auth.users
-- WARNING: This breaks referential integrity - not suitable for production!
alter table public.trips 
  drop constraint if exists fk_trips_user_id;

-- note: when you're ready to implement authentication, you should:
-- 1. Clean up any trips with invalid user_id
-- 2. Re-add the constraint:
--    alter table public.trips
--      add constraint fk_trips_user_id
--      foreign key (user_id)
--      references auth.users(id)
--      on delete cascade;
-- 3. Update the tripService.ts to use actual user_id from session

