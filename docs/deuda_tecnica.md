# Deuda técnica

Registro de la deuda técnica del proyecto (`AGENTS.md` §14): qué es, por qué quedó así y cómo se salda.

### DT-001 — `requireRole` quedó en el DAL
**Saldada el 2026-09-29:** se sacó `requireRole` (y sus tests) del DAL. `getCurrentUser` quedó como única función de sesión, y el chequeo de rol va en los casos de uso.
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
- El modelo ya está definido en `docs/modelo_datos.md` (D-032). **Hecho (2026-09-29):** la oferta pasó a tener de 1 a 3 rubros (`rubros`): schemas, catálogo, `DatosOferta`, `FormularioOferta` (casillas), datos de ejemplo y tests. **Hecho también (2026-09-29, D-035):** el `sueldo` opcional en P11, los DTO, las tarjetas y los detalles.
- Cuando se decida Q-006, reemplazar `RUBROS` por la lista acordada (si vive en la base, traerla por la API en lugar de la constante) y revisar los atajos del inicio y los íconos de `IconoRubro`.

### DT-003 — Backend simulado para ofertas, postulaciones y CV
**Saldada el 2026-09-29 (D-035).** Las 20 rutas de `src/app/api/` pasan por caso de uso → DAL → Supabase, y el acceso usa Supabase Auth. Se borró todo lo simulado:
- `src/mocks/almacen.ts`: el almacén en memoria compartido por las rutas.
- `src/mocks/datos-ejemplo.ts`: las 11 ofertas, las empresas y los 3 postulantes de ejemplo, con sus CV.
- `src/mocks/dto.ts`: los DTO armados a mano. Los reemplaza `src/lib/use-cases/dto-ofertas.ts` y los casos de uso.
- `src/mocks/sesion.ts`: los 3 usuarios con cualquier contraseña, la cookie `portal_sesion_simulada` y `exigirRol`. Los reemplazan Supabase Auth, `getCurrentUser()` y `sinPermiso()` (`src/lib/use-cases/resultado.ts`).
- `src/mocks/respuestas.ts` y `src/mocks/respuestas.test.ts`: el 404 en producción de las rutas simuladas, que ya no hace falta.
- `src/mocks/README.md`.
- `src/app/playground/ofertas/page.tsx`: la vista previa vieja.

Qué se perdió: en `npm run dev` ya no hay datos de ejemplo. Las ofertas, cuentas y postulaciones se crean de verdad en la base de testing (guía en `docs/como_probar.md`). Los e2e ya no usan `ejemplo-1`, `ejemplo-2`, etc.: cada test crea sus ofertas por la API (DT-010).

Lo que decía antes:
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
- Agregar RLS y sus tests.

### DT-013 — "Paso 0" omitido (Policies de RLS para Admin)
Fecha: 2026-10-02
Qué: El plan de rediseño original pedía crear una migración de base de datos ("Paso 0") para agregar políticas de RLS `SELECT` que permitieran a la Oficina de Empleo ver los perfiles, rubros y datos personales de todos los postulantes.
Por qué no se hizo: Al revisar las migraciones existentes (`20260929120100`, `20260929120200`, `20260929120400`), se descubrió que ya existían políticas de lectura basadas en `private.es_admin()` para `postulantes`, `postulante_rubros`, `postulaciones` y `perfiles`. El "Paso 0" era redundante, por lo que se salteó intencionalmente.
Cómo se salda: Nada. Se registra aquí como evidencia de un descubrimiento del modelo de datos actual.

