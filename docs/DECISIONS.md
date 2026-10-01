# Decisiones del proyecto

Registro de decisiones tomadas y de preguntas abiertas. Lo mantiene el usuario (el agente puede **proponer** entradas, pero no marcar una pregunta como resuelta por su cuenta).

- **Decididas (D-xxx):** se aplican siempre. Para cambiarlas se agrega una nueva decisión que la reemplace.
- **Abiertas (Q-xxx):** el agente **no implementa nada que dependa de ellas**. Se frena y pregunta.

Formato de una decisión nueva:

```
### D-0XX — Título corto
Fecha: AAAA-MM-DD · Reemplaza: (opcional) · Resuelve: (opcional Q-0XX)
Decisión: qué se decidió.
Motivo: por qué.
```

---

## Decididas

### D-001 — Backend e infraestructura
Fecha: 2026-09-23
Decisión: Supabase (Postgres + Auth + Storage) con RLS, y deploy en Vercel. Para desarrollar se usa un proyecto de Supabase **separado** del de producción.
Motivo: los RNF1 y RNF2 exigen RLS, buckets privados y URLs firmadas, y Supabase trae las tres cosas.

### D-002 — Convención de idiomas
Fecha: 2026-09-23
Decisión:
- Código, base de datos, commits y comentarios en inglés, usando el glosario de `AGENTS.md` §4.
- UI en español rioplatense (voseo).
- Las URLs visibles para el usuario van en español.
- El agente se comunica en español.

Motivo: los LLM rinden mejor con identificadores en inglés, y un glosario fijo evita que la misma entidad se traduzca distinto en cada archivo.

### D-003 — Testing
Fecha: 2026-09-23
Decisión:
- Vitest + Testing Library para lógica, validación, DAL y autorización.
- Playwright (mobile + desktop) para los flujos críticos.
- `npm run verify` es la definición de "terminado".

### D-004 — Flujo git
Fecha: 2026-09-23
Decisión:
- `main` es intocable y `testing` es la rama de integración.
- Se trabaja en ramas `feat/*`, `fix/*` o de sesión, creadas desde `testing`.
- Desarrollador único, sin PR.
- El agente no hace push ni merge.

### D-005 — UI kit
Fecha: 2026-09-23
Decisión: shadcn/ui estilo `base-vega` sobre `@base-ui/react` (no Radix), con íconos lucide-react y gráficos recharts (vía el componente `chart` de shadcn). Los componentes se agregan **de a uno y solo cuando una pantalla concreta los necesita**, con `npx shadcn@4.21.0 add` y previa aprobación. No se instalan componentes "por las dudas".

### D-006 — Jerarquía de fuentes de verdad
Fecha: 2026-09-23
Decisión: el orden es el de `AGENTS.md` §2. `Requerimientos.md` define el alcance. Los diagramas `proceso_*.md` son borradores con numeración de pantallas y nombres de estados desactualizados.

### D-007 — Sin borradores de ofertas
Fecha: 2026-09-23
Decisión: la oferta se crea directamente en estado `pending`. No hay estado "borrador" (RF1.3.3).

### D-008 — Estados canónicos
Fecha: 2026-09-23
Decisión:
- Oferta: `pending | published | rejected | closed`.
- Postulación: `applied | preselected | referred | not_suitable`.
- La solicitud de cierre es un flag (`close_requested`), no un estado. La oferta sigue visible hasta que el admin la cierra (RF1.3.6).

### D-009 — Frontend primero, con componentes visuales
Fecha: 2026-09-23
Decisión:
- El usuario construye la UI (con ayuda de Antigravity cuando se traba), empezando por el layout y la landing (P01).
- Los componentes de `components/<feature>/` son visuales: reciben los datos por props tipadas (la forma de los futuros DTOs) y no buscan datos.
- Hasta que exista el backend, se previsualizan en `app/playground/`, que devuelve 404 en producción.
- Los datos de ejemplo viven **solo** en `app/playground/` y en los tests, y son evidentemente ficticios.
Motivo: avanzar con el frontend sin Supabase y sin meter datos falsos en el código productivo. Cuando llegue el backend, las páginas los conectan al DAL sin reescribir los componentes.

### D-010 — Tabla `profiles` mínima
Fecha: 2026-09-24
Decisión: `profiles` tiene solo `id`, `role` y `created_at`. Cada usuario lee únicamente su propia fila; el rol no lo puede cambiar el usuario. No se agregan datos personales mientras Q-009 siga abierta.
Motivo: recolectar el mínimo (Ley 25.326) y cumplir RNF2.

### D-011 — Asignación de rol al registrarse
Fecha: 2026-09-24
Decisión: un trigger crea el perfil al crearse el usuario. Solo acepta `applicant` o `company` desde el registro; cualquier otro valor queda como `applicant`. Las cuentas admin se crean a mano y se promueven por SQL (RF1.1.4).
Motivo: `user_metadata` lo puede editar el usuario, así que no puede darle el rol admin.

### D-012 — Route Handlers y hooks con `fetch`
Fecha: 2026-09-24
Decisión: el backend HTTP usa Route Handlers `/api/...` que llaman al DAL, y el frontend usa hooks (`useNombre.ts`) con `fetch`, como en el README de referencia. Los Server Actions no son el camino por defecto. El DAL sigue siendo el único que toca Supabase y verifica permisos. Ajusta lo que D-009 dice sobre cómo llegan los datos a los componentes.

