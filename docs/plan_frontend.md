# Plan del frontend

Estado de cada pantalla del portal, ordenado por **quién la usa**. Para cada una: qué hace, dónde está, qué está hecho, qué falta y cómo completarlo.

Última actualización: 2026-09-28.

## Cómo leer los estados

| Estado | Qué significa |
|---|---|
| **Lista** | La pantalla funciona completa. |
| **Lista, con datos simulados** | La pantalla está terminada y se puede usar en `npm run dev`, pero los datos vienen de un backend de mentira (`src/mocks/`). Falta conectarla a la base de datos. |
| **Lista, sin backend** | La pantalla está terminada, pero todavía no hay nada del otro lado: al enviar, muestra un error. |
| **En curso** | Se está haciendo ahora. |
| **Pendiente** | No empezó, pero no hay nada que la frene. |
| **Bloqueada** | No se puede hacer hasta que alguien decida algo (se indica qué). |

## Resumen

| Usuario | Pantalla | Dirección | Estado |
|---|---|---|---|
| Cualquier persona | P01 Inicio | `/` | Lista, con datos simulados |
| Cualquier persona | P05 y P06 Catálogo de ofertas | `/ofertas` | Lista, con datos simulados |
| Postulante | P02 Ingresar, registrarse y recuperar la contraseña | `/postulante/…` y `/nueva-contrasena` | Lista, con datos simulados |
| Postulante | P03 Mi perfil | `/postulante/perfil` | Bloqueada |
| Postulante | P04 Mi CV | `/postulante/cv` | Lista, con datos simulados |
| Postulante | P07 Mis postulaciones | `/postulante/postulaciones` | Lista, con datos simulados |
| Empresa | P08 Ingresar, registrarse y recuperar la contraseña | `/empresa/…` | Lista, con datos simulados |
| Empresa | P09 Inicio de la empresa | `/empresa` | Lista, con datos simulados |
| Empresa | P10 Datos de la empresa | `/empresa/perfil` | Lista, con datos simulados |
| Empresa | P11 Publicar una oferta | `/empresa/ofertas/nueva` | Lista, con datos simulados |
| Empresa | P12 Mis ofertas | `/empresa/ofertas` | Lista, con datos simulados |
| Oficina de Empleo | P13 Ingresar | `/admin/ingresar` | Lista, con datos simulados |
| Oficina de Empleo | P14 Panel | `/admin` | Lista, con datos simulados (indicadores provisorios) |
| Oficina de Empleo | P15 Gestión de ofertas | `/admin/ofertas` | Lista, con datos simulados |
| Oficina de Empleo | P16 Buscador de postulantes | `/admin/postulantes` | Bloqueada |
| Todos | Menú según quién ingresó, con "Salir" | en todas | Lista, con datos simulados |

---

## Cualquier persona (sin cuenta)

### P01 — Inicio
- **Qué hace:** sirve para empezar a buscar trabajo enseguida y lleva a cada tipo de usuario a su lugar (RF1.1.1):
  - un buscador "¿Qué trabajo buscás?" y los rubros más comunes como atajos, que abren el catálogo ya filtrado;
  - las 4 ofertas más recientes, con "Ver todas las ofertas";
  - "Cómo postularte" en 3 pasos, con "Crear mi cuenta";
  - un bloque para empresas ("Registrar mi empresa" o "Ya tengo cuenta");
  - abajo, el ingreso de la Oficina de Empleo.
- **Dónde:** `/`.
- **Estado:** lista, con datos simulados (las ofertas son las de ejemplo).
- **Qué falta:**
  - Conectar las ofertas a la base real (usa la misma ruta que el catálogo).
  - Decidir qué pasa con la landing que está armando el equipo en `/landing`: no se tocó. Si la del equipo reemplaza a esta, conviene conservar el buscador y las ofertas recientes.
  - Confirmar la lista de rubros de los atajos. *Ref.: D-029, DT-002, Q-006.*