### DT-014 — Fallos en tests de Vitest de los Formularios (Testing Library, labels y Base UI)
Fecha: 2026-10-02
Qué: Los tests de `FormularioPerfilEmpresa`, `FormularioRegistro`, `FormularioRecuperarContrasena` y `FormularioOferta` dejaron de pasar en `vitest` porque `TestingLibraryElementError: Unable to find a label with the text...`
Por qué quedó así: Al agregar `maxLength` y `type` a `CampoTexto`, el componente `<Input>` (de Base UI) dejó de ser localizable por su label *exacto* en ciertos tests, sumado a problemas de codificación de caracteres en los archivos de test (p.ej. `Razón social` escrito como `Razn social`). Se intentó parchear `FormularioPerfilEmpresa.test.tsx` y `FormularioRegistro.test.tsx` con expresiones regulares (`new RegExp`), pero por limitaciones en cómo se aplicaron o por la forma en que Testing Library matchea los spans internos (`*` de campo obligatorio), los errores persistieron. Además, se introdujeron dependencias de `cookies()` en tests de `use-cases` que no estaban bien mockeadas en `empresa.test.ts` y `postulante.test.ts`. 
Cómo se salda: 
1. Limpiar los archivos de tests de errores de codificación (`Razn social` -> `Razón social`).
2. Actualizar las querys a Testing Library (p.ej. usar `getByRole('textbox', { name: /CUIT/i })` en vez de `getByLabelText`).
3. En `postulante.test.ts` y `empresa.test.ts`, refinar los mocks del DAL (`perfilCompletoPostulante` y `leerPerfilEmpresa`) para evitar llamadas a `cookies()` en todos los escenarios.
- Borrar `src/mocks/` y `src/app/playground/ofertas/page.tsx` (previa consulta).
- Revisar los e2e (`postulacion.spec.ts`, `empresa.spec.ts`, `sesion.spec.ts`, `catalogo.spec.ts`, `oficina.spec.ts`): hoy asumen la memoria compartida del servidor simulado y los datos de ejemplo (por ejemplo, las ofertas `ejemplo-1` y `ejemplo-2`, o que haya una sola oferta de jardinería).

### DT-004 — Reglas provisorias del CV
Fecha: 2026-09-28 · Origen: D-026
Qué: el tamaño máximo del CV es 5 MB (`CV_TAMANO_MAXIMO_BYTES` en `src/lib/validation/cv.ts`), que es la propuesta de Q-005, todavía abierta. Subir un CV nuevo reemplaza al anterior, porque RF1.2.3 habla de 1 archivo por postulante. Solo se puede subir un PDF: crear el CV online (Q-004) no está.
Por qué quedó: para construir P04 sin esperar que se cierren Q-004 y Q-005.
Cómo se salda: cuando se decidan Q-004 y Q-005, ajustar la constante (y el límite del bucket) y confirmar si el anterior se borra o se conserva.
*Parcialmente saldada 2026-10-01: Q-005 cerrada con 5 MB como límite definitivo. No requiere cambios en código ni bucket. Queda abierta solo Q-004 (crear CV online vs. solo subida).*

### DT-005 — Datos de la empresa e inicio de la empresa provisorios
Fecha: 2026-09-28 · Origen: D-027
Qué:
- Los datos de la empresa son razón social, CUIT, descripción opcional y el nombre, teléfono y email de la persona de contacto (`src/lib/validation/empresa.ts`). RF1.3.2 los nombra pero no fija su forma exacta.
- El inicio de la empresa (P09) muestra cuántas ofertas tiene en cada estado y las tres últimas (`ResumenEmpresa`). Los indicadores que pida la Oficina siguen abiertos (Q-012).
Por qué quedó: para construir P09 y P10 sin esperar el modelo de la base ni la definición de indicadores.
Cómo se salda: la tabla `empresas` ya está definida en `docs/modelo_datos.md` (D-032), con los mismos campos que el formulario. Queda crearla en la migración y conectar P10. Cuando se decida Q-012, cambiar el resumen de `ResumenEmpresa` por los indicadores acordados.

