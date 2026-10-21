# Plan del frontend

Estado de cada pantalla del portal, ordenado por **quién la usa**. Para cada una: dónde está, qué hace hoy y qué falta para la entrega del **2 de noviembre**.

Última actualización: 2026-10-18 (después de probar el flujo completo, `docs/diagnostico-flujo.md`).

## Cómo leer los estados

| Estado | Qué significa |
|---|---|
| **Lista** | Funciona con la base real de Supabase y se probó en el navegador. |
| **Lista, falta un agregado** | Funciona, pero la consigna final le suma algo que todavía no está. |
| **Por hacer** | No existe todavía. |

## Resumen

| Usuario | Pantalla | Dirección | Estado |
|---|---|---|---|
| Cualquier persona | P01 Inicio | `/` | Lista |
| Cualquier persona | P05 y P06 Ofertas y su detalle | `/ofertas` | Lista |
| Postulante | P02 Ingresar, crear cuenta, recuperar contraseña | `/postulante/…` | Lista |
| Postulante | P03 Mi perfil (con el CV, P04) | `/postulante/perfil` | Hecha, falta revisarla en el navegador con sesión de postulante |
| Postulante | P07 Mis postulaciones | `/postulante/postulaciones` | Lista |
| Empresa | P08 Ingresar, registrarse, recuperar contraseña | `/empresa/…` | Lista |
| Empresa | P09 Inicio de la empresa | `/empresa` | Hecha, falta revisarla en el navegador con sesión de empresa |
| Empresa | P10 Datos de la empresa | `/empresa/perfil` | Lista |
| Empresa | P11 Publicar una oferta | `/empresa/ofertas/nueva` | Hecha (precarga rechazadas y cerradas), falta revisarla con sesión de empresa |
| Empresa | P12 Mis ofertas | `/empresa/ofertas` | Hecha ("Duplicar" en cerradas), falta revisarla con sesión de empresa |
| Empresa | **P17 Candidatos derivados** | (dentro de "Mis ofertas") | Hecha, falta revisarla con sesión de empresa |
| Oficina de Empleo | P13 Ingresar | `/admin/ingresar` | Lista |
| Oficina de Empleo | P14 Dashboard | `/admin` | Lista (indicadores y "Sin respuesta", revisada el 2026-10-18) |
| Oficina de Empleo | P15 Ofertas y postulaciones (colas, registros y evaluación) | `/admin/ofertas…`, `/admin/postulaciones…`, `/admin/por-comunicar` | Lista (preentrevista y derivar desde la evaluación, revisada el 2026-10-18) |
| Oficina de Empleo | P16 Postulantes | `/admin/postulantes` | Lista (varios rubros y asociar a una oferta, revisada el 2026-10-18) |
| Oficina de Empleo | **P18 Seguimiento del postulante** | `/admin/postulantes/[id]` | Lista (revisada el 2026-10-18) |
| Oficina de Empleo | **P19 Derivaciones a cursos** | dentro de `/admin/postulantes/[id]` | Lista (revisada sin registrar un curso real) |
| Todos | Menú según quién ingresó, "Salir" | en todas | Lista |

---

## Cualquier persona (sin cuenta)

### P01 — Inicio (`/`)
- **Qué hace:** buscador "¿Qué trabajo buscás?", rubros como atajos, las 4 ofertas más recientes, "Cómo postularte" en 3 pasos, un bloque para empresas y el ingreso de la Oficina abajo. Una empresa o la Oficina con sesión van directo a su inicio.
- **Falta:** nada para la entrega. *Ref.: D-029.*

### P05 y P06 — Ofertas y su detalle (`/ofertas`)
- **Qué hace:** catálogo de ofertas publicadas con búsqueda sin tildes, filtro por rubro y orden. El detalle se abre al lado (en el celular, en lugar de la lista) con "Postularme". Los filtros quedan en la dirección.
- **Al tocar "Postularme":** sin sesión, ofrece ingresar o crear cuenta y después vuelve a la oferta. Si falta el perfil o el CV, lleva a completarlos. Si está todo, confirma "Te postulaste".
- **Falta:** nada para la entrega. *Ref.: D-025, D-029, D-037.*

