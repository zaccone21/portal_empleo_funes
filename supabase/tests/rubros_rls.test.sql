-- pgTAP test for public.rubros and RLS on public.postulante_rubros (D-032).
-- Run with `supabase test db` (local stack).
begin;
select plan(10);

insert into auth.users (id, instance_id, aud, role, email, raw_user_meta_data)
values
  ('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'applicant1@example.test', '{}'),
  ('00000000-0000-0000-0000-0000000000a2', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'applicant2@example.test', '{}'),
  ('00000000-0000-0000-0000-0000000000c1', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'company@example.test', '{"rol": "empresa"}'),
  ('00000000-0000-0000-0000-0000000000d1', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'office@example.test', '{}');

update public.perfiles set rol = 'admin' where id = '00000000-0000-0000-0000-0000000000d1';
delete from public.postulantes where id = '00000000-0000-0000-0000-0000000000d1';

insert into public.postulante_rubros (postulante_id, rubro_id)
select '00000000-0000-0000-0000-0000000000a2', id from public.rubros where slug = 'limpieza';

select is(
  (select count(*)::int from public.rubros),
  11,
  'the provisional list of 11 trades is loaded'
);

set local role anon;
select is(
  (select count(*)::int from public.rubros),
  11,
  'anonymous users can read the trades (catalog filter)'
);

-- Applicant
set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000a1', true);

select throws_ok(
  $$ insert into public.rubros (slug, nombre) values ('nuevo', 'Nuevo') $$,
  '42501',
  null,
  'nobody adds trades from the app'
);
select lives_ok(
  $$ insert into public.postulante_rubros (postulante_id, rubro_id)
     select '00000000-0000-0000-0000-0000000000a1', id from public.rubros where slug in ('gastronomia', 'transporte') $$,
  'an applicant can pick several trades'
);
select throws_ok(
  $$ insert into public.postulante_rubros (postulante_id, rubro_id)
     select '00000000-0000-0000-0000-0000000000a2', id from public.rubros where slug = 'comercio' $$,
  '42501',
  null,
  'an applicant cannot pick trades for someone else'
);
select is(
  (select count(*)::int from public.postulante_rubros),
  2,
  'an applicant sees only their own trades'
);
select lives_ok(
  $$ delete from public.postulante_rubros
     where postulante_id = '00000000-0000-0000-0000-0000000000a1'
       and rubro_id = (select id from public.rubros where slug = 'transporte') $$,
  'an applicant can remove one of their trades'
);

-- Company
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000c1', true);

select is_empty(
  $$ select 1 from public.postulante_rubros $$,
  'a company cannot read the applicants'' trades'
);
select throws_ok(
  $$ insert into public.postulante_rubros (postulante_id, rubro_id)
     select '00000000-0000-0000-0000-0000000000c1', id from public.rubros where slug = 'comercio' $$,
  '23503',
  null,
  'a company cannot use the applicants'' trades table'
);

-- Office
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000d1', true);

select is(
  (select count(*)::int from public.postulante_rubros),
  2,
  'an admin sees the trades of every applicant'
);

select * from finish();
rollback;