### D-013 — Manejo de errores provisorio
Fecha: 2026-09-24
Decisión: por ahora los hooks muestran el mensaje de error tal cual (`e.message`). El manejo de errores definitivo se define más adelante. Mientras tanto, el servidor no incluye stack traces ni errores crudos de la base en sus respuestas.

### D-014 — Nombres en español en el código
Fecha: 2026-09-24
Decisión: los identificadores de dominio (componentes, hooks, funciones, tipos) van en español (`Oferta`, `useOferta`), como pauta flexible. Lo técnico genérico sigue en inglés. Comentarios y nombres de tests, en inglés. Los nombres de la base están abiertos (Q-015).

### D-015 — Git: Pull Request, ramas y commits
Fecha: 2026-09-24
Decisión: se integra por Pull Request revisado por un compañero. Las ramas nuevas se llaman `feature/<tarea>` (las existentes conservan su nombre). Los commits usan `tipo: descripción` en español, con los tipos `feat`, `fix`, `style`, `refactor` y `docs`. Reemplaza lo que decía D-004 sobre el formato de los commits.

### D-016 — Estructura `src/` y sin Antigravity
Fecha: 2026-09-24
Decisión: todo el código de la app vive en `src/` y el alias `@/` apunta a `src/`. `docs/` no va nunca dentro de `public/`. Se eliminaron `GEMINI.md` y `docs/ANTIGRAVITY_SETUP.md`; la mención a Antigravity en D-009 queda obsoleta.

### D-017 — Los datos llegan por Route Handlers
Fecha: 2026-09-24
Decisión: por ahora las páginas no buscan datos en el servidor. Los componentes cliente obtienen los datos con hooks que hacen `fetch` a `/api/...`, y cada Route Handler llama al DAL. `page.tsx` y `layout.tsx` pueden existir como cáscaras que renderizan componentes cliente. Se reevalúa usar Server Components para leer datos cuando se investigue el trade-off (por ejemplo, si el rendimiento en celulares de gama baja lo justifica).

### D-018 — Casos de uso entre la API y el DAL
Fecha: 2026-09-27 · Reemplaza: en D-012, que el DAL verifica permisos; en D-017, que el Route Handler llama al DAL.
Decisión:
- Flujo: hook → Route Handler (`/api/...`) → caso de uso → DAL → Supabase.
- Route Handler: valida los datos con Zod, obtiene el usuario de la sesión con `getCurrentUser()` (si no hay, responde 401), llama a un caso de uso y traduce el resultado al status HTTP. No tiene reglas de negocio. `getCurrentUser()` es lo único del DAL que puede llamar.
- Caso de uso (`src/lib/use-cases/`): una función por acción del usuario, agrupadas en un archivo por tema (por ejemplo `postulaciones.ts`). Recibe el usuario y los datos ya validados, aplica las reglas de negocio y los permisos (rol y dueño del recurso) y arma los datos que puede ver cada rol. Devuelve el resultado o el error esperado (sin permiso, no existe, conflicto, datos inválidos) con un mensaje corto para mostrar. No conoce HTTP ni usa el cliente de Supabase.
- DAL (`src/lib/dal/`): las únicas funciones que usan el cliente de Supabase (base, Auth y Storage). Buscan y guardan; no deciden. Usan el cliente con la sesión del usuario, así RLS se aplica a cada consulta.
- RLS sigue activo en la base como segunda barrera (RNF2): si un caso de uso se olvida un chequeo, la base igual rechaza el acceso.
- Todo son funciones comunes, sin clases ni interfaces. Todo Route Handler pasa por un caso de uso, aunque sea simple.
Motivo: tener las reglas de negocio en un solo lugar, fáciles de leer y de testear, separadas del HTTP y de las consultas.

### D-019 — Paleta y tipografía municipales
Fecha: 2026-09-28
Decisión:
- Colores del sitio de la Municipalidad de Funes: verde `#074A1F` (primario), gris oscuro `#262b35` (texto) y gris medio `#868d98`.
- El gris medio da 3,4:1 sobre blanco, así que se usa solo en bordes de campos e íconos. El texto secundario usa `#636a75` (5,4:1).
- Fuentes: Be Vietnam Pro para el texto y Sora para los títulos, cargadas con `next/font/google`.
- Los valores son tokens de `src/app/globals.css`, y los componentes usan el token, nunca el hex. El detalle está en `docs/DESIGN.md`.
- No hay modo oscuro: el bloque `.dark` no se toca y el `Toaster` se fuerza a modo claro.

Motivo: identidad institucional y contraste WCAG AA (AGENTS §10) para usuarios con celulares de gama baja (RNF3).

### D-020 — Flujo de acceso
Fecha: 2026-09-28
Decisión:
- URLs, simétricas por rol (cada rol tiene su carpeta):
  - Postulante: `/postulante/ingresar`, `/postulante/registrarse`, `/postulante/recuperar-contrasena`.
  - Empresa: `/empresa/ingresar`, `/empresa/registrarse`, `/empresa/recuperar-contrasena`.
  - Admin: `/admin/ingresar`.
  - Compartida: `/nueva-contrasena`, a la que se llega desde el email de recuperación.
- Registro: solo email y contraseña. El rol lo define la pantalla, nunca un campo, y solo puede ser `applicant` o `company`.
- La confirmación de email es obligatoria (opción de Supabase Auth).
- Contraseña: 8 caracteres como mínimo y 72 como máximo (límite de Supabase), sin otras reglas. En Supabase Auth se configura el mismo mínimo.
- Admin: no tiene registro (RF1.1.4) ni "Olvidé mi contraseña". Si una operadora se olvida la clave, se la resetea alguien con acceso a Supabase.
- Contrato de `/api/auth/*`:

