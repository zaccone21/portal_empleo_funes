-- =============================================================================
-- Migración: 20261102150000_endurecer_rls_y_rpc_seguridad.sql
-- Endurecimiento de seguridad (Auditoría OWASP ASVS 5.0.0 V6.3.2, V8.3.1,
-- V14.2.3; OWASP Top 10:2025 A01/A07; OWASP API 2023 API1/API6; Ley 25.326):
--
-- 1) Cierra el acceso público (`anon` y `authenticated`) a la función
--    `public.resolver_email_por_documento(text)` creada en `20261028180000`.
--    Dejarla abierta a `anon` permitía enumerar DNIs o CUITs contra PostgREST
--    y obtener las direcciones de correo privadas de postulantes y empresas.
--    Ahora solo el servidor (`service_role`, vía `createAdminClient()` en
--    `src/lib/dal/auth.ts`) puede invocarla internamente durante el login.
-- =============================================================================

do $$
begin
  if exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'resolver_email_por_documento'
  ) then
    execute 'revoke all on function public.resolver_email_por_documento(text) from public, anon, authenticated';
    execute 'grant execute on function public.resolver_email_por_documento(text) to service_role';
  end if;
end;
$$;
