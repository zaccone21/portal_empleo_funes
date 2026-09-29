# Deuda técnica

Registro de la deuda técnica del proyecto (`AGENTS.md` §14): qué es, por qué quedó así y cómo se salda.

### DT-001 — `requireRole` quedó en el DAL
Fecha: 2026-09-27 · Origen: D-018
Qué: `requireRole` (`src/lib/dal/auth.ts`) verifica la sesión y el rol dentro del DAL. Con D-018, la sesión la verifica el Route Handler, el rol lo verifica el caso de uso y el DAL no decide nada.
Por qué quedó: la función es anterior a D-018 y todavía no existe ningún caso de uso.
Cómo se salda: al escribir el primer caso de uso, pasar el chequeo de rol a `src/lib/use-cases/` (o quitar `requireRole` si deja de usarse, previa consulta), junto con sus tests.

### DT-002 — Campos provisorios de la oferta y la postulación
Fecha: 2026-09-28 · Origen: D-024, D-029
Qué:
- La oferta que ve el postulante tiene campos genéricos: título, descripción, requisitos, lugar, jornada, rubro y fecha de publicación (`src/lib/validation/ofertas.ts`). La postulación tiene id, fecha y la oferta (`src/lib/validation/postulaciones.ts`). No salen de un modelo de datos: la base todavía no está modelada.
- **Rubros provisorios** (D-029): la lista de 11 rubros de `src/lib/validation/rubros.ts` (gastronomía, comercio, construcción, jardinería, transporte, limpieza, administración, cuidados, industria, tecnología y otros) la propuso el agente. Q-006 (quién mantiene la lista y cuál es la inicial) sigue abierta. Los 7 atajos del inicio salen de esa lista (`PortadaInicio`).
Pregunta abierta: ¿el postulante ve el nombre de la empresa? Por ahora no se muestra, porque la Oficina es intermediaria obligatoria.
Por qué quedó: para avanzar con las pantallas P05, P06 y P07 sin esperar el modelo de la base.
Cómo se salda:
- Al modelar `job_offers` y `applications`, reemplazar estos schemas por los campos reales, ajustar `TarjetaOferta`, `DatosOferta`, `DetalleOferta` y `ListaPostulaciones`, y actualizar los datos de ejemplo de los tests.
- Cuando se decida Q-006, reemplazar `RUBROS` por la lista acordada (si vive en la base, traerla por la API en lugar de la constante) y revisar los atajos del inicio y los íconos de `IconoRubro`.

### DT-003 — Backend simulado para ofertas, postulaciones y CV
Fecha: 2026-09-28 · Origen: D-024, D-026
Qué:
- Las rutas `src/app/api/ofertas`, `src/app/api/postulaciones`, `src/app/api/cv`, `src/app/api/empresa/…` (perfil, ofertas, solicitud de cierre) y `src/app/api/admin/…` (resumen, ofertas, publicación, rechazo, cierre, postulaciones y CV; D-030) no usan casos de uso, DAL ni Supabase. Responden con datos ficticios (`src/mocks/datos-ejemplo.ts`) y guardan en la memoria del servidor de desarrollo (`src/mocks/almacen.ts`).
- Todas comparten **un solo almacén**, así el ciclo completo funciona de punta a punta: la empresa publica, la Oficina aprueba, la oferta aparece en `/ofertas`, el postulante se postula y la Oficina ve su CV y le cambia el estado. Los datos de ejemplo tienen varias empresas y tres postulantes ficticios con CV.
- El dueño de cada oferta es el **email** de la cuenta de la empresa (`emailEmpresa`), no un id de usuario. Los permisos (rol y dueño) se chequean en cada ruta con `exigirRol` (`src/mocks/sesion.ts`), no en un caso de uso, y no hay RLS.
- El acceso también está simulado (D-028): `src/app/api/auth/*` usa tres usuarios de prueba con cualquier contraseña (`src/mocks/sesion.ts`) y una cookie `portal_sesion_simulada` con el rol. El registro, la recuperación y la nueva contraseña validan y responden sin hacer nada. No se manda ningún email.
- Hay un único postulante y una única empresa de prueba, así que todos los que ingresen con esos emails ven los mismos datos.
- El CV subido se guarda entero en memoria, para que la Oficina lo pueda abrir. `GET /api/admin/postulaciones/<id>/cv` devuelve el PDF directo; la versión real tiene que redirigir a una URL firmada de corta duración (D-030, RNF1).
- En producción responden 404 (`src/mocks/respuestas.ts`).
- El e2e `e2e/postulacion.spec.ts` corre contra este backend simulado.
- Queda `src/app/playground/ofertas/page.tsx`, la vista previa anterior, que ya no hace falta.
Por qué quedó: la base de datos todavía no está modelada, y el usuario pidió simular el backend para avanzar con el frontend.
Cómo se salda:
- Reemplazar el cuerpo de todas las rutas simuladas por Route Handler → caso de uso → DAL (D-018), con `getCurrentUser()` y 401 sin sesión, respetando los contratos de D-020, D-024, D-026, D-027 y D-028. En `/api/auth/*`, usar Supabase Auth.
- Crear los usuarios de prueba en el proyecto de desarrollo de Supabase para los e2e (`e2e/ayudas.ts`).
- Guardar el CV en el bucket privado bajo `{user_id}/` (RNF1).
- Agregar RLS y sus tests.
- Borrar `src/mocks/` y `src/app/playground/ofertas/page.tsx` (previa consulta).
- Revisar los e2e (`postulacion.spec.ts`, `empresa.spec.ts`, `sesion.spec.ts`, `catalogo.spec.ts`, `oficina.spec.ts`): hoy asumen la memoria compartida del servidor simulado y los datos de ejemplo (por ejemplo, las ofertas `ejemplo-1` y `ejemplo-2`, o que haya una sola oferta de jardinería).