### DT-006 — Pantallas de la Oficina con datos provisorios
Fecha: 2026-09-28 · Origen: D-030
Qué:
- Los 4 números del panel (P14) los eligió el agente a partir de los ejemplos de RF1.5.1. Q-012 (qué indicadores exactos y qué es un "postulante activo") sigue abierta. "Postulaciones sin revisar" cuenta las que están en `applied`.
- De cada postulante la Oficina ve solo el email. Los datos del perfil ya están definidos (nombre, apellido, teléfono y DNI, D-032), pero P03 todavía no existe. Ordenar o filtrar postulantes tampoco está.
- Cambiar el estado de una postulación permite pasar de cualquier estado a cualquier otro.
- No queda registro de qué operadora publicó, rechazó o cambió un estado, ni cuándo. D-032 lo confirmó: solo se guarda el estado actual.
- P16 (buscador de postulantes) no existe: depende de Q-006, Q-007 y Q-009. Por eso el menú de la Oficina tiene solo "Panel" y "Ofertas".
Por qué quedó: para construir P14 y P15 sin esperar esas definiciones.
Cómo se salda:
- Cuando se decida Q-012, cambiar los indicadores de `GET /api/admin/resumen` y de `ResumenOficina`.
- Cuando exista P03, sumar los datos del postulante (D-032) a `PostulacionOficina` y a `PostulantesDeOferta`, sin exponerlos a la empresa.
- Si más adelante hace falta auditoría o transiciones fijas, es una decisión nueva que reemplaza esa parte de D-032.
- **Saldado parcialmente (2026-10-06):** P16 se construyó y se sumó "Postulantes" al menú.

### DT-007 — El estado de la postulación está en la tabla que lee el postulante
Fecha: 2026-09-29 · Origen: D-032
Qué:
- `postulaciones.estado` (Postulado, Pre-seleccionado, Derivado, No apto) está en la misma fila que el postulante puede leer para ver "Mis postulaciones" (P07).
- RLS filtra filas, no columnas. Para leer el estado sin pasar por la web hace falta la URL del proyecto, la clave publicable (`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`) y el token de sesión, que la persona ve en las cookies de su navegador.
- **Hoy no pasa:** ningún componente del navegador usa el cliente de Supabase (`src/lib/supabase/client.ts`), así que la clave no llega al navegador. Pasa si en algún momento un componente cliente usa ese cliente (por ejemplo, para subir el CV directo al bucket): la clave queda en el JavaScript público. Supabase la considera pública por diseño y protege los datos con RLS, no escondiendo la clave.
- Lo que lo oculta es el DTO del caso de uso (`PostulacionPropia` no tiene estado). RF1.2.4 pide que el postulante no lo vea, y AGENTS §7 pide que la base repita las reglas que protegen datos.
- Solo expone datos de la misma persona, no de otras.
Por qué quedó: el usuario eligió la tabla única por simplicidad, sabiendo el riesgo.
Cómo se salda, con una de dos opciones:
- mover `estado` a una tabla aparte (por ejemplo `evaluaciones`, 1 a 1 con `postulaciones`) que solo lee y escribe la Oficina;
- o dar permiso de lectura por columna sin `estado` y que la Oficina lo lea con una función propia.
En los dos casos hay que ajustar el DAL de la Oficina y sumar un test pgTAP que pruebe que el postulante no puede leer el estado.

### DT-008 — La base no tiene tipos generados; el DAL valida cada fila con Zod
Fecha: 2026-09-29 · Origen: D-035
Qué:
- AGENTS §6 pide generar los tipos desde Supabase. Todavía no están (`src/lib/supabase/database.types.ts` no existe), así que el cliente de Supabase no sabe qué columnas hay.
- Para no trabajar a ciegas, cada función del DAL (`src/lib/dal/*.ts`) valida con Zod la forma de lo que devuelve la base antes de usarla. Si una columna cambia, falla con un error claro y no más adelante.
- Esas formas están escritas a mano, y hay que mantenerlas al día con las migraciones.