### P05 y P06 — Catálogo de ofertas
- **Qué hace:** muestra todas las ofertas publicadas, como un catálogo:
  - **buscar** por palabra (puesto, tarea, barrio…), sin importar tildes;
  - **filtrar por rubro** con botones (Gastronomía, Construcción, Jardinería…);
  - **ordenar** por más recientes o más antiguas;
  - una frase dice qué se está viendo ("Hay 2 ofertas de Gastronomía") y, si no hay resultados, ofrece ver todas.

  La búsqueda y los filtros quedan en la dirección de la página, así se pueden compartir y el "atrás" funciona.

  Al elegir una oferta, su detalle (qué vas a hacer, qué piden, rubro, lugar y horario) aparece en la misma página:
  - en la computadora, al lado de la lista;
  - en el celular, en lugar de la lista, con "Volver a las ofertas".

  Desde el detalle se toca "Postularme".
- **Dónde:** `/ofertas`, con los filtros en la dirección: `?q=cocina`, `?rubro=jardineria`, `?orden=antiguas` y `?oferta=<id>` con una oferta elegida.
- **Estado:** lista, con datos simulados.
- **Qué pasa al tocar "Postularme":**
  - Si la persona no ingresó, se le ofrece ingresar o crear una cuenta.
  - Si no subió el CV, se le pide que lo suba, con un botón a "Mi CV" que después la trae de vuelta a la oferta.
  - Si todo está bien, se confirma la postulación. Nunca se muestra el estado interno.
- **Qué falta:**
  - Conectar con la base de datos real.
  - Definir los campos definitivos de una oferta; hoy son título, descripción, requisitos, lugar, horario, rubro y fecha.
  - Confirmar la lista de rubros.
  - Decidir si el postulante ve el nombre de la empresa (hoy no lo ve).
- **Cómo completarlo:** cuando exista la tabla de ofertas, reemplazar el backend simulado de `/api/ofertas` y `/api/postulaciones` por el real. Las pantallas no cambian si se respeta la misma forma de los datos. Si algún día hay muchas ofertas, el filtro puede pasar al servidor con los mismos parámetros. *Ref.: D-024, D-025, D-029, DT-002, DT-003, Q-006.*

---

## Postulante

### P02 — Ingresar, crear cuenta y recuperar la contraseña
- **Dónde:** `/postulante/ingresar`, `/postulante/registrarse`, `/postulante/recuperar-contrasena` y `/nueva-contrasena` (a esta se llega desde el email).
- **Qué hace:**
  - Ingresar con email y contraseña.
  - Crear la cuenta con email y una contraseña de 8 caracteres o más, y después confirmar el email.
  - Pedir un link para cambiar la contraseña.
- **Estado:** lista, con datos simulados.
  - Se puede ingresar con el usuario de prueba `postulante@ejemplo.com` y cualquier contraseña.
  - Si llegaste al ingreso desde otra pantalla (por ejemplo una oferta), al ingresar te devuelve ahí.
  - Abajo hay links para ver las ofertas sin cuenta y para las empresas que entraron por acá.
  - El registro y la recuperación validan todo, pero todavía no crean cuentas ni mandan emails.
- **Qué falta:**
  - Reemplazar las rutas simuladas `/api/auth/…` por las reales, con su caso de uso y Supabase Auth.
  - La ruta que recibe el link del email.
  - En Supabase: activar la confirmación de email y poner 8 caracteres como mínimo.
- **Cómo completarlo:** el contrato (qué recibe y qué devuelve cada ruta) ya está fijado. Solo hay que implementarlo del lado del servidor. *Ref.: D-020.*

### P03 — Mi perfil
- **Qué hace:** datos personales, contacto y los oficios o rubros de la persona (RF1.2.1, RF1.2.2).
- **Estado:** bloqueada.
- **Qué falta decidir:**
  - Qué datos personales se piden: ¿DNI? ¿fecha de nacimiento? ¿barrio? Solo los necesarios, por la Ley 25.326.
  - Cuál es la lista de oficios y rubros, y quién la mantiene.
