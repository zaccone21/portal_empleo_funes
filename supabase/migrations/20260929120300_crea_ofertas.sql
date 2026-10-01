-- ofertas: job offers and their review by the Office (P05, P06, P11, P12,
-- P15; RF1.3.3-RF1.3.6, RF1.4.1, RF1.5.2-RF1.5.4; D-007, D-008, D-032), and
-- oferta_rubros: 1 to 3 trades per offer.

create type public.estado_oferta as enum ('pendiente', 'publicada', 'rechazada', 'cerrada');

create table public.ofertas (
  id uuid primary key default gen_random_uuid(),
  -- Restrict: deleting a company must not silently delete its offers and
  -- other people's applications (Q-010).
  empresa_id uuid not null references public.empresas (id) on delete restrict,
  titulo text not null,
  descripcion text not null,
  requisitos text not null,
  lugar text not null,
  jornada text not null,
  sueldo text,
  estado public.estado_oferta not null default 'pendiente',
  motivo_rechazo text,
  cierre_solicitado boolean not null default false,
  creada_el timestamptz not null default now(),
  publicada_el timestamptz,
  constraint ofertas_titulo_largo check (char_length(titulo) between 1 and 120),
  constraint ofertas_descripcion_largo check (char_length(descripcion) between 1 and 3000),
  constraint ofertas_requisitos_largo check (char_length(requisitos) between 1 and 2000),
  constraint ofertas_lugar_largo check (char_length(lugar) between 1 and 120),
  constraint ofertas_jornada_largo check (char_length(jornada) between 1 and 120),
  constraint ofertas_sueldo_largo check (char_length(sueldo) between 1 and 120),
  constraint ofertas_motivo_rechazo_largo check (char_length(motivo_rechazo) between 1 and 500),
  constraint ofertas_rechazada_con_motivo check (estado <> 'rechazada' or motivo_rechazo is not null),
  constraint ofertas_cierre_solo_publicada check (not cierre_solicitado or estado in ('publicada', 'cerrada')),
  constraint ofertas_cerrada_con_pedido check (estado <> 'cerrada' or cierre_solicitado),
  constraint ofertas_publicada_el_coherente check ((estado in ('publicada', 'cerrada')) = (publicada_el is not null))
);

-- Catalog and P15 tabs filter by status and order by publication date; P12
-- lists one company's offers.
create index ofertas_estado_publicada_el_idx on public.ofertas (estado, publicada_el desc);
create index ofertas_empresa_idx on public.ofertas (empresa_id);

alter table public.ofertas enable row level security;

-- Column grants: a new offer can only set its own data (status, dates and
-- flags take their defaults), and an update can only touch the review columns.
revoke all on table public.ofertas from anon, authenticated;
grant select on table public.ofertas to anon, authenticated;
grant insert (empresa_id, titulo, descripcion, requisitos, lugar, jornada, sueldo) on table public.ofertas to authenticated;
grant update (estado, motivo_rechazo, cierre_solicitado) on table public.ofertas to authenticated;

create policy "ofertas_select_publicadas"
  on public.ofertas
  for select
  to anon, authenticated
  using (estado = 'publicada');

create policy "ofertas_select_propias"
  on public.ofertas
  for select
  to authenticated
  using (empresa_id = (select auth.uid()));

create policy "ofertas_select_admin"
  on public.ofertas
  for select
  to authenticated
  using ((select private.es_admin()));

-- The foreign key to empresas already rejects applicants and admins.
create policy "ofertas_insert_propias"
  on public.ofertas
  for insert
  to authenticated
  with check (empresa_id = (select auth.uid()));

-- The company can only ask to close its published offer (RF1.3.6), and cannot
-- take the request back (Q-003). The trigger below stops it from changing the
-- status or the rejection reason.
create policy "ofertas_update_pedido_cierre"
  on public.ofertas
  for update
  to authenticated
  using (empresa_id = (select auth.uid()) and estado = 'publicada')
  with check (empresa_id = (select auth.uid()) and cierre_solicitado);

create policy "ofertas_update_admin"
  on public.ofertas
  for update
  to authenticated
  using ((select private.es_admin()))
  with check ((select private.es_admin()));

-- RLS cannot compare the old row with the new one, so this trigger does:
-- only the Office changes the status or the reason. It also stamps the
-- publication date, so the catalog order comes from the database clock.
create function private.antes_de_actualizar_oferta()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if not private.es_admin()
    and (new.estado is distinct from old.estado or new.motivo_rechazo is distinct from old.motivo_rechazo) then
    raise exception 'Solo la Oficina puede cambiar el estado de una oferta' using errcode = '42501';
  end if;

  if new.estado = 'publicada' and old.estado is distinct from 'publicada' then
    new.publicada_el := now();
  end if;

  return new;
end;
$$;

create trigger antes_de_actualizar_oferta
  before update on public.ofertas
  for each row execute function private.antes_de_actualizar_oferta();

create table public.oferta_rubros (
  oferta_id uuid not null references public.ofertas (id) on delete cascade,
  rubro_id smallint not null references public.rubros (id) on delete restrict,
  primary key (oferta_id, rubro_id)
);

create index oferta_rubros_rubro_idx on public.oferta_rubros (rubro_id, oferta_id);

alter table public.oferta_rubros enable row level security;

revoke all on table public.oferta_rubros from anon, authenticated;
grant select on table public.oferta_rubros to anon, authenticated;
grant insert on table public.oferta_rubros to authenticated;

-- The subquery goes through ofertas' own RLS, so everyone sees the trades of
-- exactly the offers they can see.
create policy "oferta_rubros_select_si_ve_la_oferta"
  on public.oferta_rubros
  for select
  to anon, authenticated
  using (exists (select 1 from public.ofertas o where o.id = oferta_id));

create policy "oferta_rubros_insert_oferta_propia_pendiente"
  on public.oferta_rubros
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.ofertas o
      where o.id = oferta_id and o.empresa_id = (select auth.uid()) and o.estado = 'pendiente'
    )
  );

-- Creates an offer with its trades in one transaction (P11, RF1.3.3). Through
-- the Data API they would be two requests, and a failure in the second would
-- leave an offer without trades. Security invoker: the caller's RLS and grants
-- apply exactly as in a plain insert. The company always comes from the
-- session, never from a parameter.
create function public.crear_oferta(
  titulo text,
  descripcion text,
  requisitos text,
  lugar text,
  jornada text,
  sueldo text,
  rubros smallint[]
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  nueva_oferta_id uuid;
begin
  if (select count(distinct r) from unnest(crear_oferta.rubros) as r) not between 1 and 3 then
    raise exception 'La oferta tiene que tener de 1 a 3 rubros' using errcode = '22023';
  end if;

  insert into public.ofertas (empresa_id, titulo, descripcion, requisitos, lugar, jornada, sueldo)
  values (
    (select auth.uid()),
    crear_oferta.titulo,
    crear_oferta.descripcion,
    crear_oferta.requisitos,
    crear_oferta.lugar,
    crear_oferta.jornada,
    crear_oferta.sueldo
  )
  returning id into nueva_oferta_id;

  insert into public.oferta_rubros (oferta_id, rubro_id)
  select distinct nueva_oferta_id, r from unnest(crear_oferta.rubros) as r;

  return nueva_oferta_id;
end;
$$;

revoke execute on function public.crear_oferta(text, text, text, text, text, text, smallint[]) from public, anon;
grant execute on function public.crear_oferta(text, text, text, text, text, text, smallint[]) to authenticated;
