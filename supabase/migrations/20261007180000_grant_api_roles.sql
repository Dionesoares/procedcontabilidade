-- Expose public tables to PostgREST roles. RLS policies still decide
-- which rows each role can actually see or change.
-- (Supabase docs show api.<table> as an example schema; this app uses public.)

grant usage on schema public to anon, authenticated, service_role;

grant select on all tables in schema public to anon;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant all on all tables in schema public to service_role;

grant usage, select on all sequences in schema public to anon, authenticated, service_role;

grant execute on function public.is_staff() to anon, authenticated, service_role;
grant execute on function public.is_admin() to anon, authenticated, service_role;

-- Public website forms can create these rows while remaining anonymous.
grant insert on table public.contact_submissions to anon;
grant insert on table public.service_requests to anon;

alter default privileges in schema public
  grant select on tables to anon;
alter default privileges in schema public
  grant select, insert, update, delete on tables to authenticated;
alter default privileges in schema public
  grant all on tables to service_role;