| Endpoint | Body | OK | Errores |
|---|---|---|---|
| `POST /api/auth/ingreso` | `{ email, password }` | 200 `{ destino }` | 400; 401 "Email o contraseña incorrectos" |
| `POST /api/auth/registro` | `{ email, password, role }` | 201, también si el email ya existe | 400 |
| `POST /api/auth/recuperar-contrasena` | `{ email }` | 204, siempre | 400 |
| `PATCH /api/auth/contrasena` | `{ password }` | 200 `{ destino }` | 400; 401 si el link venció |

- `destino` lo decide el servidor según `profiles.role` (`/ofertas`, `/empresa`, `/admin`) y tiene que ser una ruta interna. El portal por el que se ingresa no limita el rol.
- Ningún mensaje revela si una cuenta existe (AGENTS §7).

Motivo: RF1.1.1 a RF1.1.4. Pantallas separadas por portal, como pide la landing, y un contrato fijo para que el backend de Auth se implemente detrás sin tocar el frontend.

### D-021 — Tamaños táctiles y cómo se arma una pantalla
Fecha: 2026-09-28 · Reemplaza: en D-009, que los componentes de `components/<feature>/` nunca buscan datos.
Decisión:
- `Button`: `default` 44 px (`h-11`, `text-base`), `lg` 48 px, `icon` 44 px, `icon-lg` 48 px. `xs`, `sm`, `icon-xs` e `icon-sm` quedan para vistas densas de escritorio y no se usan en pantallas mobile.
- `Input`: 44 px y texto de 16 px siempre.
- Estructura: **grupo → pantalla → componentes**.
  - La pantalla es su `page.tsx`. Es un Server Component: exporta `metadata.title` y arma la pantalla con componentes de `components/<feature>/`, con sus propios textos y links.
  - En `src/app/` solo hay archivos de rutas (`page.tsx`, `layout.tsx`, `route.ts`), ningún componente.
- Un componente que envía o trae datos (por ejemplo, un formulario) llama a su hook directamente (D-017) y maneja la carga, el error y el éxito. Los componentes que solo muestran reciben todo por props.
- No hay una capa intermedia de "contenedores".
- Los hooks de mutación usan `sendJson` (`src/lib/http.ts`) y exponen `{ acción, loading, error }`. En los tests, los componentes que usan un hook se prueban con el hook simulado (mock).

Motivo: RNF3 (targets de 44 px), WCAG 2.4.2 (un título por página, que un Client Component no puede exportar) y una estructura simple de leer, donde cada pantalla muestra en un solo archivo qué componentes usa.

### D-022 — Dirección visual "Mosaico de oficios"
Fecha: 2026-09-28
Decisión:
- El portal tiene una identidad visual marcada: **un mural de azulejos con los oficios de la ciudad** en los verdes municipales, con un único acento amarillo "sol".
- **Forma firma, la "hoja":** dos esquinas muy redondeadas en diagonal.
- **Fondos de marca en verde monte**, con un lema grande en Sora.
- **Un solo momento de animación** al cargar, que respeta "reducir movimiento".
- **Tokens nuevos:** `brand-deep` `#04311a`, `brand-leaf` `#3c8c4f`, `brand-mint` `#cfe6d3` y `brand-sun` `#f2c230`. El sol nunca va en texto.
- El detalle está en `docs/DESIGN.md` §0.
- Simple de usar no significa pelado: cada pantalla nueva sigue esta dirección.

Motivo: la primera versión se veía genérica, como una plantilla. El portal representa a la Municipalidad y tiene que verse cuidado, sin perder legibilidad ni los targets de 44 px (RNF3).

### D-023 — Sin retiro de postulación
Fecha: 2026-09-28 · Resuelve: Q-008
Decisión:
- En el MVP el postulante **no puede retirar** una postulación. Si lo necesita, avisa a la Oficina.
- La empresa no ve nada de las postulaciones (regla de intermediación).

Motivo: retirar una postulación suma un endpoint, reglas nuevas (¿y si la Oficina ya lo preseleccionó o derivó?), una política RLS de borrado y un estado que D-008 no tiene. Todo eso por un caso poco probable: quien busca trabajo rara vez quiere retirarse.

### D-024 — Ofertas y postulaciones del postulante
Fecha: 2026-09-28
Decisión:
- URLs:
  - `/ofertas`: listado público (P05, RF1.4.1). El detalle se ve en la misma página (P06, RF1.4.2); cómo se muestra lo define D-025.
  - `/postulante/postulaciones`: P07.
  - `/postulante/cv`: P04 (D-026).
- Para postularse hay que tener sesión. Sin sesión, "Postularme" ofrece ingresar o crear una cuenta.
- Contrato:

| Endpoint | Body | OK | Errores |
|---|---|---|---|
| `GET /api/ofertas` | — | 200 `OfertaPublica[]`, solo ofertas `published`, con `yaTePostulaste` (D-028) | 500 |
| `POST /api/postulaciones` | `{ ofertaId }` | 201, también si ya estaba postulado | 400; 401 sin sesión; 404 oferta inexistente o no publicada; 409 sin CV (RF1.4.4) |
| `GET /api/postulaciones` | — | 200 `PostulacionPropia[]` del usuario de la sesión, las más nuevas primero, **sin estado** (RF1.2.4) | 401 |

