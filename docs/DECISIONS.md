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

### Q-005 — Límite de tamaño del CV
¿Cuál es el tamaño máximo del PDF? (Propuesta: 5 MB.) ¿Reemplazar el CV borra el anterior?

### Q-006 — Lista de etiquetas/rubros
¿Quién mantiene la lista predefinida (RF1.2.2)? ¿Un seed fijo en una migración, o un CRUD para el admin? ¿Cuál es la lista inicial?

### Q-007 — Asociación manual desde P16 (RF1.5.8)
Cuando el admin asocia un candidato a una oferta, ¿la postulación registra el origen (`self` / `admin`)? ¿Le aparece al postulante en "Mis postulaciones"?

### Q-008 — Retiro de postulación
¿El postulante puede retirar una postulación? ¿La empresa ve algo de las postulaciones? (Por la regla de negocio, la respuesta asumida es no.)

### Q-009 — Datos personales del postulante
¿Qué campos exactos lleva el perfil (RF1.2.1)? ¿DNI, fecha de nacimiento, dirección, barrio? Solo se piden los necesarios (Ley 25.326).

### Q-010 — Baja de cuenta y retención de datos
¿Cómo pide un usuario la baja o la eliminación de sus datos? ¿Cuánto tiempo se conservan los CVs y las postulaciones?

### Q-011 — Carga asistida por operadoras
El relevamiento (§4.2) habla de operadoras que cargan perfiles de personas sin acceso digital. ¿Entra en el MVP? ¿El admin puede crear postulantes?

### Q-012 — KPIs de los dashboards
¿Qué indicadores exactos muestran P09 (empresa) y P14 (admin)? RF1.5.1 da ejemplos ("ofertas pendientes", "postulantes activos"). ¿Qué cuenta como "postulante activo"?

### Q-013 — CIT y seguimiento a 60 días
El relevamiento describe la derivación al CIT a la 3.ª postulación no exitosa y el seguimiento a los 60 días. No están en los RF. *Fuera del MVP salvo que se decida lo contrario.*

### Q-014 — Registro de empresas
¿Una empresa registrada puede cargar ofertas enseguida, o la Oficina tiene que validarla primero (por ejemplo, verificar el CUIT)?

### Q-015 — Idioma de los nombres en la base de datos
¿Las tablas, columnas y valores de enum van en español (`ofertas`, `postulaciones`, `postulante`) o en inglés (`job_offers`, `applications`, `applicant`)? El usuario dijo que "seguramente" en español, pero no está decidido. La migración de `profiles` (`user_role`, `applicant | company | admin`) usa inglés y **no está aplicada**; se ajusta cuando se decida. *Por ahora no se aplica ninguna migración.*
