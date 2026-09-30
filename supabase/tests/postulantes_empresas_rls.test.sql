-- pgTAP test for RLS on public.postulantes and public.empresas (D-032). Run
-- with `supabase test db` (local stack).
begin;
select plan(15);

insert into auth.users (id, instance_id, aud, role, email, raw_user_meta_data)
values
  ('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'applicant1@example.test', '{}'),
  ('00000000-0000-0000-0000-0000000000a2', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'applicant2@example.test', '{}'),
  ('00000000-0000-0000-0000-0000000000c1', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'company@example.test', '{"rol": "empresa"}'),
  ('00000000-0000-0000-0000-0000000000d1', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'office@example.test', '{}');

update public.perfiles set rol = 'admin' where id = '00000000-0000-0000-0000-0000000000d1';
delete from public.postulantes where id = '00000000-0000-0000-0000-0000000000d1';

select isnt_empty(
  $$ select 1 from public.postulantes where id = '00000000-0000-0000-0000-0000000000a1' $$,
  'signing up as an applicant creates the postulantes row'
);
select isnt_empty(
  $$ select 1 from public.empresas where id = '00000000-0000-0000-0000-0000000000c1' $$,
  'signing up as a company creates the empresas row'
);
select is_empty(
  $$ select 1 from public.postulantes where id = '00000000-0000-0000-0000-0000000000c1' $$,
  'a company has no postulantes row'
);

-- Applicant
set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000a1', true);

select is(
  (select count(*)::int from public.postulantes),
  1,
  'an applicant sees only their own row'
);
select lives_ok(
  $$ update public.postulantes set nombre = 'Nombre', apellido = 'Ficticio', telefono = '341 555-0000', dni = '30111222'
     where id = '00000000-0000-0000-0000-0000000000a1' $$,
  'an applicant can fill in their own data'
);
select is_empty(
  $$ update public.postulantes set nombre = 'Otro' where id = '00000000-0000-0000-0000-0000000000a2' returning id $$,
  'an applicant cannot change another applicant'
);
select throws_ok(
  $$ update public.postulantes
     set cv_ruta = '00000000-0000-0000-0000-0000000000a2/cv.pdf', cv_nombre = 'cv.pdf', cv_tamano_bytes = 10, cv_subido_el = now()
     where id = '00000000-0000-0000-0000-0000000000a1' $$,
  '23514',
  null,
  'an applicant cannot point their CV to another applicant''s file'
);
select throws_ok(
  $$ update public.postulantes set cv_ruta = '00000000-0000-0000-0000-0000000000a1/cv.pdf'
     where id = '00000000-0000-0000-0000-0000000000a1' $$,
  '23514',
  null,
  'the CV columns are set all together'
);
select is_empty(
  $$ select 1 from public.empresas $$,
  'an applicant cannot read companies'
);

-- Company
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000c1', true);

select is_empty(
  $$ select 1 from public.postulantes $$,
  'a company cannot read applicants'
);
select lives_ok(
  $$ update public.empresas set razon_social = 'Empresa Ficticia', cuit = '30-71234567-1'
     where id = '00000000-0000-0000-0000-0000000000c1' $$,
  'a company can fill in its own data'
);
select throws_ok(
  $$ update public.empresas set cuit = '30712345671' where id = '00000000-0000-0000-0000-0000000000c1' $$,
  '23514',
  null,
  'the CUIT is saved with dashes'
);

-- Office
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000d1', true);

select is(
  (select count(*)::int from public.postulantes),
  2,
  'an admin sees every applicant'
);
select is(
  (select count(*)::int from public.empresas),
  1,
  'an admin sees every company'
);

set local role anon;
select throws_ok(
  $$ select 1 from public.postulantes $$,
  '42501',
  null,
  'anonymous users cannot read applicants'
);

select * from finish();
rollback;
