-- pgTAP test for RLS on public.ofertas and public.oferta_rubros, the update
-- trigger and crear_oferta (D-032). Run with `supabase test db` (local stack).
begin;
select plan(22);

insert into auth.users (id, instance_id, aud, role, email, raw_user_meta_data)
values
  ('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'applicant@example.test', '{}'),
  ('00000000-0000-0000-0000-0000000000c1', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'company1@example.test', '{"rol": "empresa"}'),
  ('00000000-0000-0000-0000-0000000000c2', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'company2@example.test', '{"rol": "empresa"}'),
  ('00000000-0000-0000-0000-0000000000d1', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'office@example.test', '{}');

update public.perfiles set rol = 'admin' where id = '00000000-0000-0000-0000-0000000000d1';
delete from public.postulantes where id = '00000000-0000-0000-0000-0000000000d1';

-- f1: company 1, published. f2: company 1, pending. f3: company 2, pending.
-- f4: company 2, published.
insert into public.ofertas (id, empresa_id, titulo, descripcion, requisitos, lugar, jornada, estado, publicada_el)
values
  ('00000000-0000-0000-0000-00000000f001', '00000000-0000-0000-0000-0000000000c1', 'Puesto uno', 'Tareas', 'Requisitos', 'Centro', 'Mañana', 'publicada', now()),
  ('00000000-0000-0000-0000-00000000f002', '00000000-0000-0000-0000-0000000000c1', 'Puesto dos', 'Tareas', 'Requisitos', 'Centro', 'Mañana', 'pendiente', null),
  ('00000000-0000-0000-0000-00000000f003', '00000000-0000-0000-0000-0000000000c2', 'Puesto tres', 'Tareas', 'Requisitos', 'Centro', 'Mañana', 'pendiente', null),
  ('00000000-0000-0000-0000-00000000f004', '00000000-0000-0000-0000-0000000000c2', 'Puesto cuatro', 'Tareas', 'Requisitos', 'Centro', 'Mañana', 'publicada', now());

insert into public.oferta_rubros (oferta_id, rubro_id)
select '00000000-0000-0000-0000-00000000f001', id from public.rubros where slug = 'gastronomia'
union all
select '00000000-0000-0000-0000-00000000f003', id from public.rubros where slug = 'limpieza';

-- Anonymous visitor
set local role anon;

select is(
  (select count(*)::int from public.ofertas),
  2,
  'anonymous users see only published offers'
);
select is(
  (select count(*)::int from public.oferta_rubros),
  1,
  'anonymous users see only the trades of published offers'
);

-- Applicant
set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000a1', true);

select is(
  (select count(*)::int from public.ofertas),
  2,
  'an applicant sees only published offers'
);
select throws_ok(
  $$ select public.crear_oferta('Puesto', 'Tareas', 'Requisitos', 'Centro', 'Mañana', null,
       array[(select id from public.rubros where slug = 'comercio')]) $$,
  '23503',
  null,
  'an applicant cannot create an offer'
);

-- Company 1
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000c1', true);

select is(
  (select count(*)::int from public.ofertas where empresa_id = '00000000-0000-0000-0000-0000000000c1'),
  2,
  'a company sees all its own offers'
);
select is_empty(
  $$ select 1 from public.ofertas where id = '00000000-0000-0000-0000-00000000f003' $$,
  'a company cannot see another company''s pending offer'
);
select lives_ok(
  $$ select public.crear_oferta('Repartidor', 'Reparto', 'Moto', 'Centro', 'Tarde', 'A convenir',
       array(select id from public.rubros where slug in ('gastronomia', 'transporte'))) $$,
  'a company creates an offer with two trades'
);
select results_eq(
  $$ select estado::text, cierre_solicitado, publicada_el is null from public.ofertas where titulo = 'Repartidor' $$,
  $$ values ('pendiente', false, true) $$,
  'a new offer starts pending, without close request or publication date'
);
select is(
  (select count(*)::int from public.oferta_rubros r join public.ofertas o on o.id = r.oferta_id where o.titulo = 'Repartidor'),
  2,
  'the new offer has its two trades'
);
select throws_ok(
  $$ select public.crear_oferta('Puesto', 'Tareas', 'Requisitos', 'Centro', 'Mañana', null, array[]::smallint[]) $$,
  '22023',
  null,
  'an offer needs at least one trade'
);
select throws_ok(
  $$ select public.crear_oferta('Puesto', 'Tareas', 'Requisitos', 'Centro', 'Mañana', null,
       array(select id from public.rubros order by id limit 4)) $$,
  '22023',
  null,
  'an offer has at most three trades'
);
select throws_ok(
  $$ insert into public.ofertas (empresa_id, titulo, descripcion, requisitos, lugar, jornada, estado)
     values ('00000000-0000-0000-0000-0000000000c1', 'Puesto', 'Tareas', 'Requisitos', 'Centro', 'Mañana', 'publicada') $$,
  '42501',
  null,
  'a company cannot create an offer already published'
);
select is_empty(
  $$ update public.ofertas set cierre_solicitado = true where id = '00000000-0000-0000-0000-00000000f002' returning id $$,
  'a company cannot ask to close a pending offer'
);
select throws_ok(
  $$ update public.ofertas set estado = 'cerrada' where id = '00000000-0000-0000-0000-00000000f001' $$,
  '42501',
  null,
  'a company cannot change the status of its offer'
);
select throws_ok(
  $$ update public.ofertas set titulo = 'Otro' where id = '00000000-0000-0000-0000-00000000f001' $$,
  '42501',
  null,
  'a company cannot edit a published offer'
);
select lives_ok(
  $$ update public.ofertas set cierre_solicitado = true where id = '00000000-0000-0000-0000-00000000f001' $$,
  'a company can ask to close its published offer'
);
select is_empty(
  $$ update public.ofertas set cierre_solicitado = true where id = '00000000-0000-0000-0000-00000000f004' returning id $$,
  'a company cannot ask to close another company''s offer'
);
select throws_ok(
  $$ delete from public.ofertas where id = '00000000-0000-0000-0000-00000000f002' $$,
  '42501',
  null,
  'nobody deletes offers'
);

-- Office
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000d1', true);

select lives_ok(
  $$ update public.ofertas set estado = 'publicada' where id = '00000000-0000-0000-0000-00000000f002' $$,
  'an admin publishes a pending offer'
);
select isnt(
  (select publicada_el from public.ofertas where id = '00000000-0000-0000-0000-00000000f002'),
  null,
  'publishing stamps the publication date'
);
select throws_ok(
  $$ update public.ofertas set estado = 'rechazada' where id = '00000000-0000-0000-0000-00000000f003' $$,
  '23514',
  null,
  'rejecting requires a reason'
);
select throws_ok(
  $$ update public.ofertas set estado = 'cerrada' where id = '00000000-0000-0000-0000-00000000f004' $$,
  '23514',
  null,
  'an offer is closed only if its company asked for it'
);

select * from finish();
rollback;
