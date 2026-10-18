# Diagnóstico del flujo actual

Fecha: 2026-10-18 · Rama: `style/admin-view` (con los cambios en stage sin commitear) · Base: proyecto de testing de Supabase.

Qué es: el resultado de probar, sin cambiar código, lo que el portal ya hace, antes de sumar lo que pide la consigna final (`docs/Beex_Funes_Tech_Lab_Proyecto_Final.md`). Sirve para saber qué se pule primero.

## Cómo se probó

- **Chequeos automáticos:** `npm run typecheck`, `lint`, `test` y `build`.
- **Recorrido real** en Chrome contra `npm run dev` (puerto 3000), con las tres cuentas de prueba (las de `docs/como_probar.md`, 1.3). Se usó una oferta de prueba, "Ayudante de cocina (diagnóstico)", que al final quedó **cerrada**: no está en el catálogo.
- **Celular:** se simuló un ancho de 390 px cargando las páginas en un iframe, porque la ventana del navegador no se podía achicar.
- **No se corrió** `npm run test:e2e`: `.env.local` no tiene las variables `E2E_*`.

## Resultado general

**El flujo básico funciona de punta a punta.** El recorrido fue: la empresa publica, la Oficina aprueba, la oferta aparece en el catálogo, el postulante se postula, la Oficina lo evalúa con el CV a la vista, lo preselecciona y lo deriva, la empresa pide el cierre y la Oficina cierra la oferta. No hubo errores en la consola.

| Chequeo | Resultado |
|---|---|
| `npm run typecheck` | OK |
| `npm run lint` | OK, sin avisos |
| `npm run test` | OK: 38 archivos, 225 tests |
| `npm run build` | OK: 46 páginas |
| `npm run test:e2e` | No se corrió (faltan las variables `E2E_*`) |

## Por rol

### Sin sesión
| Paso | Resultado | Evidencia |
|---|---|---|
| Portada `/` | OK | Buscador, rubros, ofertas recientes |
| Catálogo `/ofertas` y detalle | OK | Lista y detalle al lado; en el celular el detalle reemplaza a la lista |
| Ingreso y registro (postulante, empresa y Oficina) | OK | Formularios visibles a 390 px |
| `/admin` sin sesión | **Falla** | Redirige a `/acceso/admin`, que da **404** (`(admin)/layout.tsx:18`, `lib/admin/datos.ts:15`) |
| APIs privadas sin sesión | OK | `/api/admin/resumen` y `/api/postulaciones` responden 401 |

### Empresa
| Paso | Resultado | Evidencia |
|---|---|---|
| Ingresar | OK | Lleva a `/empresa` con el resumen por estado |
| Publicar oferta | OK | Queda **Pendiente** y se abre en "Mis ofertas" |
| Ver el motivo de rechazo | OK | Se muestra en la oferta rechazada |
| Datos de la empresa | OK | Vista de lectura con "Editar datos" |
| Pedir el cierre | OK | Pide confirmación y después marca "Pediste el cierre" |
| Menú "Mi empresa" → Salir | OK | |

### Oficina
| Paso | Resultado | Evidencia |
|---|---|---|
| Dashboard | OK | 4 indicadores y la lista "Para resolver hoy" |
| Ofertas por revisar → Aprobar | OK | La oferta pasa a Publicada y aparece en `/ofertas` |
| Registro de ofertas, pestañas y panel | OK | |
| Postulaciones nuevas → Evaluar | OK | Pantalla con los datos de la oferta, el postulante y el visor del CV (URL firmada) |
| Preseleccionar | OK | La postulación pasa a "Por comunicar / derivar" |
| Marcar como derivado | OK | Estado Derivado |
| Cierres solicitados → Cerrar oferta | OK | Pide confirmación y la oferta sale del catálogo |
| Postulantes y Empresas | OK | |
| Clic en una fila de **Postulaciones** (registro y nuevas) | **Parcial** | Solo marca la fila: esas pantallas no tienen panel. Para entrar hay que tocar "Ver" o "Evaluar →" |
| Admin a 390 px | **Parcial** | Se puede usar, pero el dashboard y las tablas tienen scroll horizontal |
| Badge del menú "Por comunicar" | Detalle | El número se corta ("1..") |

### Postulante
| Paso | Resultado | Evidencia |
|---|---|---|
| Ingresar | OK | |
| Postularse | OK | "Te postulaste a esta oferta" y la marca "Te postulaste" en la tarjeta |
| Mis postulaciones | OK | Oferta y fecha, **sin estado** (RF1.2.4); sigue mostrando la oferta después de que se cierra |
| Mi perfil con CV y rubros | OK | |
| El servidor rechaza un archivo que no es PDF | OK | 400 "El archivo no es un PDF válido…" y 400 "Tiene que ser un archivo PDF." |
| El postulante pide APIs de la Oficina o de la empresa | OK | 403 |

## Avance de la Etapa 0 (2026-10-18)

