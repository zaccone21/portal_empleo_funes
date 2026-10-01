-- pgTAP test for RLS on public.postulaciones (D-032). Run with
-- `supabase test db` (local stack).
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

-- Applicant 1 has a CV; applicant 2 does not.
update public.postulantes
set cv_ruta = id::text || '/cv.pdf', cv_nombre = 'cv.pdf', cv_tamano_bytes = 1000, cv_subido_el = now()
where id = '00000000-0000-0000-0000-0000000000a1';

-- f1 and f3: published. f2: pending.
insert into public.ofertas (id, empresa_id, titulo, descripcion, requisitos, lugar, jornada, estado, publicada_el)
values
  ('00000000-0000-0000-0000-00000000f001', '00000000-0000-0000-0000-0000000000c1', 'Puesto uno', 'Tareas', 'Requisitos', 'Centro', 'Mañana', 'publicada', now()),
  ('00000000-0000-0000-0000-00000000f002', '00000000-0000-0000-0000-0000000000c1', 'Puesto dos', 'Tareas', 'Requisitos', 'Centro', 'Mañana', 'pendiente', null),
  ('00000000-0000-0000-0000-00000000f003', '00000000-0000-0000-0000-0000000000c1', 'Puesto tres', 'Tareas', 'Requisitos', 'Centro', 'Mañana', 'publicada', now());

-- Applicant 2 applied to f1 before (fixture, written by the owner).
insert into public.postulaciones (postulante_id, oferta_id)
values ('00000000-0000-0000-0000-0000000000a2', '00000000-0000-0000-0000-00000000f001');

-- Applicant 1
set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000a1', true);

select lives_ok(
  $$ insert into public.postulaciones (postulante_id, oferta_id)
     values ('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-00000000f001') $$,
  'an applicant with a CV applies to a published offer'
);
select results_eq(
  $$ select origen::text, estado::text from public.postulaciones
     where postulante_id = '00000000-0000-0000-0000-0000000000a1' $$,
  $$ values ('postulante', 'postulado') $$,
  'a new application comes from the applicant and starts as postulado'
);
select throws_ok(
  $$ insert into public.postulaciones (postulante_id, oferta_id)
     values ('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-00000000f001') $$,
  '23505',
  null,
  'the same applicant cannot apply twice to one offer'
);
select throws_ok(
  $$ insert into public.postulaciones (postulante_id, oferta_id)
     values ('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-00000000f002') $$,
  '42501',
  null,
  'an applicant cannot apply to a pending offer'
);
select throws_ok(
  $$ insert into public.postulaciones (postulante_id, oferta_id)
     values ('00000000-0000-0000-0000-0000000000a2', '00000000-0000-0000-0000-00000000f003') $$,
  '42501',
  null,
  'an applicant cannot apply for someone else'
);
select throws_ok(
  $$ insert into public.postulaciones (postulante_id, oferta_id, origen)
     values ('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-00000000f003', 'oficina') $$,
  '42501',
  null,
  'an applicant cannot mark an application as made by the Office'
);
select is(
  (select count(*)::int from public.postulaciones),
  1,
  'an applicant sees only their own applications'
);
select is_empty(
  $$ update public.postulaciones set estado = 'preseleccionado'
     where postulante_id = '00000000-0000-0000-0000-0000000000a1' returning id $$,
  'an applicant cannot change the status of their application'
);
select throws_ok(
  $$ delete from public.postulaciones where postulante_id = '00000000-0000-0000-0000-0000000000a1' $$,
  '42501',
  null,
  'nobody deletes applications'
);

-- Applicant 2, without a CV
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000a2', true);

select throws_ok(
  $$ insert into public.postulaciones (postulante_id, oferta_id)
     values ('00000000-0000-0000-0000-0000000000a2', '00000000-0000-0000-0000-00000000f003') $$,
  '42501',
  null,
  'an applicant without a CV cannot apply (RF1.4.4)'
);

-- Company
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000c1', true);

select is_empty(
  $$ select 1 from public.postulaciones $$,
  'a company cannot see the applications to its offers'
);

-- Office
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000d1', true);

select is(
  (select count(*)::int from public.postulaciones),
  2,
  'an admin sees every application'
);
select lives_ok(
  $$ update public.postulaciones set estado = 'preseleccionado'
     where postulante_id = '00000000-0000-0000-0000-0000000000a2' $$,
  'an admin changes the status of an application'
);
select lives_ok(
  $$ insert into public.postulaciones (postulante_id, oferta_id, origen)
     values ('00000000-0000-0000-0000-0000000000a2', '00000000-0000-0000-0000-00000000f003', 'oficina') $$,
  'an admin links an applicant to a published offer (P16)'
);
select throws_ok(
  $$ insert into public.postulaciones (postulante_id, oferta_id)
     values ('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-00000000f003') $$,
  '42501',
  null,
  'an application made by the Office is marked as such'
);

select * from finish();
rollback;
