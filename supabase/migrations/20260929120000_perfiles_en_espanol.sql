-- perfiles: renames profiles to Spanish (D-031) and adds the account email
-- (D-032). The original migration is left untouched: every structure change
-- gets its own migration (D-033).

alter type public.user_role rename to rol_usuario;
alter type public.rol_usuario rename value 'applicant' to 'postulante';
alter type public.rol_usuario rename value 'company' to 'empresa';

alter table public.profiles rename to perfiles;
alter table public.perfiles rename column role to rol;
alter table public.perfiles rename column created_at to creado_el;
alter table public.perfiles rename constraint profiles_pkey to perfiles_pkey;
alter table public.perfiles rename constraint profiles_id_fkey to perfiles_id_fkey;
alter policy "profiles_select_own" on public.perfiles rename to "perfiles_select_propio";

-- The Office shows the account email of applicants and companies (D-030), and
-- with RLS the app cannot read auth.users, so it is copied here.
alter table public.perfiles add column email text;
update public.perfiles p set email = u.email from auth.users u where u.id = p.id;
alter table public.perfiles alter column email set not null;

-- Role check used by the RLS policies of every table. It lives in a schema the
-- Data API does not expose, and runs as its owner so it can read perfiles
-- without going through perfiles' own RLS.
create schema if not exists private;
grant usage on schema private to authenticated;

create function private.es_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.perfiles
    where id = (select auth.uid()) and rol = 'admin'
  );
$$;

revoke execute on function private.es_admin() from public;
grant execute on function private.es_admin() to authenticated;

create policy "perfiles_select_admin"
  on public.perfiles
  for select
  to authenticated
  using ((select private.es_admin()));

-- Replaces handle_new_user with the Spanish names. The role comes from
-- user_metadata ("rol"), which the user controls, so only 'empresa' is taken
-- from it; anything else becomes 'postulante' (D-011). Admins are promoted by
-- hand (see docs/modelo_datos.md).
drop trigger on_auth_user_created on auth.users;
drop function public.handle_new_user();

create function public.crear_perfil()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.perfiles (id, rol, email)
  values (
    new.id,
    case
      when new.raw_user_meta_data ->> 'rol' = 'empresa' then 'empresa'::public.rol_usuario
      else 'postulante'::public.rol_usuario
    end,
    new.email
  );
  return new;
end;
$$;

revoke execute on function public.crear_perfil() from public, anon, authenticated;

create trigger al_crear_usuario
  after insert on auth.users
  for each row execute function public.crear_perfil();

-- Keeps perfiles.email in step when the user changes their email in Auth.
create function public.sincronizar_email_perfil()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.perfiles set email = new.email where id = new.id;
  return new;
end;
$$;

revoke execute on function public.sincronizar_email_perfil() from public, anon, authenticated;

create trigger al_cambiar_email_usuario
  after update of email on auth.users
  for each row
  when (old.email is distinct from new.email)
  execute function public.sincronizar_email_perfil();
