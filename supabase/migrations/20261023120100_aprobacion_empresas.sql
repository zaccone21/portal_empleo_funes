-- Aprobación de empresas por la Oficina (D-068, reemplaza a D-052 y a Q-014):
-- una empresa nueva queda "pendiente" y no puede mandar ofertas hasta que la
-- Oficina la apruebe. Si la rechaza, tiene que decir el motivo, que la empresa lee.
--
-- Dos barreras (AGENTS §7):
--   1. el caso de uso `publicarOferta` avisa con un mensaje claro;
--   2. la política `ofertas_insert_propias` exige `estado = 'aprobada'`, así que
--      la base lo frena aunque el código se olvide.

create type public.estado_empresa as enum ('pendiente', 'aprobada', 'rechazada');

alter table public.empresas
  add column estado public.estado_empresa not null default 'pendiente',
  add column motivo_rechazo text,
  add constraint empresas_motivo_rechazo_largo check (char_length(motivo_rechazo) between 1 and 500),
  add constraint empresas_rechazada_con_motivo check ((estado = 'rechazada') = (motivo_rechazo is not null));

-- Las empresas que ya cargaron sus datos venían publicando sin aprobación:
-- quedan aprobadas para no cortarles el servicio. Las que nunca completaron
-- el perfil (sin CUIT) arrancan pendientes, como las nuevas.
update public.empresas set estado = 'aprobada' where cuit is not null;

-- Antes: la empresa podía actualizar cualquier columna de su fila, y con
-- `estado` ahí se habría aprobado sola. Ahora cada rol toca solo lo suyo.
revoke update on table public.empresas from authenticated;
grant update (razon_social, cuit, descripcion, contacto_nombre, contacto_telefono, contacto_email, estado, motivo_rechazo)
  on table public.empresas to authenticated;

create policy "empresas_update_admin"
  on public.empresas
  for update
  to authenticated
  using ((select private.es_admin()))
  with check ((select private.es_admin()));

-- RLS no compara la fila vieja con la nueva, este trigger sí:
--   * solo la Oficina cambia `estado` y `motivo_rechazo`, y solo en los pasos
--     pendiente -> aprobada | rechazada y rechazada -> aprobada;
--   * si la empresa cambia su CUIT o su razón social después de estar aprobada,
--     vuelve a "pendiente": si no, podría cambiar el CUIT por el de otra empresa
--     y seguir publicando;
--   * si una empresa rechazada corrige sus datos, vuelve a "pendiente" y limpia el
--     motivo, para que la Oficina la revise de nuevo.
create function private.antes_de_actualizar_empresa()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  -- Sin sesión (el SQL Editor, la clave de servicio) no es una persona de la
  -- API sino el dueño del proyecto: puede corregir un estado a mano. Los roles
  -- `anon` y `authenticated` siempre llevan sesión, y `anon` no puede actualizar.
  if auth.uid() is null then
    return new;
  end if;

  if private.es_admin() then
    if new.estado is distinct from old.estado
      and not (
        (old.estado = 'pendiente' and new.estado in ('aprobada', 'rechazada'))
        or (old.estado = 'rechazada' and new.estado = 'aprobada')
      ) then
      raise exception 'Ese cambio de estado de la empresa no está permitido' using errcode = '22023';
    end if;

    if new.estado <> 'rechazada' then
      new.motivo_rechazo := null;
    end if;
    return new;
  end if;

  if new.estado is distinct from old.estado or new.motivo_rechazo is distinct from old.motivo_rechazo then
    raise exception 'Solo la Oficina puede cambiar el estado de una empresa' using errcode = '42501';
  end if;

  if old.estado = 'aprobada'
    and (new.cuit is distinct from old.cuit or new.razon_social is distinct from old.razon_social) then
    new.estado := 'pendiente';
  elsif old.estado = 'rechazada'
    and (
      new.razon_social is distinct from old.razon_social
      or new.cuit is distinct from old.cuit
      or new.descripcion is distinct from old.descripcion
      or new.contacto_nombre is distinct from old.contacto_nombre
      or new.contacto_telefono is distinct from old.contacto_telefono
      or new.contacto_email is distinct from old.contacto_email
    ) then
    new.estado := 'pendiente';
    new.motivo_rechazo := null;
  end if;

  return new;
end;
$$;

create trigger antes_de_actualizar_empresa
  before update on public.empresas
  for each row execute function private.antes_de_actualizar_empresa();

-- Segunda barrera: solo una empresa aprobada puede crear ofertas. `crear_oferta`
-- es `security invoker`, así que hereda esta política. La subconsulta pasa por
-- la RLS de `empresas`, donde la empresa ve su propia fila.
drop policy "ofertas_insert_propias" on public.ofertas;

create policy "ofertas_insert_propias"
  on public.ofertas
  for insert
  to authenticated
  with check (
    empresa_id = (select auth.uid())
    and exists (
      select 1
      from public.empresas e
      where e.id = (select auth.uid()) and e.estado = 'aprobada'
    )
  );

-- Las cifras públicas del inicio cuentan solo las empresas aprobadas (D-059).
create or replace function public.estadisticas_publicas()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'ofertas_publicadas', (select count(*) from public.ofertas where estado = 'publicada'),
    'empresas', (select count(*) from public.empresas where estado = 'aprobada'),
    'postulantes', (select count(*) from public.postulantes),
    'derivaciones', (select count(*) from public.postulaciones where estado = 'derivado'),
    'contrataciones', (select count(*) from public.postulaciones where decision_empresa = 'contratado')
  );
$$;