- **Cómo completarlo:** con esas dos respuestas, se arma igual que "Datos de la empresa": un formulario con validación, más un selector de varios oficios. *Ref.: Q-009, Q-006.*

### P04 — Mi CV
- **Dónde:** `/postulante/cv`.
- **Qué hace:**
  - Subir el CV en PDF. Se revisa en el momento que sea un PDF de verdad y que no pese más de 5 MB.
  - Ver cuál está cargado.
  - Reemplazarlo por uno nuevo.

  El postulante no puede abrirlo: solo lo ve la Oficina.
- **Estado:** lista, con datos simulados. El PDF se guarda en la memoria del servidor de desarrollo, y la Oficina lo puede abrir desde la oferta (P15).
- **Qué falta:**
  - Guardar el PDF en el almacenamiento privado de Supabase, en una carpeta por usuario.
  - Confirmar el tamaño máximo.
  - Decidir si el CV anterior se borra al reemplazarlo.
- **Cómo completarlo:** implementar el `/api/cv` real con la misma validación (`src/lib/validation/cv.ts`) y crear el bucket privado. *Ref.: D-026, DT-004, Q-005.*

### P07 — Mis postulaciones
- **Dónde:** `/postulante/postulaciones`.
- **Qué hace:** lista las ofertas a las que la persona se postuló, con la fecha. No muestra el estado (preseleccionado, derivado, etc.), porque eso es interno de la Oficina. La persona no puede retirar una postulación.
- **Estado:** lista, con datos simulados. Sin sesión, invita a ingresar.
- **Qué falta:** conectar con la base de datos real. *Ref.: D-023, D-024.*

---

## Empresa

### P08 — Ingresar, registrar la empresa y recuperar la contraseña
- **Dónde:** `/empresa/ingresar`, `/empresa/registrarse` y `/empresa/recuperar-contrasena`.
- **Estado:** lista, con datos simulados, igual que P02. Usuario de prueba: `empresa@ejemplo.com` con cualquier contraseña.
- **Qué falta:**
  - Lo mismo que en P02.
  - Decidir si una empresa recién registrada puede publicar enseguida o si la Oficina la tiene que validar antes. *Ref.: D-020, Q-014.*

### P09 — Inicio de la empresa
- **Dónde:** `/empresa`.
- **Qué hace:** resume la actividad de la empresa en el portal:
  - cuántas ofertas tiene en cada estado;
  - un acceso directo a publicar una oferta;
  - un aviso si faltan los datos de la empresa;
  - las tres últimas ofertas.

  Nunca muestra datos de postulantes: la Oficina es la intermediaria, y la pantalla lo explica.
- **Estado:** lista, con datos simulados.
- **Qué falta decidir:** qué indicadores exactos pide la Oficina. Hasta que se defina, se muestran las ofertas por estado. *Ref.: Q-012, DT-005.*

### P10 — Datos de la empresa
- **Dónde:** `/empresa/perfil`.
- **Qué hace:**
  - Cargar y editar razón social, CUIT, descripción (opcional) y la persona de contacto: nombre, teléfono y email (RF1.3.2).
  - El CUIT se revisa con su dígito verificador, así se detectan los errores de tipeo, y se guarda con guiones.
  - Al costado explica que esos datos los ve solo la Oficina.
- **Estado:** lista, con datos simulados.
- **Qué falta:** confirmar los campos cuando se modele la tabla de empresas. *Ref.: DT-005.*

### P11 — Publicar una oferta
- **Dónde:** `/empresa/ofertas/nueva`.
- **Qué hace:**
  - Un formulario con puesto, rubro, tareas, requisitos, lugar y horario, todos obligatorios, y cada error al lado de su campo. El rubro se elige con el selector propio del teléfono.
  - Al costado, tres consejos para escribir una buena oferta.
  - Al enviarla, la oferta queda "Pendiente" y la pantalla pasa a "Mis ofertas" con esa oferta abierta. No hay borradores (RF1.3.3).