- El postulante sale siempre de la sesión, nunca del body (AGENTS §7).
- Postularse dos veces no es un error: el resultado para la persona es el mismo.
- Las formas de los datos están en `src/lib/validation/ofertas.ts` y `postulaciones.ts`. Sus campos son **provisorios** (DT-002).
- Los errores de los hooks conservan el código HTTP (`ErrorHttp` en `src/lib/http.ts`), para que la pantalla distinga "sin sesión" (401) de "falta el CV" (409).

Motivo: RF1.4.1 a RF1.4.4 y RF1.2.4. El contrato permite construir el frontend antes que la base; el backend se implementa detrás sin tocar las pantallas.

### D-025 — Ofertas en lista con el detalle al lado, sin modal
Fecha: 2026-09-28 · Reemplaza: en D-024 y en AGENTS §10, que el detalle de la oferta se abre en un modal.
Decisión:
- Las ofertas se ven como en los portales de empleo (por ejemplo Computrabajo): **la lista y, en la misma página, el detalle de la oferta elegida**. No hay modal.
- La oferta elegida va en la URL: `/ofertas?oferta=<id>`. Así funcionan el botón "atrás", recargar la página y compartir el link.
- **Desktop:** lista a la izquierda y detalle fijo a la derecha. Si no se eligió ninguna, se muestra la primera.
- **Mobile:** sin elección se ve solo la lista. Al tocar una oferta se ve solo su detalle, con "Volver a las ofertas"; el "atrás" del celular también vuelve.
- "Postularme" queda fijo abajo del detalle.
- Si el link apunta a una oferta que ya no está publicada, se avisa en lugar de mostrar otra.

Motivo: el usuario lo había definido así. Un modal es frágil en celulares de gama baja (scroll dentro de scroll, teclado, botón "atrás" que no lo cierra). RF1.4.2 pide ver el detalle "sin cambiar de página", y esto lo cumple: es la misma página.

### D-026 — API simulada mientras no hay base de datos
Fecha: 2026-09-28 · Reemplaza: la vista previa con datos ficticios en `/playground/ofertas` (DT-003). Ajusta D-009 para este caso.
Decisión:
- Mientras la base no esté modelada, las rutas `/api/ofertas`, `/api/postulaciones` y `/api/cv` responden con un **backend simulado**:
  - datos ficticios marcados "(ejemplo)";
  - memoria del servidor de desarrollo, que se borra al reiniciar;
  - siempre un postulante con sesión.
- Así las pantallas reales se usan de punta a punta.
- Todo lo simulado vive en `src/mocks/`. **En producción esas rutas responden 404**, así los datos ficticios nunca llegan a usuarios reales.
- Respetan los contratos de D-024 y este:

| Endpoint | Body | OK | Errores |
|---|---|---|---|
| `GET /api/cv` | — | 200 `{ cv }` (null si no subió) | 401 |
| `PUT /api/cv` | multipart/form-data, campo `archivo` (PDF) | 200 `{ cv }`; reemplaza al anterior (1 CV por postulante, RF1.2.3) | 400 (no es PDF, pesa demasiado o está vacío); 401 |

- La pantalla del CV (P04) está en `/postulante/cv`. El CV no se puede abrir desde la cuenta del postulante: solo lo ve la Oficina, con URLs firmadas (RNF1).

Motivo: el usuario pidió simular el backend porque no puede modelar la base todavía. La vista previa separada confundía: parecía que las pantallas no existían.

### D-027 — Pantallas de la empresa
Fecha: 2026-09-28
Decisión:
- URLs:
  - `/empresa`: inicio (P09).
  - `/empresa/perfil`: datos de la empresa (P10).
  - `/empresa/ofertas/nueva`: publicar una oferta (P11).
  - `/empresa/ofertas`: mis ofertas (P12), con lista y detalle en la misma página (D-025) y `?oferta=<id>`.
- Contrato (simulado por ahora, D-026):

| Endpoint | Body | OK | Errores |
|---|---|---|---|
| `GET /api/empresa/perfil` | — | 200 `{ perfil }` (null si no lo cargó) | 401, 403 |
| `PUT /api/empresa/perfil` | razón social, CUIT, descripción, contacto (nombre, teléfono, email) | 200 `{ perfil }` con el CUIT en formato `XX-XXXXXXXX-X` | 400, 401, 403 |
| `GET /api/empresa/ofertas` | — | 200 `OfertaEmpresa[]` de la empresa, las más nuevas primero | 401, 403 |
| `POST /api/empresa/ofertas` | título, descripción, requisitos, lugar, jornada (todos obligatorios) | 201 `{ oferta }` en `pending` (sin borradores, D-007) | 400, 401, 403 |
| `POST /api/empresa/ofertas/<id>/solicitud-cierre` | — | 200 `{ oferta }` con `cierreSolicitado: true`; también si ya lo había pedido | 401, 403, 404 (no existe o no es suya), 409 (no está publicada) |

- `OfertaEmpresa` trae estado, motivo de rechazo (solo si fue rechazada, RF1.3.5) y el pedido de cierre. **Nunca trae datos de postulantes.**
- El CUIT se valida con el dígito verificador de AFIP.
- El inicio (P09) muestra las ofertas por estado mientras Q-012 siga abierta.
- No se ofrece editar una oferta rechazada (Q-002) ni cancelar un pedido de cierre (Q-003).
- Una empresa sin datos cargados puede publicar igual (Q-014 sigue abierta); el inicio le recuerda completarlos.

Motivo: RF1.3.1 a RF1.3.6. Mismo patrón que el área del postulante, así el backend real se implementa detrás sin tocar las pantallas.

