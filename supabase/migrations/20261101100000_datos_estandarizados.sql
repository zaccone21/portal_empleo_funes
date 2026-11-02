-- Estandarización de datos de filtrado en ofertas (modalidad y tipo de jornada)
-- y corrección de actualización de CUIT en empresas.

-- 1. Ofertas: Modalidad y tipo de jornada (coexisten con la columna existente 'jornada text')
alter table public.ofertas
  add column if not exists modalidad text default 'presencial',
  add column if not exists tipo_jornada text default 'completa';

-- Asignar valores por defecto a filas existentes si fueran nulas
update public.ofertas set modalidad = 'presencial' where modalidad is null;
update public.ofertas set tipo_jornada = 'completa' where tipo_jornada is null;

-- Asegurar restricción NOT NULL
alter table public.ofertas
  alter column modalidad set not null,
  alter column tipo_jornada set not null;

-- Constraints condicionales para evitar duplicados si se re-ejecuta
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'ofertas_modalidad_check'
  ) then
    alter table public.ofertas
      add constraint ofertas_modalidad_check check (modalidad in ('presencial', 'hibrido', 'remoto'));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'ofertas_tipo_jornada_check'
  ) then
    alter table public.ofertas
      add constraint ofertas_tipo_jornada_check check (tipo_jornada in ('completa', 'media_jornada', 'flexible'));
  end if;
end $$;

-- Permisos de inserción en ofertas para las nuevas columnas
grant insert (modalidad, tipo_jornada) on table public.ofertas to authenticated;

-- Índices para acelerar el filtrado y orden en el catálogo
create index if not exists ofertas_modalidad_idx on public.ofertas (modalidad);
create index if not exists ofertas_tipo_jornada_idx on public.ofertas (tipo_jornada);

-- 2. Eliminar la sobrecarga vieja (7 argumentos) para evitar error de ambigüedad en RPC de Postgres
drop function if exists public.crear_oferta(text, text, text, text, text, text, smallint[]);

-- Actualizar función crear_oferta con los campos estandarizados (con defaults para retrocompatibilidad)
create or replace function public.crear_oferta(
  titulo text,
  descripcion text,
  requisitos text,
  lugar text,
  jornada text,
  sueldo text,
  rubros smallint[],
  modalidad text default 'presencial',
  tipo_jornada text default 'completa'
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

  insert into public.ofertas (
    empresa_id,
    titulo,
    descripcion,
    requisitos,
    lugar,
    jornada,
    sueldo,
    modalidad,
    tipo_jornada
  )
  values (
    (select auth.uid()),
    crear_oferta.titulo,
    crear_oferta.descripcion,
    crear_oferta.requisitos,
    crear_oferta.lugar,
    crear_oferta.jornada,
    crear_oferta.sueldo,
    coalesce(crear_oferta.modalidad, 'presencial'),
    coalesce(crear_oferta.tipo_jornada, 'completa')
  )
  returning id into nueva_oferta_id;

  insert into public.oferta_rubros (oferta_id, rubro_id)
  select distinct nueva_oferta_id, r from unnest(crear_oferta.rubros) as r;

  return nueva_oferta_id;
end;
$$;

revoke execute on function public.crear_oferta(text, text, text, text, text, text, smallint[], text, text) from public, anon;
grant execute on function public.crear_oferta(text, text, text, text, text, text, smallint[], text, text) to authenticated;

-- 3. Corrección en antes_de_actualizar_empresa para evitar falsos positivos al comparar CUIT (ignora guiones)
-- y asegurar que new.estado nulo mantenga old.estado
create or replace function private.antes_de_actualizar_empresa()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if auth.uid() is null then
    return new;
  end if;

  -- Si el caller no envió estado o motivo_rechazo, preserva los anteriores
  if new.estado is null then
    new.estado := old.estado;
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

  -- Al comparar CUIT, se quitan guiones y espacios para evitar que un simple cambio de formato
  -- dispare la pérdida de aprobación de la empresa
  if old.estado = 'aprobada'
    and (
      replace(replace(coalesce(new.cuit, ''), '-', ''), ' ', '') is distinct from replace(replace(coalesce(old.cuit, ''), '-', ''), ' ', '')
      or new.razon_social is distinct from old.razon_social
    ) then
    new.estado := 'pendiente';
  elsif old.estado = 'rechazada'
    and (
      new.razon_social is distinct from old.razon_social
      or replace(replace(coalesce(new.cuit, ''), '-', ''), ' ', '') is distinct from replace(replace(coalesce(old.cuit, ''), '-', ''), ' ', '')
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