### DT-004 — Reglas provisorias del CV
Fecha: 2026-09-28 · Origen: D-026
Qué: el tamaño máximo del CV es 5 MB (`CV_TAMANO_MAXIMO_BYTES` en `src/lib/validation/cv.ts`), que es la propuesta de Q-005, todavía abierta. Subir un CV nuevo reemplaza al anterior, porque RF1.2.3 habla de 1 archivo por postulante. Solo se puede subir un PDF: crear el CV online (Q-004) no está.
Por qué quedó: para construir P04 sin esperar que se cierren Q-004 y Q-005.
Cómo se salda: cuando se decidan Q-004 y Q-005, ajustar la constante (y el límite del bucket) y confirmar si el anterior se borra o se conserva.

### DT-005 — Datos de la empresa e inicio de la empresa provisorios
Fecha: 2026-09-28 · Origen: D-027
Qué:
- Los datos de la empresa son razón social, CUIT, descripción opcional y el nombre, teléfono y email de la persona de contacto (`src/lib/validation/empresa.ts`). RF1.3.2 los nombra pero no fija su forma exacta.
- El inicio de la empresa (P09) muestra cuántas ofertas tiene en cada estado y las tres últimas (`ResumenEmpresa`). Los indicadores que pida la Oficina siguen abiertos (Q-012).
Por qué quedó: para construir P09 y P10 sin esperar el modelo de la base ni la definición de indicadores.
Cómo se salda: al modelar la tabla de empresas, ajustar el schema y el formulario. Cuando se decida Q-012, cambiar el resumen de `ResumenEmpresa` por los indicadores acordados.

### DT-006 — Pantallas de la Oficina con datos provisorios
Fecha: 2026-09-28 · Origen: D-030
Qué:
- Los 4 números del panel (P14) los eligió el agente a partir de los ejemplos de RF1.5.1. Q-012 (qué indicadores exactos y qué es un "postulante activo") sigue abierta. "Postulaciones sin revisar" cuenta las que están en `applied`.
- De cada postulante la Oficina ve solo el email, porque los datos del perfil (nombre, teléfono, barrio…) no están definidos (Q-009). Ordenar o filtrar postulantes tampoco está.
- Cambiar el estado de una postulación permite pasar de cualquier estado a cualquier otro.
- No queda registro de qué operadora publicó, rechazó o cambió un estado, ni cuándo.
- P16 (buscador de postulantes) no existe: depende de Q-006, Q-007 y Q-009. Por eso el menú de la Oficina tiene solo "Panel" y "Ofertas".
Por qué quedó: para construir P14 y P15 sin esperar esas definiciones.
Cómo se salda:
- Cuando se decida Q-012, cambiar los indicadores de `GET /api/admin/resumen` y de `ResumenOficina`.
- Cuando se decida Q-009, sumar los datos del postulante a `PostulacionOficina` y a `PostulantesDeOferta`, sin exponerlos a la empresa.
- Si hace falta auditoría o transiciones fijas, decidirlo en `DECISIONS.md` antes de modelar `applications`.
- Construir P16 cuando se cierren sus preguntas, y sumar "Postulantes" al menú (`itemsNavegacion.ts`).