Por qué quedó: los tipos se descargan del panel de Supabase y el usuario todavía no los pasó.
Cómo se salda:
- Descargar los tipos (panel de Supabase → API Docs → generar y descargar tipos) a `src/lib/supabase/database.types.ts`.
- Pasar el tipo `Database` a `createServerClient<Database>` y `createClient<Database>`.
- Revisar si alguna validación del DAL sobra. Se pueden dejar: validan en tiempo de ejecución.

### DT-009 — La lista de rubros está en dos lugares
Fecha: 2026-09-29 · Origen: D-032, D-035
Qué: los rubros están en la tabla `rubros` (cargados por la migración `20260929120200_crea_rubros.sql`) y en la constante `RUBROS` de `src/lib/validation/rubros.ts`, que usan el formulario, el filtro y los íconos. El DAL convierte entre los dos por el `slug`. Si se agrega un rubro en la base y no en la constante, las ofertas con ese rubro no pasan la validación (error 500).
Por qué quedó: la lista definitiva y quién la mantiene siguen abiertas (Q-006). Mientras sea fija, alcanza con que las dos coincidan.
Cómo se salda: cuando se decida Q-006, si la lista cambia desde la app, traerla por la API (`GET /api/rubros`) en lugar de la constante, y guardar los íconos por `slug`.

### DT-010 — Los e2e escriben en la base de testing
Fecha: 2026-09-29 · Origen: D-035
Qué:
- Los e2e corren contra el proyecto de Supabase de `.env.local`, con tres cuentas de prueba (variables `E2E_*`).
- Cada test crea sus ofertas y, al terminar, las saca del catálogo: rechaza las pendientes y cierra las publicadas (`retirarOferta` en `e2e/ayudas.ts`). Las ofertas no se pueden borrar (Q-002), así que se acumulan como rechazadas o cerradas.
- Los tests también pisan datos de las cuentas de prueba: el CV del postulante y los datos de la empresa (CUIT `30-71234567-1`).
- Si un test se corta a la mitad, puede quedar una oferta de prueba publicada ("… (e2e)").
- Playwright levanta su propio `next dev` en el puerto 3100: hay que cerrar el `npm run dev` que esté corriendo antes de `npm run test:e2e`.

Por qué quedó: es la forma más directa de probar el flujo real sin otra infraestructura.
Cómo se salda: usar un proyecto de Supabase solo para los e2e (o la base local con la CLI), y una función de limpieza que borre las ofertas de prueba.

### DT-011 — El link del email se abre en el mismo navegador
Fecha: 2026-09-29 · Origen: D-034
Qué:
- Las plantillas de email de Supabase mandan, por defecto, un link con `?code=`. Ese link solo funciona en el mismo navegador donde la persona se registró o pidió la recuperación, porque ahí queda guardada la clave que lo completa.
- Si se registra en la computadora y abre el email en el celular, el link la lleva al ingreso sin activar la cuenta.
- `/acceso/confirmar` ya acepta el otro formato (`?token_hash=&type=`), que funciona en cualquier dispositivo, pero hay que cambiar las plantillas.

Por qué quedó: cambiar las plantillas es configuración del panel de Supabase.
Cómo se salda: en Authentication → Emails, cambiar el link de las plantillas "Confirm signup" y "Reset password" por `{{ .SiteURL }}/acceso/confirmar?token_hash={{ .TokenHash }}&type=email` y `…&type=recovery` (ver `docs/como_probar.md`).

### DT-012 — Documentos que quedan solo en la máquina del usuario
Fecha: 2026-09-29 · Origen: pedido del usuario ("así no cargamos tanto el repo"), D-036
Qué:
- **Se sacaron del repositorio** con `git rm --cached`. Siguen en el disco del usuario y quedan en el historial de git:
  - `docs/Transcript.md`: la transcripción cruda de la entrevista (45 KB, con nombres de personas);
  - `docs/proceso_as-is.md`, `docs/proceso_oferta_laboral.md` y `docs/proceso_postulacion.md`: los borradores de proceso, desactualizados.
