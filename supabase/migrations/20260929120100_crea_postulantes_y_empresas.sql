-- postulantes and empresas: the data of each role (P03, P04, P10; RF1.2.1,
-- RF1.2.3, RF1.3.2; D-032). Both share the account id, so "it is yours" is
-- id = auth.uid(). The rows are created empty by crear_perfil and filled in
-- from each role's screen.

create table public.postulantes (
  id uuid primary key references public.perfiles (id) on delete cascade,
  nombre text,
  apellido text,
  telefono text,
  dni text unique,
  cv_ruta text,
  cv_nombre text,
  cv_tamano_bytes integer,
  cv_subido_el timestamptz,
  constraint postulantes_nombre_largo check (char_length(nombre) between 1 and 80),
  constraint postulantes_apellido_largo check (char_length(apellido) between 1 and 80),
  constraint postulantes_telefono_formato check (telefono ~ '^[0-9 ()+-]+$' and char_length(telefono) <= 30),
  constraint postulantes_dni_formato check (dni ~ '^[0-9]{7,8}$'),
  -- Always the same path, so a row can never point to someone else's file.
  constraint postulantes_cv_ruta_propia check (cv_ruta = (id::text || '/cv.pdf')),
  constraint postulantes_cv_nombre_largo check (char_length(cv_nombre) between 1 and 255),
  constraint postulantes_cv_tamano_positivo check (cv_tamano_bytes > 0),
  -- The four CV columns are set together or not at all (RF1.4.4 checks cv_ruta).
  constraint postulantes_cv_completo check (num_nulls(cv_ruta, cv_nombre, cv_tamano_bytes, cv_subido_el) in (0, 4))
);

alter table public.postulantes enable row level security;

revoke all on table public.postulantes from anon, authenticated;
grant select, update on table public.postulantes to authenticated;

create policy "postulantes_select_propio"
  on public.postulantes
  for select
  to authenticated
  using (id = (select auth.uid()));

create policy "postulantes_select_admin"
  on public.postulantes
  for select
  to authenticated
  using ((select private.es_admin()));

create policy "postulantes_update_propio"
  on public.postulantes
  for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create table public.empresas (
  id uuid primary key references public.perfiles (id) on delete cascade,
  razon_social text,
  cuit text unique,
  descripcion text,
  contacto_nombre text,
  contacto_telefono text,
  contacto_email text,
  constraint empresas_razon_social_largo check (char_length(razon_social) between 1 and 120),
  constraint empresas_cuit_formato check (cuit ~ '^[0-9]{2}-[0-9]{8}-[0-9]$'),
  constraint empresas_descripcion_largo check (char_length(descripcion) <= 1000),
  constraint empresas_contacto_nombre_largo check (char_length(contacto_nombre) between 1 and 120),
  constraint empresas_contacto_telefono_formato check (contacto_telefono ~ '^[0-9 ()+-]+$' and char_length(contacto_telefono) <= 30),
  constraint empresas_contacto_email_largo check (char_length(contacto_email) between 3 and 254)
);

alter table public.empresas enable row level security;

revoke all on table public.empresas from anon, authenticated;
grant select, update on table public.empresas to authenticated;

create policy "empresas_select_propia"
  on public.empresas
  for select
  to authenticated
  using (id = (select auth.uid()));

create policy "empresas_select_admin"
  on public.empresas
  for select
  to authenticated
  using ((select private.es_admin()));

create policy "empresas_update_propia"
  on public.empresas
  for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- crear_perfil now also creates the empty row of the account's role.
create or replace function public.crear_perfil()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  nuevo_rol public.rol_usuario := case
    when new.raw_user_meta_data ->> 'rol' = 'empresa' then 'empresa'::public.rol_usuario
    else 'postulante'::public.rol_usuario
  end;
begin
  insert into public.perfiles (id, rol, email) values (new.id, nuevo_rol, new.email);

  if nuevo_rol = 'empresa' then
    insert into public.empresas (id) values (new.id);
  else
    insert into public.postulantes (id) values (new.id);
  end if;

  return new;
end;
$$;

-- Accounts created before this migration get their row too.
insert into public.postulantes (id) select id from public.perfiles where rol = 'postulante';
insert into public.empresas (id) select id from public.perfiles where rol = 'empresa';
