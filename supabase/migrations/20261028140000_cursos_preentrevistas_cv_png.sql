-- Consolidated migration for:
-- 1. Application last-action timestamp (`actualizada_el`) for recent-first ordering.
-- 2. Pre-interview state (`no_agendada | pendiente_confirmacion | agendada`) and email confirmation token (`preentrevista_token`).
-- 3. Office course catalog (`public.cursos`) and optional `curso_id` reference on `public.derivaciones_curso`.
-- 4. PNG CV support (`image/png`, `/cv.png`) in the `cvs` storage bucket and its RLS policies.

-- 1 & 2. Application timestamp and pre-interview state/confirmation
do $$
begin
  if not exists (select 1 from pg_type where typname = 'estado_preentrevista') then
    create type public.estado_preentrevista as enum (
      'no_agendada',
      'pendiente_confirmacion',
      'agendada'
    );
  end if;
end
$$;

alter table public.postulaciones
  add column if not exists actualizada_el timestamptz not null default now(),
  add column if not exists preentrevista_estado public.estado_preentrevista not null default 'no_agendada',
  add column if not exists preentrevista_token uuid;

-- Backfill existing rows so nothing breaks
update public.postulaciones
set actualizada_el = coalesce(derivada_el, preentrevista_el, creada_el);

update public.postulaciones
set preentrevista_estado = 'agendada'
where preentrevista_el is not null
  and preentrevista_estado = 'no_agendada';

create index if not exists postulaciones_actualizada_el_idx
  on public.postulaciones (actualizada_el desc);

create index if not exists postulaciones_preentrevista_token_idx
  on public.postulaciones (preentrevista_token)
  where preentrevista_token is not null;

grant update (
  preentrevista_el,
  preentrevista_notas,
  preentrevista_estado,
  preentrevista_token,
  actualizada_el,
  decision_empresa,
  motivo_no_contratacion
) on table public.postulaciones to authenticated;

-- Update trigger function to always stamp actualizada_el and keep derivada_el behavior
create or replace function private.antes_de_actualizar_postulacion()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.estado = 'derivado' and old.estado is distinct from 'derivado' then
    new.derivada_el := now();
  end if;

  new.actualizada_el := now();

  return new;
end;
$$;

-- Publicly callable RPC so the candidate can confirm or decline their pre-interview from the email link
create or replace function public.confirmar_preentrevista_por_token(
  p_token uuid,
  p_confirmar boolean
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
begin
  if p_token is null then
    return false;
  end if;

  if p_confirmar then
    update public.postulaciones
    set preentrevista_estado = 'agendada',
        preentrevista_token = null,
        actualizada_el = now()
    where preentrevista_token = p_token
      and preentrevista_el is not null
    returning id into v_id;
  else
    update public.postulaciones
    set preentrevista_estado = 'no_agendada',
        preentrevista_el = null,
        preentrevista_notas = null,
        preentrevista_token = null,
        actualizada_el = now()
    where preentrevista_token = p_token
    returning id into v_id;
  end if;

  return v_id is not null;
end;
$$;

revoke all on function public.confirmar_preentrevista_por_token(uuid, boolean) from public;
grant execute on function public.confirmar_preentrevista_por_token(uuid, boolean) to anon, authenticated;

-- 3. Office course catalog (`public.cursos`) and link from `public.derivaciones_curso`
create table if not exists public.cursos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  descripcion text,
  modalidad text,
  horario text,
  activo boolean not null default true,
  creado_el timestamptz not null default now(),
  constraint cursos_nombre_largo check (char_length(trim(nombre)) between 1 and 120),
  constraint cursos_descripcion_largo check (descripcion is null or char_length(trim(descripcion)) between 1 and 1000),
  constraint cursos_modalidad_largo check (modalidad is null or char_length(trim(modalidad)) between 1 and 100),
  constraint cursos_horario_largo check (horario is null or char_length(trim(horario)) between 1 and 120)
);

alter table public.cursos enable row level security;

revoke all on table public.cursos from anon, authenticated;
grant select, insert, update on table public.cursos to authenticated;

drop policy if exists "cursos_select_admin" on public.cursos;
create policy "cursos_select_admin"
  on public.cursos
  for select
  to authenticated
  using ((select private.es_admin()));

drop policy if exists "cursos_insert_admin" on public.cursos;
create policy "cursos_insert_admin"
  on public.cursos
  for insert
  to authenticated
  with check ((select private.es_admin()));

drop policy if exists "cursos_update_admin" on public.cursos;
create policy "cursos_update_admin"
  on public.cursos
  for update
  to authenticated
  using ((select private.es_admin()))
  with check ((select private.es_admin()));

alter table public.derivaciones_curso
  add column if not exists curso_id uuid references public.cursos (id) on delete set null;

grant insert (postulante_id, curso_id, curso, derivada_el, notas)
  on table public.derivaciones_curso to authenticated;

-- 4. Support PNG in addition to PDF in the `cvs` bucket
update storage.buckets
set allowed_mime_types = array['application/pdf', 'image/png']
where id = 'cvs';

drop policy if exists "cvs_insert_propio" on storage.objects;
create policy "cvs_insert_propio"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'cvs'
    and name in (
      (select auth.uid())::text || '/cv.pdf',
      (select auth.uid())::text || '/cv.png'
    )
    and exists (select 1 from public.postulantes p where p.id = (select auth.uid()))
  );

drop policy if exists "cvs_select_propio" on storage.objects;
create policy "cvs_select_propio"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'cvs'
    and name in (
      (select auth.uid())::text || '/cv.pdf',
      (select auth.uid())::text || '/cv.png'
    )
  );

drop policy if exists "cvs_update_propio" on storage.objects;
create policy "cvs_update_propio"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'cvs'
    and name in (
      (select auth.uid())::text || '/cv.pdf',
      (select auth.uid())::text || '/cv.png'
    )
  )
  with check (
    bucket_id = 'cvs'
    and name in (
      (select auth.uid())::text || '/cv.pdf',
      (select auth.uid())::text || '/cv.png'
    )
  );

drop policy if exists "cvs_delete_propio" on storage.objects;
create policy "cvs_delete_propio"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'cvs'
    and name in (
      (select auth.uid())::text || '/cv.pdf',
      (select auth.uid())::text || '/cv.png'
    )
  );
