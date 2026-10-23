-- pgTAP test for the Office's approval of companies (D-068, D-069): the status
-- column of public.empresas, its trigger, and the policy that only lets an
-- approved company create offers. Run with `supabase test db` (local stack).
begin;
select plan(16);

insert into auth.users (id, instance_id, aud, role, email, raw_user_meta_data)
values
  ('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'applicant@example.test', '{}'),
  ('00000000-0000-0000-0000-0000000000c1', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'company1@example.test', '{"rol": "empresa"}'),
  ('00000000-0000-0000-0000-0000000000c2', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'company2@example.test', '{"rol": "empresa"}'),
  ('00000000-0000-0000-0000-0000000000d1', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'office@example.test', '{}');

update public.perfiles set rol = 'admin' where id = '00000000-0000-0000-0000-0000000000d1';
delete from public.postulantes where id = '00000000-0000-0000-0000-0000000000d1';

select is(
  (select estado::text from public.empresas where id = '00000000-0000-0000-0000-0000000000c1'),
  'pendiente',
  'a company that signs up starts pending'
);

-- Company 1, pending
set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000c1', true);

select lives_ok(
  $$ update public.empresas set razon_social = 'Empresa Uno', cuit = '30-71234567-1'
     where id = '00000000-0000-0000-0000-0000000000c1' $$,
  'a pending company fills in its data'
);
select throws_ok(
  $$ update public.empresas set estado = 'aprobada' where id = '00000000-0000-0000-0000-0000000000c1' $$,
  '42501',
  null,
  'a company cannot approve itself'
);
select throws_ok(
  $$ update public.empresas set motivo_rechazo = 'Todo bien'
     where id = '00000000-0000-0000-0000-0000000000c1' $$,
  '42501',
  null,
  'a company cannot write its own rejection reason'
);
select throws_ok(
  $$ select public.crear_oferta('Puesto', 'Tareas', 'Requisitos', 'Centro', 'Mañana', null,
       array[(select id from public.rubros where slug = 'comercio')]) $$,
  '42501',
  null,
  'a pending company cannot create an offer'
);

-- Company 2 cannot read or change company 1
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000c2', true);

select is_empty(
  $$ select 1 from public.empresas where id = '00000000-0000-0000-0000-0000000000c1' $$,
  'a company does not see another company'
);
select is_empty(
  $$ update public.empresas set razon_social = 'Hackeada'
     where id = '00000000-0000-0000-0000-0000000000c1' returning id $$,
  'a company cannot change another company'
);

-- Applicant
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000a1', true);

select is_empty(
  $$ update public.empresas set estado = 'aprobada'
     where id = '00000000-0000-0000-0000-0000000000c1' returning id $$,
  'an applicant cannot approve a company'
);

-- Office
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000d1', true);

select lives_ok(
  $$ update public.empresas set estado = 'aprobada' where id = '00000000-0000-0000-0000-0000000000c1' $$,
  'the Office approves a pending company'
);
select throws_ok(
  $$ update public.empresas set estado = 'rechazada', motivo_rechazo = 'Otro motivo'
     where id = '00000000-0000-0000-0000-0000000000c1' $$,
  '22023',
  null,
  'an approved company is not taken back in this delivery'
);
select throws_ok(
  $$ update public.empresas set estado = 'rechazada' where id = '00000000-0000-0000-0000-0000000000c2' $$,
  '23514',
  null,
  'a rejection needs its reason'
);
select lives_ok(
  $$ update public.empresas set estado = 'rechazada', motivo_rechazo = 'Faltan datos de la empresa'
     where id = '00000000-0000-0000-0000-0000000000c2' $$,
  'the Office rejects a pending company with its reason'
);

-- Company 1, now approved
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000c1', true);

select lives_ok(
  $$ select public.crear_oferta('Puesto', 'Tareas', 'Requisitos', 'Centro', 'Mañana', null,
       array[(select id from public.rubros where slug = 'comercio')]) $$,
  'an approved company creates an offer'
);

update public.empresas set cuit = '30-71234567-1', descripcion = 'Descripción nueva'
where id = '00000000-0000-0000-0000-0000000000c1';
select is(
  (select estado::text from public.empresas where id = '00000000-0000-0000-0000-0000000000c1'),
  'aprobada',
  'changing the description does not send an approved company back to review'
);

update public.empresas set cuit = '20-12345678-6' where id = '00000000-0000-0000-0000-0000000000c1';
select is(
  (select estado::text from public.empresas where id = '00000000-0000-0000-0000-0000000000c1'),
  'pendiente',
  'changing the CUIT of an approved company sends it back to review'
);

-- Company 2, rejected: correcting its data sends it back to review
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000c2', true);

update public.empresas set razon_social = 'Empresa Dos', cuit = '30-71234567-1'
where id = '00000000-0000-0000-0000-0000000000c2';
select is(
  (select estado::text || '/' || coalesce(motivo_rechazo, 'sin motivo') from public.empresas
   where id = '00000000-0000-0000-0000-0000000000c2'),
  'pendiente/sin motivo',
  'a rejected company that corrects its data goes back to review without the old reason'
);

select * from finish();
rollback;
