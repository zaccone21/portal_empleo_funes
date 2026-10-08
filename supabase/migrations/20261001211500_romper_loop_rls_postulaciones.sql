-- Rompe el loop de RLS (infinite recursion detected in policy for relation "postulaciones").
-- El loop se generaba porque la política de inserción de postulaciones leía la tabla ofertas 
-- (para ver si estaba publicada), y la política de selección de ofertas leía la tabla postulaciones 
-- (para ver si el usuario ya se había postulado a esa oferta, agregado en 20260929130000).
-- Usamos una función security definer para leer la oferta sin disparar las políticas de ofertas.

create function private.oferta_esta_publicada(o_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.ofertas where id = o_id and estado = 'publicada'
  );
$$;

revoke execute on function private.oferta_esta_publicada(uuid) from public, anon;
grant execute on function private.oferta_esta_publicada(uuid) to authenticated;

drop policy "postulaciones_insert_propias" on public.postulaciones;

create policy "postulaciones_insert_propias"
  on public.postulaciones
  for insert
  to authenticated
  with check (
    postulante_id = (select auth.uid())
    and origen = 'postulante'
    and (select private.oferta_esta_publicada(oferta_id))
    and exists (select 1 from public.postulantes p where p.id = postulante_id and p.cv_ruta is not null)
  );

drop policy "postulaciones_insert_admin" on public.postulaciones;

create policy "postulaciones_insert_admin"
  on public.postulaciones
  for insert
  to authenticated
  with check (
    (select private.es_admin())
    and origen = 'oficina'
    and (select private.oferta_esta_publicada(oferta_id))
  );