---

## Postulante

### P02 — Ingresar, crear cuenta y recuperar la contraseña
- **Qué hace:** ingreso con email y contraseña; registro con email, DNI y contraseña, y confirmación por email; recuperación por email.
- **Falta:** que el link del email funcione en otro dispositivo (configuración de Supabase). *Ref.: D-034, DT-011.*

### P03 — Mi perfil (`/postulante/perfil`), con el CV (P04)
- **Qué hace:** datos personales (nombre, apellido, DNI, teléfono), rubros sin tope y el CV en PDF (se revisa que sea un PDF de verdad y que pese hasta 5 MB). Se ve en modo lectura con "Editar datos".
- **Falta para la entrega:**
  - un campo de **experiencia laboral** (la consigna pide información "personal y laboral");
  - cambiar los textos que dicen "las empresas nunca ven tus datos": ahora la empresa los ve **solo si la Oficina te deriva**.
- *Ref.: D-037, D-038, D-044, RF1.6.7.*

### P07 — Mis postulaciones (`/postulante/postulaciones`)
- **Qué hace:** las ofertas a las que se postuló, con la fecha, sin estado interno. Sigue mostrando la oferta aunque se cierre.
- **Falta:** nada para la entrega. *Ref.: D-023, D-024.*

---

## Empresa

### P08 — Ingresar, registrarse y recuperar la contraseña (`/empresa/…`)
- **Qué hace:** igual que P02; el registro pide CUIT. Una empresa registrada publica enseguida: la Oficina modera cada oferta.
- **Falta:** lo mismo que P02. *Ref.: D-034, D-052.*

### P09 — Inicio de la empresa (`/empresa`)
- **Qué hace:** cuántas ofertas tiene en cada estado, acceso directo a publicar y las últimas ofertas.
- **Falta:** mostrar cuántos **candidatos derivados esperan su decisión**, con un acceso directo. *Ref.: D-051.*

### P10 — Datos de la empresa (`/empresa/perfil`)
- **Qué hace:** razón social, CUIT (con dígito verificador), descripción y persona de contacto; lectura con "Editar datos".
- **Falta:** nada para la entrega. *Ref.: D-027, D-041.*

### P11 — Publicar una oferta (`/empresa/ofertas/nueva`)
- **Qué hace:** formulario con validación al lado de cada campo, de 1 a 3 rubros y sueldo opcional. La oferta queda Pendiente; no hay borradores.
- **Falta:** abrirse **precargada** cuando se duplica una oferta. *Ref.: D-048.*

### P12 — Mis ofertas (`/empresa/ofertas`)
- **Qué hace:** lista y detalle con el estado, el motivo si fue rechazada y "Pedir el cierre" en las publicadas.
- **Falta:** el botón **"Duplicar"** en rechazadas y cerradas. *Ref.: D-048.*

### P17 — Candidatos derivados *(nueva)*
- **Qué va a hacer:** dentro de cada oferta, los candidatos que la Oficina derivó: nombre, contacto, rubros y CV. Por cada uno, **"Contrata"** o **"No contrata"** con el motivo obligatorio. Nunca muestra otras postulaciones.
- **Necesita:** la migración de la Etapa 2 (decisión y motivo en la postulación). *Ref.: D-044, RF1.6.3, RF1.6.4.*

---

## Oficina de Empleo

### P13 — Ingresar (`/admin/ingresar`)
- **Qué hace:** ingreso con cuentas creadas a mano. Una pantalla de la Oficina sin sesión lleva acá.
- **Falta:** nada para la entrega. *Ref.: D-034.*

### P14 — Dashboard (`/admin`)
- **Qué hace:** una tarjeta por cola de tareas, la lista "Para resolver hoy" y accesos a los registros.
- **Falta:** los **indicadores** que pide la consigna, con datos reales: postulantes, ofertas activas, postulaciones, derivaciones, contrataciones, rechazos y derivaciones a cursos (también suma el bonus). *Ref.: D-039, D-051.*

