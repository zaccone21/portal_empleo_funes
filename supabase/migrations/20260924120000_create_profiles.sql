-- profiles: one row per auth user, holds the role (RF1.1.2, RF1.1.3, RF1.1.4, RNF2).

create type public.user_role as enum ('applicant', 'company', 'admin');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.user_role not null,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Clients can only read their own row. There are no insert, update or delete
-- policies: profiles are created by the trigger below and the role can only be
-- changed with the secret key or from the SQL editor.
revoke all on table public.profiles from anon, authenticated;
grant select on table public.profiles to authenticated;

create policy "profiles_select_own"
  on public.profiles
  for select
  to authenticated
  using (id = (select auth.uid()));

-- Creates the profile when an auth user is created. The role is read from
-- user_metadata, which the user controls, so only the two self-service roles
-- are accepted. Anything else becomes 'applicant'. Admin accounts are
-- pre-created by the Office and promoted manually (RF1.1.4):
--   update public.profiles set role = 'admin' where id = '<user id>';
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, role)
  values (
    new.id,
    case
      when new.raw_user_meta_data ->> 'role' = 'company'
        then 'company'::public.user_role
      else 'applicant'::public.user_role
    end
  );
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