| Punto | Estado |
|---|---|
| 1. 404 de `/admin` sin sesión | **Arreglado:** `(admin)/layout.tsx` y `lib/admin/datos.ts` redirigen a `/admin/ingresar` (comprobado con curl: 307 a `/admin/ingresar`) |
| 2. e2e desactualizados | **Actualizados:** `postulacion.spec.ts` y `sesion.spec.ts` (CV en Mi perfil, "Salir" dentro del menú de la cuenta) y `oficina.spec.ts` reescrito para la UI nueva. **No se corrieron:** Playwright necesita frenar el `npm run dev` del puerto 3000 y tener las variables `E2E_*` |
| 3. Migración sin registrar | **Anotada** en `docs/migraciones.md` con la fecha "¿?": falta que el usuario confirme si está aplicada |
| 5. Clic en las filas de Postulaciones | **Arreglado:** `AdminTable` acepta `hrefFila`; en "Postulaciones" y "Postulaciones nuevas", tocar la fila (o Enter) abre la evaluación. Test en `admin-table.test.tsx`; comprobado en el navegador |
| 6. Admin en el celular | **Revisado, sin cambios:** a 390 px la página no se desborda (`scrollWidth` igual a `clientWidth`). Las tablas se desplazan dentro de su contenedor, con la primera columna fija |
| Extra: Mi perfil sin sesión mostraba dos avisos de "Ingresá" | **Arreglado:** el CV va en `components/postulante/SeccionCv.tsx`, que solo se muestra con sesión de postulante. Test en `SeccionCv.test.tsx`; comprobado en el navegador sin sesión y con sesión |
| Extra: título "Mi perfil — Portal de Empleo — Portal de Empleo Funes" | **Arreglado:** ahora es "Mi perfil — Portal de Empleo Funes" |
| Extra: el número del menú "Por comunicar" se cortaba | **Arreglado** (`shrink-0`): el número se ve completo |
| 8. Código huérfano | **Borrado** con el OK del usuario: 37 archivos, más el código muerto de casos de uso, DAL, validación y fechas. Incluye las rutas `api/admin/*` que solo usaban los e2e: la Oficina decide con Server Actions, y ahora los e2e también lo hacen por la pantalla. Detalle en **DT-015** |
| Docs | `DESIGN.md` (catálogo de la Oficina y §11), `como_probar.md`, `migraciones.md` y `.agents/rules/estado-del-proyecto.md` alineados con el código; `deuda_tecnica.md` pasado a UTF-8 |

`npm run verify` después de los cambios: OK (38 archivos y 229 tests; build compilado).

**e2e:** siguen **sin correr**. Para correrlos: cerrar el `npm run dev`, cargar las variables `E2E_*` (en `.env.local` o en la terminal) y correr `npm run test:e2e`.

## Lista priorizada para pulir (Etapa 0)

1. **404 de `/admin` sin sesión:** que redirija a `/admin/ingresar`.
2. **e2e desactualizados:** `postulacion.spec.ts` y `sesion.spec.ts` usan `/postulante/cv`; `oficina.spec.ts` está escrito para la UI vieja. Además hay que cargar las variables `E2E_*` para poder correrlos.
3. **Migración sin registrar:** `20261006183000_crear_perfil_con_nombre_apellido.sql` no está en `docs/migraciones.md`, así que no se sabe si está aplicada. Hay que confirmarlo y anotarlo.
4. **Textos que la consigna deja viejos:** el perfil del postulante dice "Las empresas nunca ven tu información personal…" y "Las empresas no ven tus datos". Con la regla nueva (la empresa ve a los derivados) hay que cambiarlos junto con esa funcionalidad.
5. **Postulaciones:** al tocar la fila, que abra la evaluación directamente o un panel, como en Ofertas.
6. **Admin en el celular:** decidir si se adapta (por ejemplo, ocultar columnas) o si se declara para escritorio. RNF3 apunta sobre todo al postulante y la empresa.
7. **Datos de demo:** la base de testing tiene datos personales reales (nombre, DNI, teléfono y CV del desarrollador). Para la entrega hay que reemplazarlos por datos inventados (consigna §2, AGENTS §7).
8. **Código huérfano** (ya detectado en la auditoría): la UI vieja de `components/oficina/*`, `features/*/ui`, `hooks/useOficina.ts` y 6 rutas `api/admin` sin consumidor. Se borran con tu OK, archivo por archivo.

## Lo que no se probó

- `npm run test:e2e` (faltan las variables `E2E_*`).
- **Registro** de cuentas nuevas y recuperación de contraseña: mandan emails reales por el SMTP de testing y no se quiso crear cuentas.
- **Rechazar** una oferta desde la UI: no había ninguna pendiente aparte de la de prueba, que se aprobó. Hay ofertas rechazadas de antes con su motivo, y la empresa lo ve.
- **Subir un CV válido:** no se reemplazó el CV de la cuenta de prueba. El que está cargado se subió por la UI el 1 de octubre y se abre bien.
- Que el postulante no pueda leer el estado de su postulación **directo desde Supabase**: es la deuda DT-007, conocida y no probada.
- **Nota sobre la herramienta:** en dos momentos los clics automáticos dejaron de llegar a la página. Se comprobó que era la extensión del navegador y no la app: un clic por JavaScript sí funcionaba, y en una pestaña nueva el mismo clic anduvo. Esos pasos se hicieron con `element.click()`.
