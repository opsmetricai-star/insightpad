-- Run once in the Supabase SQL editor (safe to re-run).
-- Newer Supabase projects do not auto-grant table privileges to the API roles.
-- RLS policies still decide which rows each user can touch.

grant usage on schema public to anon, authenticated, service_role;

grant select, insert, update, delete on all tables in schema public to authenticated;
grant all on all tables in schema public to service_role;
grant usage, select on all sequences in schema public to authenticated, service_role;

grant execute on all functions in schema public to authenticated, service_role;

-- The leads table is unused by the site; keep it server-only.
revoke all on public.leads from authenticated;

alter default privileges in schema public grant select, insert, update, delete on tables to authenticated;
alter default privileges in schema public grant all on tables to service_role;
alter default privileges in schema public grant execute on functions to authenticated, service_role;