- **Estado:** lista, con datos simulados.
- **Qué falta decidir:** los campos definitivos de una oferta y la lista de rubros (los mismos que en P05). *Ref.: DT-002, Q-006.*

### P12 — Mis ofertas
- **Dónde:** `/empresa/ofertas` (y `/empresa/ofertas?oferta=<id>`).
- **Qué hace:** lista y detalle en la misma página, como "Ofertas".
  - Cada oferta muestra su estado (Pendiente, Publicada, Rechazada o Cerrada) con palabra e ícono, y qué significa (RF1.3.4).
  - Si fue rechazada, muestra el motivo que escribió la Oficina (RF1.3.5).
  - En una publicada, "Pedir el cierre" pide confirmación antes de enviarse. La oferta sigue visible y queda marcada "Pediste el cierre" hasta que la Oficina la cierra (RF1.3.6).
- **Estado:** lista, con datos simulados. Los ejemplos incluyen una oferta de cada estado, para ver todos los casos. Cuando la Oficina publica una oferta, aparece en el catálogo; cuando la rechaza, la empresa ve el motivo acá.
- **Qué falta decidir:**
  - Si una oferta rechazada se puede corregir y reenviar.
  - Si un pedido de cierre se puede cancelar.

  Mientras tanto, no se ofrecen esas acciones. *Ref.: Q-002, Q-003.*

---

## Oficina de Empleo

### P13 — Ingresar
- **Dónde:** `/admin/ingresar`.
- **Estado:** lista, con datos simulados. Usuario de prueba: `oficina@ejemplo.com` con cualquier contraseña. Las cuentas las crea la Oficina: no hay registro ni recuperación de contraseña. *Ref.: D-020.*

### P14 — Panel
- **Dónde:** `/admin`.
- **Qué hace:** muestra lo que necesita atención con 4 números grandes. Cada número es un botón que lleva a resolverlo (RF1.5.1):
  - ofertas para revisar;
  - pedidos de cierre;
  - postulaciones sin revisar;
  - ofertas publicadas.

  Los que piden una acción se destacan en verde oscuro cuando hay alguno.
- **Estado:** lista, con datos simulados. Los indicadores son provisorios.
- **Qué falta decidir:** qué indicadores exactos quiere la Oficina y qué cuenta como "postulante activo". Cuando se decida, se cambian los números sin tocar el resto. *Ref.: D-030, DT-006, Q-012.*

### P15 — Gestión de ofertas
- **Dónde:** `/admin/ofertas`, con la pestaña en la dirección (`?estado=pending`, `published`, `rejected` o `closed`) y la oferta elegida (`&oferta=<id>`).
- **Qué hace:** lista y detalle en la misma página, como el catálogo.
  - Pestañas por estado con la cantidad de cada una (RF1.5.2). Las pendientes salen de la más vieja a la más nueva; en publicadas, primero las que pidieron el cierre.
  - En el detalle: el estado, la empresa con su teléfono y email (se llama o se escribe con un toque) y la oferta completa.
  - Pendiente: "Publicar" (con confirmación) o "Rechazar", que abre ahí mismo el campo del motivo, obligatorio (RF1.5.3).
  - Publicada con pedido de cierre: "Cerrar la oferta", con confirmación (RF1.5.4).
  - Publicada o cerrada: los postulantes, con su email, "Ver CV" (abre el PDF, RF1.5.5) y el estado para cambiar: Postulado, Pre-seleccionado, Derivado o No apto (RF1.5.6). Se guarda al elegirlo.
