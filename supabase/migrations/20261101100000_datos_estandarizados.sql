-- Estandarización de datos de filtrado (ofertas y postulantes) y corrección
-- de actualización de CUIT en empresas.
-- (Refactor UI/UX: Paginación, filtros estructurados y perfil empresa).

-- 1. Ofertas: Modalidad, tipo de jornada y experiencia mínima requerida
alter table public.ofertas
  add column if not exists modalidad text check (modalidad in ('presencial', 'hibrido', 'remoto')) default 'presencial' not null,
  add column if not exists tipo_jornada text check (tipo_jornada in ('completa', 'media_jornada', 'flexible')) default 'completa' not null,
  add column if not exists experiencia_minima text check (experiencia_minima in ('sin_experiencia', 'menos_de_1', '1_a_3', 'mas_de_3')) default 'sin_experiencia' not null;

-- Permisos de inserción en ofertas para las nuevas columnas
grant insert (modalidad, tipo_jornada, experiencia_minima) on table public.ofertas to authenticated;

-- Índices para acelerar el filtrado y paginación en el catálogo y mesa de trabajo
create index if not exists ofertas_modalidad_idx on public.ofertas (modalidad);
create index if not exists ofertas_tipo_jornada_idx on public.ofertas (tipo_jornada);
create index if not exists ofertas_experiencia_idx on public.ofertas (experiencia_minima);

-- 2. Postulantes: Nivel educativo y rango de experiencia laboral
alter table public.postulantes
  add column if not exists nivel_educativo text check (nivel_educativo in ('secundario_incompleto', 'secundario_completo', 'terciario', 'universitario')),
  add column if not exists rango_experiencia text check (rango_experiencia in ('sin_experiencia', 'menos_de_1', '1_a_3', 'mas_de_3'));

-- Índices para búsqueda de candidatos
create index if not exists postulantes_nivel_educativo_idx on public.postulantes (nivel_educativo);
create index if not exists postulantes_rango_experiencia_idx on public.postulantes (rango_experiencia);

-- 3. Actualizar función crear_oferta con los nuevos campos estandarizados (con defaults para retrocompatibilidad)
create or replace function public.crear_oferta(
  titulo text,
  descripcion text,
  requisitos text,
  lugar text,
  jornada text,
  sueldo text,
  rubros smallint[],
  modalidad text default 'presencial',
  tipo_jornada text default 'completa',
  experiencia_minima text default 'sin_experiencia'
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
    tipo_jornada,
    experiencia_minima
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
    coalesce(crear_oferta.tipo_jornada, 'completa'),
    coalesce(crear_oferta.experiencia_minima, 'sin_experiencia')
  )
  returning id into nueva_oferta_id;

  insert into public.oferta_rubros (oferta_id, rubro_id)
  select distinct nueva_oferta_id, r from unnest(crear_oferta.rubros) as r;

  return nueva_oferta_id;
end;
$$;

revoke execute on function public.crear_oferta(text, text, text, text, text, text, smallint[], text, text, text) from public, anon;
grant execute on function public.crear_oferta(text, text, text, text, text, text, smallint[], text, text, text) to authenticated;

-- 4. Corrección en antes_de_actualizar_empresa para evitar falsos positivos al comparar CUIT (ignora guiones)
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
