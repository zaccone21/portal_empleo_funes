-- Cifras públicas del inicio (P01, D-059): cuántas ofertas hay publicadas,
-- cuántas empresas y postulantes tienen cuenta, a cuántas personas derivó la
-- Oficina y cuántas fueron contratadas.
--
-- Quien entra sin cuenta no puede leer esas tablas (RLS), y no tiene que poder.
-- Esta función devuelve solo los totales, nunca filas ni datos personales, y
-- corre con los permisos de su dueño (security definer) para poder contarlos.

create function public.estadisticas_publicas()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'ofertas_publicadas', (select count(*) from public.ofertas where estado = 'publicada'),
    'empresas', (select count(*) from public.empresas),
    'postulantes', (select count(*) from public.postulantes),
    'derivaciones', (select count(*) from public.postulaciones where estado = 'derivado'),
    'contrataciones', (select count(*) from public.postulaciones where decision_empresa = 'contratado')
  );
$$;

revoke execute on function public.estadisticas_publicas() from public;
grant execute on function public.estadisticas_publicas() to anon, authenticated;