- **Nunca se subieron y ahora están ignorados:**
  - `docs/gmail_sender.txt`: probablemente las credenciales del SMTP;
  - `.agents/rules/preferencias-del-usuario.md` y `.agents/rules/traspaso-desde-claude.md`: las notas personales del usuario para el agente.
- **Carpeta nueva:** `docs/local/`, ignorada entera, para cualquier documento que tenga que quedar solo en local.

Qué se pierde:
- **Al hacer `pull` del commit que saca esos archivos, git los borra de la máquina de cada compañero.** Si alguien los quiere, que los copie antes, o los recupere del historial (`git show <commit anterior>:docs/Transcript.md`).
- `AGENTS.md` §2 los sigue listando como fuentes de contexto, marcados como "local-only": en otro clon pueden no estar.
- En otra máquina, los agentes no tienen las preferencias ni el traspaso del usuario.
- No está confirmado que Antigravity lea reglas que git ignora; hay que comprobar que las cargue.

Por qué quedó: el usuario pidió dejar en local los documentos que no hacen falta en el repositorio.
Cómo se salda: si el equipo necesita alguno, sacarlo de `.gitignore` y volver a agregarlo (o moverlo a una carpeta compartida fuera del repo). Si Antigravity no carga las notas ignoradas, llevar las preferencias a `~/.gemini/config/rules/`, que es global y no está en el repositorio.


### DT-013 — Problemas de codificación en tests y uso estricto del render prop en botones Base UI
Fecha: 2026-10-02
Qué: 
- Algunos archivos de tests (como `FormularioNuevaContrasena.test.tsx`, `FormularioIngreso.test.tsx`, etc.) tenían caracteres corruptos por problemas de encoding al escribirse o modificarse en el sistema, lo que rompía las aserciones de Testing Library (`screen.getByLabelText("Contraseña")`). Se reescribieron los strings y expresiones regulares para esquivarlos o se corrigió su codificación con scripts de node `fs`.
- Se reemplazó el uso inválido de `asChild` por `render` en el DropdownMenu de `BotonCuenta.tsx` y otros componentes que emplean `@base-ui`, puesto que Base UI no usa `asChild`. 
Por qué quedó: Por el traspaso de configuraciones y diferencias de entorno/LLM; además, la skill de `shadcn` especifica Base UI pero componentes estándar a veces traían la sintaxis Radix `asChild` que rompía.
Cómo se salda: Revisar de forma proactiva la sintaxis `render` en cualquier componente shadcn que dependa de `@base-ui` al instanciarse. Mantener precaución al editar archivos `.test.tsx` a través de CLI/PowerShell para evitar corrupciones de caracteres con ñ o tildes.

### Pantalla Mi CV movida a Mi Perfil
Fecha: 2026-10-06
Qué: Se borró la pantalla independiente `/postulante/cv` (`src/app/(postulante)/postulante/cv/page.tsx`).
Por qué: El usuario solicitó unificar la gestión del CV dentro de la pantalla "Mi perfil" (`/postulante/perfil/page.tsx`) para que no aparezca en la barra de navegación sino como un complemento del perfil.
Qué lo reemplaza: El componente `<MiCv>` ahora se renderiza directamente al final de la página `/postulante/perfil/page.tsx`. Los atajos que redirigían a la carga del CV (`AvisoPostulacion.tsx`, `AvisoCvFaltante.tsx`, `BotonPostularme.test.tsx` y `VistaPerfilPostulante.tsx`) ahora apuntan a `/postulante/perfil#cv` o `/postulante/perfil?oferta=<id>#cv`.
Pérdida de cobertura: Ninguna. El comportamiento se mantiene y los tests de `BotonPostularme` fueron actualizados. Se puede probar entrando a Mi Perfil y viendo la sección Curriculum Vitae al final, o simulando una postulación sin CV para ver la redirección.
