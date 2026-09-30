-- pgTAP test for RLS on public.perfiles (renamed from profiles, D-031). Run with
-- `supabase test db` (local stack).
begin;
select plan(12);

insert into auth.users (id, instance_id, aud, role, email, raw_user_meta_data)
values
  ('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'applicant@example.test', '{"rol": "postulante"}'),
  ('00000000-0000-0000-0000-0000000000c1', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'company@example.test', '{"rol": "empresa"}'),
  ('00000000-0000-0000-0000-0000000000d1', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'tampered@example.test', '{"rol": "admin"}');

select is(
  (select rol::text from public.perfiles where id = '00000000-0000-0000-0000-0000000000c1'),
  'empresa',
  'trigger keeps the company role'
);
select is(
  (select rol::text from public.perfiles where id = '00000000-0000-0000-0000-0000000000d1'),
  'postulante',
  'trigger ignores an admin role sent in user_metadata'
);
select is(
  (select email from public.perfiles where id = '00000000-0000-0000-0000-0000000000a1'),
  'applicant@example.test',
  'trigger copies the account email'
);
select ok(
  (select relrowsecurity from pg_class where oid = 'public.perfiles'::regclass),
  'RLS is enabled on perfiles'
);

update auth.users set email = 'changed@example.test' where id = '00000000-0000-0000-0000-0000000000a1';
select is(
  (select email from public.perfiles where id = '00000000-0000-0000-0000-0000000000a1'),
  'changed@example.test',
  'a changed account email is copied to perfiles'
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000a1', true);

select is(
  (select count(*)::int from public.perfiles),
  1,
  'an applicant sees exactly one profile'
);
select is(
  (select id::text from public.perfiles),
  '00000000-0000-0000-0000-0000000000a1',
  'an applicant sees only their own profile'
);
select is_empty(
  $$ select 1 from public.perfiles where id = '00000000-0000-0000-0000-0000000000c1' $$,
  'an applicant cannot read a company profile'
);
select throws_ok(
  $$ update public.perfiles set rol = 'admin' where id = '00000000-0000-0000-0000-0000000000a1' $$,
  '42501',
  null,
  'a user cannot change their own role'
);
select throws_ok(
  $$ insert into public.perfiles (id, rol, email) values ('00000000-0000-0000-0000-0000000000ff', 'admin', 'x@example.test') $$,
  '42501',
  null,
  'a user cannot insert a profile'
);

-- Promote the tampered account by hand, as the Office would (RF1.1.4).
reset role;
update public.perfiles set rol = 'admin' where id = '00000000-0000-0000-0000-0000000000d1';
delete from public.postulantes where id = '00000000-0000-0000-0000-0000000000d1';

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000d1', true);

select is(
  (select count(*)::int from public.perfiles),
  3,
  'an admin sees every profile'
);

set local role anon;
select throws_ok(
  $$ select 1 from public.perfiles $$,
  '42501',
  null,
  'anonymous users cannot read profiles'
);

select * from finish();
rollback;