### D-028 — Sesión, navegación por rol y accesos directos
Fecha: 2026-09-28 · Amplía: D-020 (contrato de acceso) y D-024 (ofertas)
Decisión:
- **Sesión:**
  - `GET /api/auth/sesion` responde 200 `{ usuario: { rol, email } | null }`. "Nadie ingresó" no es un error.
  - `POST /api/auth/salida` responde 204 siempre.
  - Cada área (postulante, empresa) lee la sesión una vez en su layout (`ProveedorSesion`).
- **Menú según quién ingresó:**
  - En desktop, en la barra superior.
  - En el celular, en una **barra fija abajo con ícono y palabra**; el "Publicar" de la empresa va destacado.
  - "Salir" es un botón visible, no un menú escondido. Al salir, lleva al ingreso de ese rol.
  - Sin sesión, se ofrecen "Ingresar" y "Crear cuenta".
- **Pantallas privadas sin acceso** (401 o 403): muestran "Ingresá…" con el botón para ingresar, no un error.
- **Volver después de ingresar:** el ingreso acepta `?volver=<ruta interna>` y, al entrar, lleva de vuelta ahí. Solo rutas del propio sitio.
- **Ofertas:** `GET /api/ofertas` agrega `yaTePostulaste` (true solo para el postulante con sesión que ya se postuló). La tarjeta y el detalle lo muestran, y el botón no se ofrece de nuevo. No es un estado interno (RF1.2.4).
- **Otros accesos directos:**
  - Aviso "Subí tu CV" arriba de las ofertas si al postulante le falta.
  - Cada postulación lleva a su oferta.
  - "Publicar oferta" en la lista de la empresa.
  - Links cruzados entre el ingreso de postulante y el de empresa, y "Ver las ofertas sin ingresar".
  - "Saltar al contenido" para teclado.
- **Logo de la Municipalidad** en la marca de la barra superior y del acceso, en blanco sobre el verde (filtro CSS sobre `public/logo-municipalidad-funes.png`).
- **Sesión simulada mientras no esté Supabase Auth:** tres usuarios de prueba con cualquier contraseña:
  - `postulante@ejemplo.com`;
  - `empresa@ejemplo.com`;
  - `oficina@ejemplo.com`.

  Todas las rutas de `/api/auth/*` responden con el contrato de D-020. En producción responden 404 (DT-003).

Motivo: RNF3 (usuarios con poca práctica digital, en el celular) y el pedido de dejar las cosas más a mano. En el celular el menú y un encabezado alto ocupaban casi media pantalla antes del contenido.

### D-029 — Inicio con ofertas y catálogo de ofertas
Fecha: 2026-09-28 · Amplía: D-024, D-025 y D-027
Decisión:
- **Inicio (P01, `/`):**
  - buscador "¿Qué trabajo buscás?" que lleva a `/ofertas?q=…`;
  - 7 rubros como atajos a `/ofertas?rubro=…`;
  - las 4 ofertas publicadas más recientes;
  - "Cómo postularte" en 3 pasos;
  - un bloque para empresas y, en el pie, el ingreso de la Oficina.
  Usa el mismo `GET /api/ofertas`. Se muestran las más recientes y no las "más relevantes", porque la relevancia no tiene un criterio definido.
- **Catálogo (P05 y P06, `/ofertas`):** buscar, filtrar por rubro y ordenar. Todo va en la URL:
  - `q`: texto; busca en título, descripción, requisitos, lugar, horario y rubro, sin importar tildes ni mayúsculas;
  - `rubro`: uno de la lista;
  - `orden`: `recientes` (por defecto) o `antiguas`;
  - `oferta`: la elegida (D-025). Al abrirla, se conservan los filtros.
- El filtro se hace en el navegador sobre la lista que ya trae `GET /api/ofertas`: el volumen de una ciudad es chico. Si crece, se pasa al servidor con los mismos parámetros, sin cambiar las pantallas.
- **Rubro de la oferta:** cada oferta tiene un rubro obligatorio.
  - `OfertaPublica` y `OfertaEmpresa` lo traen.
  - `POST /api/empresa/ofertas` lo exige: se suma al body de D-027.
  - La lista es **provisoria**, con 11 rubros (`src/lib/validation/rubros.ts`). Se propone que sea la misma lista de etiquetas del postulante (RF1.2.2), que sigue abierta en Q-006 (DT-002).
- El detalle de diseño está en `docs/DESIGN.md` §4 ter.

Motivo: idea del usuario (el inicio muestra ofertas, y las ofertas son un catálogo para buscar y filtrar), RF1.4.1 y RNF3. Con los filtros en la URL funcionan el "atrás" del celular y compartir el link.

### D-030 — Oficina de Empleo: panel y gestión de ofertas
Fecha: 2026-09-28
Decisión:
- URLs:
  - `/admin`: panel (P14);
  - `/admin/ofertas?estado=<estado>&oferta=<id>`: gestión de ofertas (P15), con pestañas por estado (RF1.5.2) y lista + detalle en la misma página (D-025). Sin `estado`, abre en Pendientes.
- **Panel (P14):** 4 números que llevan a resolverlos:
  - ofertas para revisar;
  - pedidos de cierre;
  - postulaciones sin revisar (estado `applied`);
  - ofertas publicadas.

  Son **provisorios** hasta que se decida Q-012 (DT-006).
- **Gestión (P15):**
  - Publicar o rechazar una oferta pendiente, con el motivo obligatorio para rechazar (RF1.5.3).
  - Cerrar una publicada, solo si la empresa pidió el cierre (RF1.5.4).
  - Ver los postulantes de la oferta, abrir su CV (RF1.5.5) y cambiar el estado de cada uno (RF1.5.6). Se permite cualquier cambio entre los 4 estados: los requerimientos no fijan un orden.
  - La Oficina ve los datos de contacto de la empresa.
  - Del postulante ve solo el email, hasta que se definan los datos del perfil (Q-009).
