-- rubros: the single list of trades shared by applicants and offers
-- (RF1.2.2, D-029, D-032), and the trades each applicant picks (RNF4).
-- The seed is the provisional list of src/lib/validation/rubros.ts; the final
-- list is still open (Q-006). Changing it means a new migration (D-033).

create table public.rubros (
  id smallint generated always as identity primary key,
  slug text not null unique,
  nombre text not null unique,
  constraint rubros_slug_formato check (slug ~ '^[a-z0-9-]+$'),
  constraint rubros_nombre_largo check (char_length(nombre) between 1 and 60)
);

alter table public.rubros enable row level security;

revoke all on table public.rubros from anon, authenticated;
grant select on table public.rubros to anon, authenticated;

-- Public read: the catalog filter works without a session. Nobody writes it
-- from the app.
create policy "rubros_select_todos"
  on public.rubros
  for select
  to anon, authenticated
  using (true);

insert into public.rubros (slug, nombre) values
  ('gastronomia', 'Gastronomía'),
  ('comercio', 'Comercio y ventas'),
  ('construccion', 'Construcción y oficios'),
  ('jardineria', 'Jardinería y mantenimiento'),
  ('transporte', 'Transporte y reparto'),
  ('limpieza', 'Limpieza'),
  ('administracion', 'Administración'),
  ('cuidados', 'Cuidado de personas'),
  ('industria', 'Industria y producción'),
  ('tecnologia', 'Tecnología'),
  ('otros', 'Otros');

create table public.postulante_rubros (
  postulante_id uuid not null references public.postulantes (id) on delete cascade,
  rubro_id smallint not null references public.rubros (id) on delete restrict,
  primary key (postulante_id, rubro_id)
);

-- The Office searches applicants by trade (P16, RNF4).
create index postulante_rubros_rubro_idx on public.postulante_rubros (rubro_id, postulante_id);

alter table public.postulante_rubros enable row level security;

revoke all on table public.postulante_rubros from anon, authenticated;
grant select, insert, delete on table public.postulante_rubros to authenticated;

create policy "postulante_rubros_select_propios"
  on public.postulante_rubros
  for select
  to authenticated
  using (postulante_id = (select auth.uid()));

create policy "postulante_rubros_select_admin"
  on public.postulante_rubros
  for select
  to authenticated
  using ((select private.es_admin()));

-- The foreign key to postulantes already rejects companies and admins.
create policy "postulante_rubros_insert_propios"
  on public.postulante_rubros
  for insert
  to authenticated
  with check (postulante_id = (select auth.uid()));

create policy "postulante_rubros_delete_propios"
  on public.postulante_rubros
  for delete
  to authenticated
  using (postulante_id = (select auth.uid()));
