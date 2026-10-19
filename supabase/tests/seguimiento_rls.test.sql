-- pgTAP test for the follow-up columns of public.postulaciones and for
-- public.derivaciones_curso (D-044 to D-047, D-054). Run with
-- `supabase test db` (local stack).
begin;
select plan(17);

insert into auth.users (id, instance_id, aud, role, email, raw_user_meta_data)
values
  ('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'applicant1@example.test', '{}'),
  ('00000000-0000-0000-0000-0000000000c1', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'company@example.test', '{"rol": "empresa"}'),
  ('00000000-0000-0000-0000-0000000000d1', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'office@example.test', '{}');

update public.perfiles set rol = 'admin' where id = '00000000-0000-0000-0000-0000000000d1';
delete from public.postulantes where id = '00000000-0000-0000-0000-0000000000d1';

insert into public.ofertas (id, empresa_id, titulo, descripcion, requisitos, lugar, jornada, estado, publicada_el)
values
  ('00000000-0000-0000-0000-00000000f001', '00000000-0000-0000-0000-0000000000c1', 'Puesto uno', 'Tareas', 'Requisitos', 'Centro', 'Mañana', 'publicada', now()),
  ('00000000-0000-0000-0000-00000000f002', '00000000-0000-0000-0000-0000000000c1', 'Puesto dos', 'Tareas', 'Requisitos', 'Centro', 'Mañana', 'publicada', now());

-- Fixtures written by the owner: e001 will be referred, e002 is never referred.
insert into public.postulaciones (id, postulante_id, oferta_id)
values
  ('00000000-0000-0000-0000-00000000e001', '00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-00000000f001'),
  ('00000000-0000-0000-0000-00000000e002', '00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-00000000f002');

-- Applicant
set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000a1', true);

select is_empty(
  $$ update public.postulaciones set preentrevista_el = now()
     where id = '00000000-0000-0000-0000-00000000e001' returning id $$,
  'an applicant cannot record a pre-interview'
);
select throws_ok(
  $$ insert into public.derivaciones_curso (postulante_id, curso)
     values ('00000000-0000-0000-0000-0000000000a1', 'Curso de prueba') $$,
  '42501',
  null,
  'an applicant cannot record a course referral'
);
select lives_ok(
  $$ update public.postulantes set experiencia = 'Dos años en una panadería'
     where id = '00000000-0000-0000-0000-0000000000a1' $$,
  'an applicant writes their work experience (RF1.6.7)'
);

-- Company
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000c1', true);

select is_empty(
  $$ update public.postulaciones set decision_empresa = 'contratado'
     where id = '00000000-0000-0000-0000-00000000e001' returning id $$,
  'a company cannot write a decision directly (it goes through its use case, D-044)'
);
select throws_ok(
  $$ insert into public.derivaciones_curso (postulante_id, curso)
     values ('00000000-0000-0000-0000-0000000000a1', 'Curso de prueba') $$,
  '42501',
  null,
  'a company cannot record a course referral'
);

-- Office
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000d1', true);

select lives_ok(
  $$ update public.postulaciones set preentrevista_el = now(), preentrevista_notas = 'Llegó puntual'
     where id = '00000000-0000-0000-0000-00000000e001' $$,
  'an admin records a pre-interview (D-045)'
);
select throws_ok(
  $$ update public.postulaciones set preentrevista_notas = 'Notas sueltas'
     where id = '00000000-0000-0000-0000-00000000e002' $$,
  '23514',
  null,
  'pre-interview notes need a date'
);
select throws_ok(
  $$ update public.postulaciones set decision_empresa = 'contratado'
     where id = '00000000-0000-0000-0000-00000000e002' $$,
  '23514',
  null,
  'there is no decision on an application that was never referred'
);
select lives_ok(
  $$ update public.postulaciones set estado = 'derivado'
     where id = '00000000-0000-0000-0000-00000000e001' $$,
  'an admin refers an application'
);
select ok(
  (select derivada_el is not null from public.postulaciones where id = '00000000-0000-0000-0000-00000000e001'),
  'referring stamps derivada_el'
);
select throws_ok(
  $$ update public.postulaciones set decision_empresa = 'no_contratado'
     where id = '00000000-0000-0000-0000-00000000e001' $$,
  '23514',
  null,
  'not hiring needs a reason (RF1.6.4)'
);
select lives_ok(
  $$ update public.postulaciones set decision_empresa = 'no_contratado', motivo_no_contratacion = 'Buscaba más experiencia'
     where id = '00000000-0000-0000-0000-00000000e001' $$,
  'an admin records a decision with its reason'
);
select throws_ok(
  $$ update public.postulaciones set decision_empresa = 'contratado'
     where id = '00000000-0000-0000-0000-00000000e001' $$,
  '23514',
  null,
  'a reason is kept only when the company did not hire'
);
select lives_ok(
  $$ insert into public.derivaciones_curso (postulante_id, curso, notas)
     values ('00000000-0000-0000-0000-0000000000a1', 'Curso de prueba', 'Notas de prueba') $$,
  'an admin records a course referral (D-047)'
);
select is(
  (select count(*)::int from public.derivaciones_curso),
  1,
  'an admin sees course referrals'
);

-- Course referrals are hidden from the applicant and the company.
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000a1', true);

select is_empty(
  $$ select 1 from public.derivaciones_curso $$,
  'an applicant cannot see course referrals'
);

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000c1', true);

select is_empty(
  $$ select 1 from public.derivaciones_curso $$,
  'a company cannot see course referrals'
);

select * from finish();
rollback;