- Contrato (simulado por ahora, D-026). Todas las rutas responden 401 sin sesión y 403 si el rol no es `admin`:

| Endpoint | Body | OK | Errores |
|---|---|---|---|
| `GET /api/admin/resumen` | — | 200 `{ ofertasPendientes, pedidosDeCierre, ofertasPublicadas, postulacionesSinRevisar }` | 401, 403 |
| `GET /api/admin/ofertas` | — | 200 `OfertaOficina[]` de todos los estados, con la empresa (o null si no cargó sus datos), el email de la cuenta y la cantidad de postulaciones | 401, 403 |
| `POST /api/admin/ofertas/<id>/publicacion` | — | 200 `{ oferta }` en `published` | 404; 409 si ya no está pendiente |
| `POST /api/admin/ofertas/<id>/rechazo` | `{ motivo }` (obligatorio, hasta 500 caracteres) | 200 `{ oferta }` en `rejected` con el motivo | 400; 404; 409 si ya no está pendiente |
| `POST /api/admin/ofertas/<id>/cierre` | — | 200 `{ oferta }` en `closed` | 404; 409 si no está publicada o la empresa no pidió el cierre |
| `GET /api/admin/ofertas/<id>/postulaciones` | — | 200 `PostulacionOficina[]` con email, fecha, estado y el CV (nombre y tamaño, o null si no subió) | 404 |
| `PATCH /api/admin/postulaciones/<id>` | `{ estado }` | 200 `{ postulacion }` | 400; 404 |
| `GET /api/admin/postulaciones/<id>/cv` | — | El PDF del postulante | 404 si no subió CV |

- **CV:** en la versión simulada, la ruta devuelve el PDF. En la real, genera una **URL firmada de corta duración** del bucket privado y redirige a ella (RNF1, AGENTS §7). El link "Ver CV" no cambia.
- Un 409 lleva el mensaje del servidor ("Esta oferta ya fue revisada."), por si otra operadora decidió primero.
- Las formas de los datos están en `src/lib/validation/oficina.ts`.
- P16 (buscador de postulantes) no se construye: depende de Q-006, Q-007 y Q-009.
- El detalle de diseño está en `docs/DESIGN.md` §4 ter.

Motivo: RF1.5.1 a RF1.5.6. Mismo patrón que las áreas del postulante y de la empresa, así el backend real se implementa detrás sin tocar las pantallas.

### D-031 — Nombres de la base en español
Fecha: 2026-09-29 · Resuelve: Q-015 · Reemplaza: en D-002, que la base va en inglés; en D-008 y D-011, los valores de los estados y los roles.
Decisión:
- Tablas, columnas, enums y sus valores van en español, sin tildes ni ñ: `ofertas`, `postulaciones`, `motivo_rechazo`, `tamano_bytes`.
- Las fechas terminan en `_el` (`creada_el`, `publicada_el`).
- Valores:
  - rol: `postulante | empresa | admin`;
  - oferta: `pendiente | publicada | rechazada | cerrada`;
  - postulación: `postulado | preseleccionado | derivado | no_apto`.
- La migración de `profiles` (no aplicada) se reescribe como `perfiles`. Los valores en inglés que hoy usan el código y los DTOs pasan a español cuando se implementen las migraciones.
- El glosario de `AGENTS.md` §4 tiene los nombres nuevos.

Motivo: el código de dominio ya está en español (D-014) y los diagramas de flujo del usuario también. Con la base en el mismo idioma, los tipos generados de Supabase se leen como los DTOs y no hay que traducir en el DAL.

### D-032 — Modelo de datos del MVP
Fecha: 2026-09-29 · Resuelve: Q-007; los campos de Q-009 · Reemplaza: en D-010, que `perfiles` no lleva datos personales; en D-029, que la oferta tiene un solo rubro.
Decisión:
- El modelo está en `docs/modelo_datos.md`: 8 tablas (`perfiles`, `postulantes`, `empresas`, `rubros`, `postulante_rubros`, `ofertas`, `oferta_rubros`, `postulaciones`) y el bucket privado `cvs`.
- `perfiles` suma el `email` de la cuenta, copiado de Supabase Auth por un trigger. La Oficina lo ve (D-030), y con RLS la app no puede leer `auth.users`.
- **Postulante (Q-009):** nombre, apellido, teléfono y DNI (único). No se piden barrio ni fecha de nacimiento. El CV se guarda en la misma tabla: ruta, nombre del archivo, tamaño y fecha.
- **Rubros (Q-006):** una sola lista para postulantes y ofertas. El postulante elige varios. La oferta tiene **de 1 a 3**, guardados junto con la oferta por la función `crear_oferta`. La lista definitiva y quién la mantiene siguen abiertas.
- **Oferta:** suma `sueldo`, opcional y en texto libre.
- **Empresa:** la persona de contacto va en `empresas`, como en P10.
- **Origen de la postulación (Q-007):** `postulante` u `oficina` (asociada desde P16). El postulante la ve igual en "Mis postulaciones", sin estado (RF1.2.4).
- **Registro:** solo se guarda el estado actual, sin qué operadora hizo cada cambio ni cuándo (DT-006).
- El estado de la postulación queda en `postulaciones`, aunque RLS no oculta columnas (DT-007).
- Fuera del MVP: carga asistida de postulantes sin cuenta (Q-011), derivaciones y devolución de la empresa, rubro de la empresa.