- **Estado:** lista, con datos simulados. El ciclo completo funciona: una oferta que publica la empresa aparece acá, al publicarla aparece en el catálogo, y las postulaciones llegan con su CV.
- **Qué falta:**
  - Conectar con la base real. El CV se tiene que abrir con un link firmado que vence enseguida, desde el almacenamiento privado.
  - Del postulante se ve solo el email, hasta que se decidan los datos del perfil. *Ref.: D-030, DT-006, Q-009.*

### P16 — Buscador de postulantes
- **Dónde:** `/admin/postulantes`.
- **Qué hace:** buscar en el padrón por oficios o rubros (RF1.5.7) y asociar a una persona con una oferta, como si se hubiera postulado (RF1.5.8).
- **Estado:** bloqueada.
- **Qué falta decidir:**
  - La lista de oficios.
  - Qué datos del perfil se ven.
  - Si la postulación guarda que la cargó la Oficina y si el postulante la ve en "Mis postulaciones".

  *Ref.: Q-006, Q-009, Q-007.*

---

## Todos los usuarios

### Menú según quién ingresó, con "Salir"
- **Qué hace:**
  - **En el celular**, el menú es una barra fija abajo, al alcance del pulgar, con ícono y palabra:
    - postulante: Ofertas, Postulaciones y Mi CV;
    - empresa: Inicio, Mis ofertas, **Publicar** (destacado) y Empresa;
    - Oficina: Panel y Ofertas;
    - sin cuenta: Ofertas, Ingresar y Crear cuenta.
  - **En la computadora**, las mismas opciones van arriba.
  - "Salir" siempre está a la vista arriba, como un botón con su palabra.
  - Si alguien entra a una pantalla privada sin haber ingresado, la pantalla le dice para qué es, le ofrece ingresar y después lo devuelve ahí.
- **Estado:** lista, con datos simulados (sesión de prueba).
- **Qué falta:** conectar las rutas de sesión (`/api/auth/sesion` y `/api/auth/salida`) a Supabase Auth. *Ref.: D-028, DT-003.*

### Accesos directos
Para dejarle las cosas a mano a cada persona:
- **Postulante:**
  - Ve "Te postulaste" en las ofertas donde ya se postuló, sin tener que abrirlas.
  - Si le falta el CV, un aviso arriba de las ofertas lo lleva a subirlo.
  - Si se postula sin CV, "Mi CV" le ofrece volver a esa misma oferta después de subirlo.
  - Si se postula sin haber ingresado, al ingresar vuelve a la oferta.
  - Cada postulación de "Mis postulaciones" abre su oferta.
- **Empresa:**
  - "Publicar" destacado en el menú del celular y "Publicar oferta" arriba de su lista.
  - Al enviar una oferta, la ve abierta en "Mis ofertas".
- **Oficina:**
  - Cada número del panel lleva directo a la lista que lo resuelve.
  - Teléfono y email de la empresa como links: se llama o se escribe con un toque.
  - El motivo del rechazo se escribe ahí mismo, sin abrir otra ventana.
- **Cualquiera:**
  - Buscador y rubros en el inicio, que abren el catálogo ya filtrado.
  - Links cruzados en los ingresos ("¿Sos una empresa? Ingresá acá", "Ver las ofertas sin ingresar").
  - "Saltar al contenido" para quien usa teclado.
- **Para evaluar más adelante (no se hicieron porque agregan funciones nuevas):**
  - "publicar de nuevo con cambios" una oferta rechazada, que depende de Q-002.

### Logo de la Municipalidad
- **Estado:** puesto en la marca de todas las pantallas: el logo en blanco, una línea y "Portal de Empleo", sin cuadraditos de colores. En color en el pie del inicio. Tiene tamaño fijo para que no se deforme.
- **Qué falta:** el archivo que hay (`docs/LOGOcolor.png`) mide 92 × 26 px y en los celulares se ve poco nítido. Conviene pedir a la Municipalidad el logo en SVG (o un PNG de al menos 600 px de ancho) y reemplazar `public/logo-municipalidad-funes.png`.