### P15 — Ofertas y postulaciones
- **Dónde:** colas `/admin/ofertas/por-revisar`, `/admin/ofertas/cierres-solicitados`, `/admin/postulaciones/por-evaluar`, `/admin/por-comunicar`; registros `/admin/ofertas` y `/admin/postulaciones`; evaluación `/admin/postulaciones/[id]`.
- **Qué hace:** aprobar (también varias juntas), rechazar con motivo y cerrar ofertas; evaluar postulaciones con el CV a la vista, preseleccionar, marcar no apto y marcar como derivadas. Todo probado de punta a punta el 2026-10-18.
- **Falta:** registrar la **preentrevista** (fecha y notas, opcional) en la evaluación, y poder **derivar** desde ahí sin pasar por "Por comunicar". *Ref.: D-042, D-045, RF1.6.1, RF1.6.2.*

### P16 — Postulantes (`/admin/postulantes`)
- **Qué hace:** padrón con búsqueda por nombre, DNI o email, filtro por rubro y por CV, y ficha con contacto y CV.
- **Falta:** filtrar por **varios rubros** a la vez y **asociar a una persona con una oferta** publicada, como si se hubiera postulado. *Ref.: RF1.5.7, RF1.5.8.*

### P18 — Seguimiento del postulante *(nueva)*
- **Qué va a hacer:** en la ficha del postulante, todas sus postulaciones con la preentrevista, la derivación y la decisión de la empresa con su motivo; la **cantidad de rechazos**; y sus derivaciones a cursos. *Ref.: D-046, RF1.6.5.*

### P19 — Derivaciones a cursos *(nueva)*
- **Qué va a hacer:** registrar que la Oficina derivó a una persona a un curso (nombre del curso, fecha, notas) y ver el historial. Se carga y se consulta solo desde la ficha del postulante. *Ref.: D-047, RF1.6.6.*

---

## Todos los usuarios

- **Menú según quién ingresó:** en el celular, barra fija abajo; en la computadora, arriba, con el botón de la cuenta que tiene "Salir". La Oficina tiene su menú lateral. Si alguien entra a una pantalla privada sin sesión, se le pide ingresar y vuelve ahí. *Ref.: D-028, D-040.*
- **Identidad visual:** "Mosaico de oficios", colores y fuentes de la Municipalidad, botones y campos de 44 px (`docs/DESIGN.md`).
- **Logo:** el archivo actual es chico (92 × 26 px). Conviene pedirle a la Municipalidad el logo en SVG.
- **Mensajes de error:** se muestra el mensaje del servidor tal cual. *Ref.: D-013.*

## Etapas del plan de cierre

| Etapa | Qué incluye | Estado |
|---|---|---|
| A. Diagnóstico | Probar lo que hay, de punta a punta | Hecha (2026-10-18) |
| 0. Pulir | Arreglos del diagnóstico y borrar código sin uso | Hecha (2026-10-18). Faltan correr los e2e |
| 1. Papeles | Requerimientos, pantallas, decisiones, reglas y este plan alineados con la consigna | Hecha (2026-10-18) |
| 2. Base de datos | Una migración (`20261018200000`): preentrevista, fecha de derivación, decisión de la empresa, experiencia laboral y derivaciones a cursos. Sin totales guardados ni topes (D-054) | Hecha (aplicada en testing el 2026-10-18) |
| 3. Lógica | Casos de uso y rutas de P17, P18 y P19, preentrevista, duplicar y asociar a una oferta; conteos en el DAL y la cola "sin respuesta de la empresa" en P14 (D-054) | Hecha (2026-10-18), con tests unitarios. D-055 (no se pide el cierre con candidatos sin respuesta) hecha el 2026-10-20 |
| 4. Pantallas | Lo de "Falta" de este documento | Hecha (2026-10-18). La Oficina se revisó en el navegador; empresa y postulante, solo con tests: falta verlas con su sesión y a 390 px |
| 5. Entrega | Vercel, cuentas y datos de demostración, README, ensayo de la demo | En curso: README hecho (2026-10-18). Falta Vercel, cuentas y datos de demostración, plantillas de email (DT-011), correr los e2e y ensayar |
