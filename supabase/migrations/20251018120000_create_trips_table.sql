-- Migration: Create trips table
-- Purpose: Create the main trips table to store user trip information
-- Affected tables: trips
-- Special considerations:
--   - Enforces CASCADE deletion when user is removed
--   - Validates map_url to ensure it contains 'mapy.com'
--   - Implements Row Level Security (RLS) for data access control
--   - Users can only access their own trips

-- create trips table
create table public.trips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  name varchar(100) not null,
  description text,
  map_url text not null,
  trip_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  
  -- foreign key constraint: links trips to auth.users
  -- on delete cascade ensures that when a user is deleted, all their trips are also deleted
  constraint fk_trips_user_id 
    foreign key (user_id) 
    references auth.users(id) 
    on delete cascade,
  
  -- check constraint: ensures map_url contains 'mapy.com'
  -- this validates that only valid map URLs from the expected domain are stored
  constraint chk_trips_map_url 
    check (map_url like '%mapy.com%')
);

-- create index on user_id for faster queries
-- this b-tree index significantly improves performance when retrieving trips for a specific user
create index idx_trips_user_id on public.trips(user_id);

-- enable row level security (rls)
-- this ensures that database-level security is enforced for all queries
alter table public.trips enable row level security;

-- rls policy: allow authenticated users to select their own trips
-- rationale: users should only be able to view trips they have created
-- this policy filters trips based on the authenticated user's id
create policy "authenticated users can select their own trips"
  on public.trips
  for select
  to authenticated
  using (auth.uid() = user_id);

-- rls policy: allow authenticated users to insert their own trips
-- rationale: authenticated users should be able to create new trips
-- this policy ensures that the user_id matches the authenticated user's id
create policy "authenticated users can insert their own trips"
  on public.trips
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- rls policy: allow authenticated users to update their own trips
-- rationale: users should only be able to modify trips they have created
-- this policy filters trips based on the authenticated user's id
create policy "authenticated users can update their own trips"
  on public.trips
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- rls policy: allow authenticated users to delete their own trips
-- rationale: users should only be able to delete trips they have created
-- this policy filters trips based on the authenticated user's id
create policy "authenticated users can delete their own trips"
  on public.trips
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- rls policy: deny anonymous users from selecting trips
-- rationale: trips are private data and should not be accessible to unauthenticated users
-- this policy explicitly denies access to anonymous users
create policy "anonymous users cannot select trips"
  on public.trips
  for select
  to anon
  using (false);

-- rls policy: deny anonymous users from inserting trips
-- rationale: only authenticated users should be able to create trips
-- this policy explicitly denies insert access to anonymous users
create policy "anonymous users cannot insert trips"
  on public.trips
  for insert
  to anon
  with check (false);

-- rls policy: deny anonymous users from updating trips
-- rationale: only authenticated users should be able to modify trips
-- this policy explicitly denies update access to anonymous users
create policy "anonymous users cannot update trips"
  on public.trips
  for update
  to anon
  using (false);

-- rls policy: deny anonymous users from deleting trips
-- rationale: only authenticated users should be able to delete trips
-- this policy explicitly denies delete access to anonymous users
create policy "anonymous users cannot delete trips"
  on public.trips
  for delete
  to anon
  using (false);

