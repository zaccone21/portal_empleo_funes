# Registro de migraciones

Cada cambio en la estructura de la base, por chico que sea, es una **migración nueva** en `supabase/migrations/`. Una migración que ya está en el repositorio no se modifica nunca, aunque no se haya aplicado (D-033). Así se puede seguir, paso a paso, cómo cambió la base.

Cómo se usa este registro:
- Al crear una migración, se agrega una fila con qué cambia y de qué decisión sale.
- Al aplicarla, se anota la fecha en la columna del proyecto donde se aplicó ("—" = no aplicada).
- Supabase no guarda un historial de lo que se corre en el SQL Editor: **esta tabla es el único registro de qué está aplicado**.

## Cómo aplicar una migración (SQL Editor)

1. Entrá al proyecto en supabase.com. Primero **el de desarrollo**, nunca directo a producción (D-001).
2. Menú izquierdo: **SQL Editor** → **New query**.
3. Abrí el archivo de la migración en el editor de código, copiá **todo** el contenido y pegalo.
4. Tocá **Run**. Tiene que decir "Success".
5. Anotá la fecha en la tabla de abajo y seguí con la siguiente. Van **de a una y en el orden de la tabla**: cada una usa lo que creó la anterior.
6. Si alguna da error, no sigas con la siguiente. Copiá el mensaje completo.
   - Si esa migración todavía no se aplicó en ningún lado ni se commiteó, se corrige el mismo archivo.
   - Si ya se aplicó o se commiteó, se corrige con una migración nueva (D-033).

Si algún día se usa la CLI de Supabase, antes del primer `db push` hay que marcar las ya aplicadas con `supabase migration repair --status applied <versión>` (la versión es el número del principio del archivo). Si no, la CLI las corre de nuevo.

## Migraciones

El modelo completo, tabla por tabla, está en `docs/modelo_datos.md`.

| Migración | Qué cambia | Origen | Desarrollo | Producción |
|---|---|---|---|---|
| `20260924120000_create_profiles.sql` | Crea `profiles` (id, rol, fecha), el enum `user_role`, RLS y el trigger que crea el perfil al registrarse | D-010, D-011 | 2026-09-29 | — |
| `20260929120000_perfiles_en_espanol.sql` | Renombra `profiles` → `perfiles`, `user_role` → `rol_usuario` y sus valores al español; suma `email` (copiado de Auth); crea `private.es_admin()` y la lectura de todos los perfiles para la Oficina; reemplaza el trigger de alta por `crear_perfil` y suma el que sincroniza el email | D-031, D-032 | 2026-09-29 | — |
| `20260929120100_crea_postulantes_y_empresas.sql` | Crea `postulantes` (datos y CV) y `empresas` (datos y contacto) con RLS; `crear_perfil` pasa a crear también la fila del rol | D-032 | 2026-09-29 | — |
| `20260929120200_crea_rubros.sql` | Crea `rubros` con los 11 provisorios y `postulante_rubros` con su índice para P16, con RLS | D-029, D-032, RNF4 | 2026-09-29 | — |
| `20260929120300_crea_ofertas.sql` | Crea `estado_oferta`, `ofertas` y `oferta_rubros` con RLS, permisos por columna, el trigger `antes_de_actualizar_oferta` y la función `crear_oferta` | D-007, D-008, D-032 | 2026-09-29 | — |
| `20260929120400_crea_postulaciones.sql` | Crea `estado_postulacion`, `origen_postulacion` y `postulaciones` con RLS y permisos por columna | D-023, D-024, D-030, D-032 | 2026-09-29 | — |
| `20260929120500_crea_bucket_cvs.sql` | Crea el bucket privado `cvs` (PDF, 5 MB) y sus políticas | RNF1, D-026, D-032 | 2026-09-29 | — |
| `20260929130000_ofertas_visibles_para_postulados.sql` | Política nueva en `ofertas`: el postulante sigue viendo las ofertas a las que se postuló aunque se cierren ("Mis postulaciones", RF1.2.4) | D-035 | 2026-10-01 | — |
| `20261001200000_crear_perfil_con_dni_y_cuit.sql` | Actualiza la función `crear_perfil` para leer DNI y CUIT del `user_metadata` e insertarlos al registrarse (Refactor user-flow) | RF1.2.1, RF1.3.2 | 2026-10-01 | — |
| `20261001211500_romper_loop_rls_postulaciones.sql` | Rompe la recursión infinita de RLS entre `ofertas` y `postulaciones` usando una función interna para revisar si la oferta está publicada | Bugfix | 2026-10-01 | — |

Tests de RLS (pgTAP) en `supabase/tests/`: `perfiles_rls`, `postulantes_empresas_rls`, `rubros_rls`, `ofertas_rls` y `postulaciones_rls`. Prueban que cada rol ve y cambia solo lo suyo. Necesitan la CLI de Supabase (`supabase test db`) y todavía no se corrieron.