### Identidad visual
- **Estado:** lista. Todo el portal usa el "mosaico de oficios", los colores y las fuentes de la Municipalidad, con botones y campos de 44 px para usar con el dedo. Está explicado en `docs/DESIGN.md`.

### Mensajes de error
- **Estado:** provisorio. Hoy las pantallas muestran el mensaje que manda el servidor tal cual. El manejo definitivo de errores (por ejemplo, un mensaje claro cuando no hay conexión) queda para más adelante. *Ref.: D-013.*

---

## Fases

| Fase | Qué incluye | Estado |
|---|---|---|
| 1. Acceso | P02, P08 y P13 | Hecha (ingreso simulado) |
| 2. Postulante | P04, P05, P06 y P07 | Hecha (datos simulados) |
| 3. Empresa | P09, P10, P11 y P12 | Hecha (datos simulados) |
| 4. Menú con sesión | "Salir", el menú según el rol, la barra inferior en el celular y los accesos directos | Hecha (sesión simulada) |
| 5. Oficina de Empleo | P14 (con indicadores provisorios) y P15; además, el inicio (P01) y el catálogo con filtros | Hecha (datos simulados) |
| 6. Lo bloqueado | P03, P16 y los indicadores de P09 y P14 | Esperan decisiones |
| 7. Backend real | Reemplazar los datos simulados por la base de datos, pantalla por pantalla | Después de modelar la base |

## Cómo pasar una pantalla de "datos simulados" a "real"

1. Modelar la tabla que usa (por ejemplo, ofertas), con sus políticas de seguridad (RLS).
2. En su ruta de `src/app/api/…`, reemplazar lo simulado por la cadena real: validar lo que llega, obtener el usuario de la sesión, llamar al caso de uso y este al acceso a datos.
3. Respetar la misma forma de datos que ya usa la pantalla (`src/lib/validation/…`). Si cambia algún campo, ajustar el schema y los componentes que lo muestran.
4. Cuando no quede ninguna pantalla simulada, borrar `src/mocks/`.
5. Actualizar el estado en este documento.

## Cómo probar hoy

1. `npm run dev` y abrir `http://localhost:3000`.
2. Sin cuenta: `/` (inicio) y `/ofertas` (buscar, filtrar por rubro y ordenar).
3. Como postulante: `/ofertas`, `/postulante/cv` y `/postulante/postulaciones`.
4. Como empresa: `/empresa`, `/empresa/ofertas`, `/empresa/ofertas/nueva` y `/empresa/perfil`.
5. Como Oficina: `/admin` y `/admin/ofertas`.
6. Todo funciona con datos de ejemplo, compartidos entre los tres roles. Lo que cargues (CV, postulaciones, ofertas, decisiones de la Oficina) se guarda en la memoria del servidor y se borra al reiniciarlo.
7. Para ingresar, usá los usuarios de prueba con cualquier contraseña:
   - `postulante@ejemplo.com`;
   - `empresa@ejemplo.com`;
   - `oficina@ejemplo.com`.

   Cualquier otro email da "Email o contraseña incorrectos".
8. `npm run test:e2e` recorre:
   - el inicio: buscar y ver las ofertas recientes;
   - el catálogo: filtrar por rubro, buscar sin tildes y ordenar;
   - la Oficina: del panel a las pendientes, el motivo obligatorio al rechazar, los postulantes con su CV y el teléfono de la empresa;
   - el ingreso;
   - "subir CV → postularse → ver mis postulaciones";
   - "publicar una oferta → verla pendiente";
   - el motivo de una oferta rechazada;
   - el menú según quién ingresó y "Salir";
   - "postularse sin cuenta → ingresar → volver a la oferta".

## Pendiente de limpieza

- `src/app/playground/ofertas/page.tsx` es una vista previa vieja que ya no hace falta, porque las pantallas reales funcionan con datos simulados. Se borra cuando el equipo lo confirme.
