-- Follow-up of each application (stage 2 of the closing plan; RF1.6.1 to
-- RF1.6.7; D-044 to D-047, D-054). Rejections, hires and decisions still
-- pending are counted from postulaciones, never stored as totals (D-046,
-- D-054).

create type public.decision_empresa as enum ('contratado', 'no_contratado');

alter table public.postulaciones
  add column preentrevista_el timestamptz,
  add column preentrevista_notas text,
  add column derivada_el timestamptz,
  add column decision_empresa public.decision_empresa,
  add column motivo_no_contratacion text,
  add constraint postulaciones_preentrevista_notas_largo check (char_length(preentrevista_notas) between 1 and 2000),
  -- Notes belong to a pre-interview that has a date (D-045).
  add constraint postulaciones_preentrevista_con_fecha check (preentrevista_notas is null or preentrevista_el is not null),
  add constraint postulaciones_motivo_no_contratacion_largo check (char_length(motivo_no_contratacion) between 1 and 500),
  -- A reason if and only if the company did not hire (RF1.6.4). Written with
  -- "is not distinct from" so a null decision counts as "not no_contratado".
  add constraint postulaciones_no_contratado_con_motivo check (
    (decision_empresa is not distinct from 'no_contratado') = (motivo_no_contratacion is not null)
  ),
  -- The company only decides on applicants the Office referred to it (D-044).
  add constraint postulaciones_decision_tras_derivar check (decision_empresa is null or derivada_el is not null);

-- Applications referred before this migration have no referral date. The
-- application date is the closest one known, and keeps them first in the
-- queue of pending decisions.
update public.postulaciones set derivada_el = creada_el where estado = 'derivado';

-- The Office's queue of referrals still waiting for the company, oldest
-- first (D-054). Lookups by applicant (follow-up, rejection count) use the
-- index of postulaciones_una_por_oferta.
create index postulaciones_sin_decision_idx
  on public.postulaciones (derivada_el)
  where estado = 'derivado' and decision_empresa is null;

-- The Office records the pre-interview and corrects a company's decision when
-- asked to (D-044); only postulaciones_update_admin lets anyone update. The
-- company's own decision goes through its use case with the admin client
-- (D-044, DT-019). derivada_el is stamped by the trigger below, so nobody
-- writes it.
grant update (preentrevista_el, preentrevista_notas, decision_empresa, motivo_no_contratacion)
  on table public.postulaciones to authenticated;

-- Stamps the referral date with the database clock, like publicada_el in
-- ofertas. If the status moves on, the date of the last referral stays.
create function private.antes_de_actualizar_postulacion()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.estado = 'derivado' and old.estado is distinct from 'derivado' then
    new.derivada_el := now();
  end if;

  return new;
end;
$$;

create trigger antes_de_actualizar_postulacion
  before update on public.postulaciones
  for each row execute function private.antes_de_actualizar_postulacion();

-- Work experience, written by the applicant in their profile (RF1.6.7). The
-- table-level grants and policies of postulantes already cover it.
alter table public.postulantes
  add column experiencia text,
  add constraint postulantes_experiencia_largo check (char_length(experiencia) between 1 and 2000);

-- Course referrals (D-047): registered and read only by the Office, from the
-- applicant's page (P18, P19). Independent of applications; no course
-- catalog. Nobody edits or deletes them.
create table public.derivaciones_curso (
  id uuid primary key default gen_random_uuid(),
  postulante_id uuid not null references public.postulantes (id) on delete cascade,
  curso text not null,
  derivada_el date not null default current_date,
  notas text,
  constraint derivaciones_curso_curso_largo check (char_length(curso) between 1 and 120),
  constraint derivaciones_curso_notas_largo check (char_length(notas) between 1 and 1000)
);

create index derivaciones_curso_postulante_idx on public.derivaciones_curso (postulante_id);

alter table public.derivaciones_curso enable row level security;

revoke all on table public.derivaciones_curso from anon, authenticated;
grant select on table public.derivaciones_curso to authenticated;
grant insert (postulante_id, curso, derivada_el, notas) on table public.derivaciones_curso to authenticated;

create policy "derivaciones_curso_select_admin"
  on public.derivaciones_curso
  for select
  to authenticated
  using ((select private.es_admin()));

create policy "derivaciones_curso_insert_admin"
  on public.derivaciones_curso
  for insert
  to authenticated
  with check ((select private.es_admin()));