Motivo: cerrar el diseño de la base para reemplazar el backend simulado (DT-003). El usuario lo decidió en esta sesión, después de comparar la propuesta del agente con su borrador en Supabase. La comparación está en `docs/modelo_datos.md`.

### D-033 — Una migración nueva por cada cambio, y registro
Fecha: 2026-09-29
Decisión:
- Todo cambio en la estructura de la base, por mínimo que sea, es una migración nueva en `supabase/migrations/`. Cuenta como cambio de estructura:
  - tablas, columnas, restricciones e índices;
  - políticas, funciones y triggers;
  - la carga de listas fijas.
- Una migración que ya se aplicó o se commiteó no se edita: cualquier corrección es otra migración.
- `docs/migraciones.md` registra cada migración: qué cambia, de qué decisión sale y cuándo se aplicó en desarrollo y en producción.
- Las migraciones se aplican a mano en el **SQL Editor** del panel de Supabase: cada archivo entero, de a uno y en orden.
- Supabase no anota en su propio historial lo que se corre en el SQL Editor, así que el registro de `docs/migraciones.md` es la única fuente de qué está aplicado. Si algún día se usa la CLI de Supabase, antes del primer `db push` hay que marcar las ya aplicadas con `supabase migration repair --status applied <versión>`, para que no las corra de nuevo.

Motivo: trazabilidad. Desde el repositorio se tiene que poder seguir cómo cambió la base, paso a paso. El usuario prefiere el SQL Editor a las herramientas de consola.

### D-034 — Acceso con Supabase Auth
Fecha: 2026-09-29 · Amplía: D-020 (contrato de acceso)
Decisión:
- `/api/auth/*` usa Supabase Auth con el mismo contrato de D-020, con estos cambios:
  - **Registro:** responde 201 `{ destino }`. `destino` es null si la cuenta se activa desde el email (la pantalla dice "Revisá tu correo"). Si Supabase ya dejó a la persona adentro (confirmación de email apagada), es el inicio de su rol, y la pantalla va ahí o a `?volver=`.
  - El registro acepta `?volver=` igual que el ingreso. "Postularme" sin cuenta → "Crear cuenta" vuelve a la oferta.
  - **Ingreso:** con la contraseña correcta pero la cuenta sin activar, responde 401 "Todavía no activaste tu cuenta…". Solo lo ve quien sabe la contraseña, así que no revela cuentas a terceros.
  - **Email no enviado:** si Supabase no puede mandar el email (límite por hora, o una dirección que su servicio de email por defecto no atiende), registro y recuperación responden 503 "No pudimos enviarte el email…".
- **Link del email:** `GET /acceso/confirmar` recibe los links de Supabase (activación y recuperación). Abre la sesión y lleva a `/nueva-contrasena` o al inicio del rol. Acepta `?code=` (el formato por defecto) y `?token_hash=&type=` (DT-011).
- **Rol:** el registro manda el rol en el metadata como `rol` (`postulante` o `empresa`), y el trigger de la base lo valida (D-011). Las cuentas de la Oficina se crean a mano en el panel y se promueven con SQL (`docs/como_probar.md`).

Motivo: RF1.1.2 a RF1.1.4 con la base real, y que el flujo "entrar → registrarse → postularse" sea un solo camino para quien entra hoy (pedido del usuario).

### D-035 — Backend real y pruebas sobre la base de testing
Fecha: 2026-09-29 · Resuelve: DT-003
Decisión:
- **Capas:** las 20 rutas de `src/app/api/` siguen D-018: ruta → caso de uso (`src/lib/use-cases/`) → DAL (`src/lib/dal/`) → Supabase, con RLS en cada consulta.
- **Resultado de un caso de uso:** el dato, o una falla esperada con su mensaje (`src/lib/use-cases/resultado.ts`). La ruta la traduce: 400, 401, 403, 404, 409 o 503 (`src/lib/respuestas-api.ts`).
- **Sin datos simulados:** se borraron `src/mocks/` y el playground (lista en DT-003). Para probar, se crean cuentas y datos de verdad en el proyecto de testing de Supabase (`docs/como_probar.md`).
- **E2E:** corren contra ese proyecto, con tres cuentas de prueba cuyas credenciales van en `.env.local` (`E2E_*`, nombres en `.env.example`). Cada test crea sus ofertas por la API y al final las saca del catálogo (DT-010).
- **Sueldo:** el sueldo opcional (D-032) ya se carga en P11 y se muestra en tarjetas y detalles.
- **Ofertas visibles para postulados:** una migración nueva deja que el postulante siga viendo las ofertas a las que se postuló aunque se cierren. Así "Mis postulaciones" muestra siempre de qué oferta se trata (RF1.2.4).
- **`/inicio`:** lleva a `/`, la portada (P01).

Motivo: el usuario pidió dejar el portal funcional sobre la base de testing, sin datos simulados, para probarlo como lo vería alguien que entra hoy.

### D-036 — El agente pasa a ser Antigravity CLI
Fecha: 2026-09-29 · Reemplaza: en D-016, que se sacan GEMINI.md y la configuración de Antigravity.
Decisión:
- Desde el 2026-09-29 el usuario trabaja con **Antigravity CLI** en lugar de Claude Code.
- **Reglas:** siguen en `AGENTS.md`, que Antigravity lee solo, más la carpeta `.agents/rules/`, con archivos `trigger: always_on`. Antigravity lee como máximo 24 KB por archivo, por eso de `AGENTS.md` se movieron a esa carpeta, sin cambios:
  - la sección 8: `comandos-y-git.md`;
  - la sección 10: `ui-y-accesibilidad.md`;
  - la sección 13: `estado-del-proyecto.md`.
