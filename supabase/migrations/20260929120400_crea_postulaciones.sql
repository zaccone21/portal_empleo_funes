-- postulaciones: who applied to which offer (P06, P07, P15, P16; RF1.2.4,
-- RF1.4.3, RF1.4.4, RF1.5.5, RF1.5.6, RF1.5.8; D-023, D-024, D-030, D-032).
-- The status stays in this table (D-032); RLS filters rows, not columns, so
-- hiding it from the applicant relies on the use case's DTO (DT-007).

create type public.estado_postulacion as enum ('postulado', 'preseleccionado', 'derivado', 'no_apto');
create type public.origen_postulacion as enum ('postulante', 'oficina');

create table public.postulaciones (
  id uuid primary key default gen_random_uuid(),
  postulante_id uuid not null references public.postulantes (id) on delete cascade,
  oferta_id uuid not null references public.ofertas (id) on delete restrict,
  origen public.origen_postulacion not null default 'postulante',
  estado public.estado_postulacion not null default 'postulado',
  creada_el timestamptz not null default now(),
  -- Applying twice changes nothing (D-024).
  constraint postulaciones_una_por_oferta unique (postulante_id, oferta_id)
);

-- P15 lists the applications of one offer. Lookups by applicant use the
-- unique constraint's index.
create index postulaciones_oferta_idx on public.postulaciones (oferta_id);

alter table public.postulaciones enable row level security;

-- Column grants: a new application takes the default status and date; the
-- only column anyone can update is the status, and only the Office has a
-- policy for it. Nobody deletes applications (D-023).
revoke all on table public.postulaciones from anon, authenticated;
grant select on table public.postulaciones to authenticated;
grant insert (postulante_id, oferta_id, origen) on table public.postulaciones to authenticated;
grant update (estado) on table public.postulaciones to authenticated;

create policy "postulaciones_select_propias"
  on public.postulaciones
  for select
  to authenticated
  using (postulante_id = (select auth.uid()));

create policy "postulaciones_select_admin"
  on public.postulaciones
  for select
  to authenticated
  using ((select private.es_admin()));

-- The applicant applies for themself, only to a published offer, and only
-- with a CV (RF1.4.4). The subqueries go through the RLS of ofertas and
-- postulantes.
create policy "postulaciones_insert_propias"
  on public.postulaciones
  for insert
  to authenticated
  with check (
    postulante_id = (select auth.uid())
    and origen = 'postulante'
    and exists (select 1 from public.ofertas o where o.id = oferta_id and o.estado = 'publicada')
    and exists (select 1 from public.postulantes p where p.id = postulante_id and p.cv_ruta is not null)
  );

-- The Office links an applicant to a published offer from the search (P16,
-- RF1.5.8). The applicant sees it in "Mis postulaciones" too (Q-007).
create policy "postulaciones_insert_admin"
  on public.postulaciones
  for insert
  to authenticated
  with check (
    (select private.es_admin())
    and origen = 'oficina'
    and exists (select 1 from public.ofertas o where o.id = oferta_id and o.estado = 'publicada')
  );

-- Any change among the four statuses is allowed (D-030).
create policy "postulaciones_update_admin"
  on public.postulaciones
  for update
  to authenticated
  using ((select private.es_admin()))
  with check ((select private.es_admin()));
