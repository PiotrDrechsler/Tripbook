-- Migration: Disable RLS on trips table for development
-- Purpose: Temporarily disable Row Level Security to allow development without authentication
-- Affected tables: trips
-- Special considerations:
--   - This removes all security restrictions from the trips table
--   - Use ONLY in development environment
--   - TODO: Re-enable RLS when authentication is implemented
--   - When re-enabling, create appropriate policies for authenticated users

-- disable row level security on trips table
-- this allows all operations (select, insert, update, delete) without authentication
-- WARNING: This makes the table completely public - not suitable for production!
alter table public.trips disable row level security;

-- note: when you're ready to implement authentication, you should:
-- 1. Re-enable RLS: alter table public.trips enable row level security;
-- 2. Create policies that check auth.uid() for authenticated users
-- 3. Update the tripService.ts to use actual user_id from session instead of placeholder