- **Preferencias del usuario:** van en `.agents/rules/preferencias-del-usuario.md`. Antigravity no tiene memoria propia: el agente agrega ahí cada preferencia nueva que le enseñe el usuario.
- **Traspaso:** `.agents/rules/traspaso-desde-claude.md` resume lo hecho, el estado del repositorio, lo pendiente y lo que sigue. Se actualiza y se borra cuando deja de servir.
- **Claude Code sigue funcionando:** `CLAUDE.md` importa `AGENTS.md` y las secciones movidas.
- **Solo en la máquina del usuario:** las preferencias y el traspaso están en `.gitignore` (DT-012). Son del usuario, no del equipo, así que no se suben al repositorio.

Motivo: que el cambio de herramienta no pierda reglas, decisiones ni la forma de trabajar acordada con el usuario.

---

## Abiertas

### Q-001 — Notificaciones
¿Se avisa a la empresa cuando su oferta se aprueba o rechaza? ¿Y al postulante cuando cambia algo? ¿Por qué canal (email, WhatsApp)? *Por ahora está fuera del MVP: no se implementa.*

### Q-002 — Oferta rechazada
¿La empresa puede editar una oferta rechazada y reenviarla (vuelve a `pending`), o tiene que crear una nueva? ¿El admin puede eliminar ofertas?

### Q-003 — Solicitud de cierre
¿La empresa puede cancelar una solicitud de cierre? ¿El admin puede rechazarla (vuelve `close_requested = false`)? ¿Una oferta cerrada se puede volver a publicar?

### Q-004 — "Cargar/Crear CV" (P04)
`pantallas.md` y el diagrama mencionan **crear** un CV online además de subirlo, pero RF1.2.3 solo pide subir 1 PDF. ¿El MVP es solo subida? *Por ahora solo subida.*

### Q-005 — Límite de tamaño del CV ✅
¿Cuál es el tamaño máximo del PDF? (Propuesta: 5 MB.) ¿Reemplazar el CV borra el anterior?
*Cerrada 2026-10-01: 5 MB es el límite definitivo. Con el bucket de 1 GB de Supabase entran ~2000 CVs con el tamaño promedio real (~500 KB). Subir un CV nuevo reemplaza al anterior (upsert); RF1.2.3 habla de 1 archivo por postulante. No requiere cambios: el código y el bucket ya usan 5 MB.*

### Q-006 — Lista de etiquetas/rubros
¿Quién mantiene la lista predefinida (RF1.2.2)? ¿Un seed fijo en una migración, o un CRUD para el admin? ¿Cuál es la lista inicial?
*D-032 decidió la estructura: una tabla `rubros` compartida por postulantes y ofertas, cargada en la migración con los 11 provisorios. Siguen abiertos el contenido definitivo y quién lo mantiene.*

### Q-007 — Asociación manual desde P16 (RF1.5.8)
*Resuelta por D-032.* Cuando el admin asocia un candidato a una oferta, ¿la postulación registra el origen (`self` / `admin`)? ¿Le aparece al postulante en "Mis postulaciones"?

### Q-008 — Retiro de postulación
*Resuelta por D-023.* ¿El postulante puede retirar una postulación? ¿La empresa ve algo de las postulaciones? (Por la regla de negocio, la respuesta asumida es no.)

### Q-009 — Datos personales del postulante
¿Qué campos exactos lleva el perfil (RF1.2.1)? ¿DNI, fecha de nacimiento, dirección, barrio? Solo se piden los necesarios (Ley 25.326).
*D-032 decidió los campos: nombre, apellido, teléfono y DNI. Sigue abierto si hace falta el perfil completo para postularse (hoy alcanza con el CV, RF1.4.4).*

### Q-010 — Baja de cuenta y retención de datos
¿Cómo pide un usuario la baja o la eliminación de sus datos? ¿Cuánto tiempo se conservan los CVs y las postulaciones?

### Q-011 — Carga asistida por operadoras
El relevamiento (§4.2) habla de operadoras que cargan perfiles de personas sin acceso digital. ¿Entra en el MVP? ¿El admin puede crear postulantes?
*D-032 lo deja fuera del MVP: cada postulante es una cuenta. Si entra después, `postulantes` necesita un id propio (migración).*

### Q-012 — KPIs de los dashboards
¿Qué indicadores exactos muestran P09 (empresa) y P14 (admin)? RF1.5.1 da ejemplos ("ofertas pendientes", "postulantes activos"). ¿Qué cuenta como "postulante activo"?

### Q-013 — CIT y seguimiento a 60 días
El relevamiento describe la derivación al CIT a la 3.ª postulación no exitosa y el seguimiento a los 60 días. No están en los RF. *Fuera del MVP salvo que se decida lo contrario.*

### Q-014 — Registro de empresas
¿Una empresa registrada puede cargar ofertas enseguida, o la Oficina tiene que validarla primero (por ejemplo, verificar el CUIT)?

### Q-015 — Idioma de los nombres en la base de datos
*Resuelta por D-031.* ¿Las tablas, columnas y valores de enum van en español (`ofertas`, `postulaciones`, `postulante`) o en inglés (`job_offers`, `applications`, `applicant`)? El usuario dijo que "seguramente" en español, pero no está decidido. La migración de `profiles` (`user_role`, `applicant | company | admin`) usa inglés y **no está aplicada**; se ajusta cuando se decida. *Por ahora no se aplica ninguna migración.*
