-- pgTAP test for RLS on public.profiles. Run with `supabase test db` (local stack).
begin;
select plan(9);

insert into auth.users (id, instance_id, aud, role, email, raw_user_meta_data)
values
  ('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'applicant@example.test', '{"role": "applicant"}'),
  ('00000000-0000-0000-0000-0000000000c1', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'company@example.test', '{"role": "company"}'),
  ('00000000-0000-0000-0000-0000000000d1', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'tampered@example.test', '{"role": "admin"}');

select is(
  (select role::text from public.profiles where id = '00000000-0000-0000-0000-0000000000c1'),
  'company',
  'trigger keeps the company role'
);
select is(
  (select role::text from public.profiles where id = '00000000-0000-0000-0000-0000000000d1'),
  'applicant',
  'trigger ignores an admin role sent in user_metadata'
);

select ok(
  (select relrowsecurity from pg_class where oid = 'public.profiles'::regclass),
  'RLS is enabled on profiles'
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000a1', true);

select is(
  (select count(*)::int from public.profiles),
  1,
  'an applicant sees exactly one profile'
);
select is(
  (select id::text from public.profiles),
  '00000000-0000-0000-0000-0000000000a1',
  'an applicant sees only their own profile'
);
select is_empty(
  $$ select 1 from public.profiles where id = '00000000-0000-0000-0000-0000000000c1' $$,
  'an applicant cannot read a company profile'
);
select throws_ok(
  $$ update public.profiles set role = 'admin' where id = '00000000-0000-0000-0000-0000000000a1' $$,
  '42501',
  null,
  'a user cannot change their own role'
);
select throws_ok(
  $$ insert into public.profiles (id, role) values ('00000000-0000-0000-0000-0000000000ff', 'admin') $$,
  '42501',
  null,
  'a user cannot insert a profile'
);

set local role anon;
select throws_ok(
  $$ select 1 from public.profiles $$,
  '42501',
  null,
  'anonymous users cannot read profiles'
);

select * from finish();
rollback;
