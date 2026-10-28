-- =============================================================================
-- Migración: 20261028180000_seguridad_empresas_login_metricas.sql
-- 1) Bloquea en la base que una empresa sin CUIT / razón social / datos de
--    contacto completos pueda publicar ofertas o quedar como aprobada (Punto D).
-- 2) Crea la tabla `public.visitas_diarias` y la función `registrar_visita_diaria`
--    para el panel de Métricas del Admin (Punto 7).
-- 3) Crea la función `public.resolver_email_por_documento` para permitir el
--    inicio de sesión con DNI (postulante) o CUIT (empresa) (Punto 8).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Seguridad de Empresas (CUIT y perfil completo obligatorio para ofertas)
-- -----------------------------------------------------------------------------

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'empresas'
      and column_name = 'estado'
  ) then
    -- Ninguna empresa sin CUIT o sin razón social puede estar aprobada:
    update public.empresas
       set estado = 'pendiente'
     where estado = 'aprobada'
       and (
         cuit is null or btrim(cuit) = ''
         or razon_social is null or btrim(razon_social) = ''
         or contacto_nombre is null or btrim(contacto_nombre) = ''
         or contacto_telefono is null or btrim(contacto_telefono) = ''
         or contacto_email is null or btrim(contacto_email) = ''
       );
  end if;
end;
$$;

drop policy if exists "ofertas_insert_propias" on public.ofertas;

create policy "ofertas_insert_propias"
  on public.ofertas
  for insert
  to authenticated
  with check (
    empresa_id = (select auth.uid())
    and exists (
      select 1
      from public.empresas e
      where e.id = (select auth.uid())
        and e.cuit is not null and btrim(e.cuit) <> ''
        and e.razon_social is not null and btrim(e.razon_social) <> ''
        and e.contacto_nombre is not null and btrim(e.contacto_nombre) <> ''
        and e.contacto_telefono is not null and btrim(e.contacto_telefono) <> ''
        and e.contacto_email is not null and btrim(e.contacto_email) <> ''
    )
  );

-- Si la columna `estado` existe en `empresas` (migración 20261023120100),
-- exigimos además `e.estado = 'aprobada'` en la política de inserción de ofertas:
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'empresas'
      and column_name = 'estado'
  ) then
    execute $pol$
      drop policy if exists "ofertas_insert_propias" on public.ofertas;
      create policy "ofertas_insert_propias"
        on public.ofertas
        for insert
        to authenticated
        with check (
          empresa_id = (select auth.uid())
          and exists (
            select 1
            from public.empresas e
            where e.id = (select auth.uid())
              and e.estado = 'aprobada'
              and e.cuit is not null and btrim(e.cuit) <> ''
              and e.razon_social is not null and btrim(e.razon_social) <> ''
              and e.contacto_nombre is not null and btrim(e.contacto_nombre) <> ''
              and e.contacto_telefono is not null and btrim(e.contacto_telefono) <> ''
              and e.contacto_email is not null and btrim(e.contacto_email) <> ''
          )
        );
    $pol$;
  end if;
end;
$$;

-- -----------------------------------------------------------------------------
-- 2. Contador de Visitas Diarias para el Panel de Métricas (/admin/metricas)
-- -----------------------------------------------------------------------------

create table if not exists public.visitas_diarias (
  fecha date primary key default (now() at time zone 'America/Argentina/Buenos_Aires')::date,
  cantidad integer not null default 0 check (cantidad >= 0)
);

alter table public.visitas_diarias enable row level security;

drop policy if exists "visitas_diarias_select_admin" on public.visitas_diarias;
create policy "visitas_diarias_select_admin"
  on public.visitas_diarias
  for select
  to authenticated
  using ((select private.es_admin()));

grant select on table public.visitas_diarias to authenticated;

create or replace function public.registrar_visita_diaria()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_hoy date := (now() at time zone 'America/Argentina/Buenos_Aires')::date;
begin
  insert into public.visitas_diarias (fecha, cantidad)
  values (v_hoy, 1)
  on conflict (fecha)
  do update set cantidad = public.visitas_diarias.cantidad + 1;
end;
$$;

grant execute on function public.registrar_visita_diaria() to anon, authenticated;

-- -----------------------------------------------------------------------------
-- 3. Resolución de Email por DNI (Postulante) o CUIT (Empresa) para Login
-- -----------------------------------------------------------------------------

create or replace function public.resolver_email_por_documento(p_documento text)
returns text
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_limpio text := regexp_replace(coalesce(p_documento, ''), '\D', '', 'g');
  v_cuit_formateado text;
  v_email text;
begin
  if char_length(v_limpio) between 7 and 8 then
    select p.email
      into v_email
      from public.postulantes pos
      join public.perfiles p on p.id = pos.id
     where regexp_replace(coalesce(pos.dni, ''), '\D', '', 'g') = v_limpio
     limit 1;
    return v_email;
  elsif char_length(v_limpio) = 11 then
    v_cuit_formateado := substr(v_limpio, 1, 2) || '-' || substr(v_limpio, 3, 8) || '-' || substr(v_limpio, 11, 1);
    select p.email
      into v_email
      from public.empresas emp
      join public.perfiles p on p.id = emp.id
     where emp.cuit = v_cuit_formateado
        or regexp_replace(coalesce(emp.cuit, ''), '\D', '', 'g') = v_limpio
     limit 1;
    return v_email;
  end if;

  return null;
end;
$$;

grant execute on function public.resolver_email_por_documento(text) to anon, authenticated;
