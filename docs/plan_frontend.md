# Plan del frontend

Estado de cada pantalla del portal, ordenado por **quién la usa**. Para cada una: qué hace, dónde está, qué está hecho, qué falta y cómo completarlo.

Última actualización: 2026-09-28.

## Cómo leer los estados

| Estado | Qué significa |
|---|---|
| **Lista** | La pantalla funciona completa. |
| **Lista, con la base real** | La pantalla está terminada y lee y guarda en la base de testing de Supabase. Cómo probarla: `docs/como_probar.md`. |
| **Lista, sin backend** | La pantalla está terminada, pero todavía no hay nada del otro lado: al enviar, muestra un error. |
| **En curso** | Se está haciendo ahora. |
| **Pendiente** | No empezó, pero no hay nada que la frene. |
| **Bloqueada** | No se puede hacer hasta que alguien decida algo (se indica qué). |

## Resumen

| Usuario | Pantalla | Dirección | Estado |
|---|---|---|---|
| Cualquier persona | P01 Inicio | `/` | Lista, con la base real |
| Cualquier persona | P05 y P06 Catálogo de ofertas | `/ofertas` | Lista, con la base real |
| Postulante | P02 Ingresar, registrarse y recuperar la contraseña | `/postulante/…` y `/nueva-contrasena` | Lista, con la base real |
| Postulante | P03 Mi perfil y CV | `/postulante/perfil` | En curso (se unificó con CV) |
| Postulante | P04 Mi CV | — | Integrada en P03 |
| Postulante | P07 Mis postulaciones | `/postulante/postulaciones` | Lista, con la base real |
| Empresa | P08 Ingresar, registrarse y recuperar la contraseña | `/empresa/…` | Lista, con la base real |
| Empresa | P09 Inicio de la empresa | `/empresa` | Lista, con la base real |
| Empresa | P10 Datos de la empresa | `/empresa/perfil` | Lista, con la base real |
| Empresa | P11 Publicar una oferta | `/empresa/ofertas/nueva` | Lista, con la base real |
| Empresa | P12 Mis ofertas | `/empresa/ofertas` | Lista, con la base real |
| Oficina de Empleo | P13 Ingresar | `/admin/ingresar` | Lista, con la base real |
| Oficina de Empleo | P14 Panel | `/admin` | Lista, con la base real (indicadores provisorios) |
| Oficina de Empleo | P15 Gestión de ofertas | `/admin/ofertas` | Lista, con la base real |
| Oficina de Empleo | P16 Buscador de postulantes | `/admin/postulantes` | Lista, con la base real |
| Todos | Menú según quién ingresó, con "Salir" | en todas | Lista, con la base real |

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
- **Estado:** lista, con la base real: muestra las 4 ofertas publicadas más recientes (con la base vacía, ninguna). `/inicio` también lleva acá.
- **Qué falta:**
  - Decidir qué pasa con la landing que estaba armando el equipo en `/landing` (hoy no está en el repositorio). Si una landing reemplaza a esta portada, conviene conservar el buscador y las ofertas recientes.
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
- **Estado:** lista, con la base real. Muestra el sueldo cuando la empresa lo cargó.
- **Qué pasa al tocar "Postularme":**
  - Si la persona no ingresó, se le ofrece ingresar o crear una cuenta; las dos la devuelven a la oferta.
  - Si no subió el CV, se le pide que lo suba, con un botón a "Mi CV" que después la trae de vuelta a la oferta.
  - Si todo está bien, se confirma la postulación. Nunca se muestra el estado interno.
- **Qué falta:**
  - Confirmar la lista de rubros.
  - Decidir si el postulante ve el nombre de la empresa (hoy no lo ve).
- **Cómo completarlo:** si algún día hay muchas ofertas, el filtro puede pasar al servidor con los mismos parámetros. *Ref.: D-024, D-025, D-029, D-035, DT-002, DT-009, Q-006.*

---

## Postulante

### P02 — Ingresar, crear cuenta y recuperar la contraseña
- **Dónde:** `/postulante/ingresar`, `/postulante/registrarse`, `/postulante/recuperar-contrasena` y `/nueva-contrasena` (a esta se llega desde el email).
- **Qué hace:**
  - Ingresar con email y contraseña.
  - Crear la cuenta con email y una contraseña de 8 caracteres o más, y después confirmar el email.
  - Pedir un link para cambiar la contraseña.
- **Estado:** lista, con Supabase Auth.
  - Si llegaste al ingreso o al registro desde otra pantalla (por ejemplo una oferta), te devuelve ahí.
  - Si la confirmación de email está apagada en Supabase, al registrarte entrás directo; si está prendida, te pide abrir el link del email, que pasa por `/acceso/confirmar`.
  - Abajo hay links para ver las ofertas sin cuenta y para las empresas que entraron por acá.
- **Qué falta:**
  - En Supabase: decidir la confirmación de email y el SMTP propio, y poner 8 caracteres como mínimo (`docs/como_probar.md`, 1.2).
  - Que el link del email funcione en otro dispositivo (DT-011).
- *Ref.: D-020, D-034.*

### P03 — Mi perfil
- **Qué hace:** datos personales, contacto, rubros de la persona (RF1.2.1, RF1.2.2) y gestión del Curriculum Vitae (P04 integrado).
- **Estado:** en curso. Se rediseñó la vista para mostrar campos obligatorios vacíos y se le integró la carga del CV debajo. Faltan definir algunos atributos finales.
- **Qué falta decidir:** la lista definitiva de rubros y quién la mantiene; mientras tanto se usa la provisoria.
- **Cómo completarlo:** se arma igual que "Datos de la empresa": un formulario con validación, más las casillas de rubros de P11 (sin tope). *Ref.: D-032, Q-006.*

### P04 — Mi CV (Integrada en P03)
- **Dónde:** `/postulante/perfil#cv` (antes en `/postulante/cv`).
- **Qué hace:**
  - Subir el CV en PDF. Se revisa en el momento que sea un PDF de verdad y que no pese más de 5 MB.
  - Ver cuál está cargado.
  - Reemplazarlo por uno nuevo.

  El postulante no puede abrirlo directamente para vista previa compleja, solo gestionar su reemplazo o descarga a través de un endpoint.
- **Estado:** lista e integrada a P03. El PDF se guarda en el almacenamiento privado de Supabase (bucket `cvs`, una carpeta por persona), y la Oficina lo abre con un link que vence en un minuto (P15).
- **Qué falta:**
  - Confirmar el tamaño máximo.
  - Decidir si el CV anterior se borra al reemplazarlo.
- *Ref.: D-026, DT-004, Q-005.*

### P07 — Mis postulaciones
- **Dónde:** `/postulante/postulaciones`.
- **Qué hace:** lista las ofertas a las que la persona se postuló, con la fecha. No muestra el estado (preseleccionado, derivado, etc.), porque eso es interno de la Oficina. La persona no puede retirar una postulación.
- **Estado:** lista, con la base real. Sin sesión, invita a ingresar. Sigue mostrando la oferta aunque la Oficina la cierre (necesita la migración `20260929130000`).
- *Ref.: D-023, D-024, D-035.*

---

## Empresa

### P08 — Ingresar, registrar la empresa y recuperar la contraseña
- **Dónde:** `/empresa/ingresar`, `/empresa/registrarse` y `/empresa/recuperar-contrasena`.
- **Estado:** lista, con Supabase Auth, igual que P02. Una cuenta de empresa creada desde el panel de Supabase necesita el SQL de `docs/como_probar.md` (1.3); registrada desde la web, ya nace como empresa.
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
- **Estado:** lista, con la base real.
- **Qué falta decidir:** qué indicadores exactos pide la Oficina. Hasta que se defina, se muestran las ofertas por estado. *Ref.: Q-012, DT-005.*

### P10 — Datos de la empresa
- **Dónde:** `/empresa/perfil`.
- **Qué hace:**
  - Cargar y editar razón social, CUIT, descripción (opcional) y la persona de contacto: nombre, teléfono y email (RF1.3.2).
  - El CUIT se revisa con su dígito verificador, así se detectan los errores de tipeo, y se guarda con guiones.
  - Al costado explica que esos datos los ve solo la Oficina.
- **Estado:** lista, con la base real (tabla `empresas`). Si el CUIT ya está en otra cuenta, avisa y deriva a la Oficina.
- *Ref.: D-027, D-032, DT-005.*

### P11 — Publicar una oferta
- **Dónde:** `/empresa/ofertas/nueva`.
- **Qué hace:**
  - Un formulario con puesto, rubros, tareas, requisitos, lugar y horario, todos obligatorios, y el sueldo opcional; cada error al lado de su campo. Los rubros son casillas con ícono: de 1 a 3, y al elegir 3 se deshabilitan las demás.
  - Al costado, tres consejos para escribir una buena oferta.
  - Al enviarla, la oferta queda "Pendiente" y la pantalla pasa a "Mis ofertas" con esa oferta abierta. No hay borradores (RF1.3.3).
- **Estado:** lista, con la base real: la oferta y sus rubros se guardan juntos (función `crear_oferta`).
- **Qué falta:** la lista definitiva de rubros. *Ref.: D-032, D-035, DT-002, DT-009, Q-006.*

### P12 — Mis ofertas
- **Dónde:** `/empresa/ofertas` (y `/empresa/ofertas?oferta=<id>`).
- **Qué hace:** lista y detalle en la misma página, como "Ofertas".
  - Cada oferta muestra su estado (Pendiente, Publicada, Rechazada o Cerrada) con palabra e ícono, y qué significa (RF1.3.4).
  - Si fue rechazada, muestra el motivo que escribió la Oficina (RF1.3.5).
  - En una publicada, "Pedir el cierre" pide confirmación antes de enviarse. La oferta sigue visible y queda marcada "Pediste el cierre" hasta que la Oficina la cierra (RF1.3.6).
- **Estado:** lista, con la base real. Cuando la Oficina publica una oferta, aparece en el catálogo; cuando la rechaza, la empresa ve el motivo acá.
- **Qué falta decidir:**
  - Si una oferta rechazada se puede corregir y reenviar.
  - Si un pedido de cierre se puede cancelar.

  Mientras tanto, no se ofrecen esas acciones. *Ref.: Q-002, Q-003.*

---

## Oficina de Empleo

### P13 — Ingresar
- **Dónde:** `/admin/ingresar`.
- **Estado:** lista, con Supabase Auth. Las cuentas se crean a mano en el panel de Supabase y se promueven con SQL (`docs/como_probar.md`, 1.3): no hay registro ni recuperación de contraseña. *Ref.: D-020, D-034.*

### P14 — Panel
- **Dónde:** `/admin`.
- **Qué hace:** muestra lo que necesita atención con 4 números grandes. Cada número es un botón que lleva a resolverlo (RF1.5.1):
  - ofertas para revisar;
  - pedidos de cierre;
  - postulaciones sin revisar;
  - ofertas publicadas.

  Los que piden una acción se destacan en verde oscuro cuando hay alguno.
- **Estado:** lista, con la base real. Los indicadores son provisorios.
- **Qué falta decidir:** qué indicadores exactos quiere la Oficina y qué cuenta como "postulante activo". Cuando se decida, se cambian los números sin tocar el resto. *Ref.: D-030, DT-006, Q-012.*

### P15 — Gestión de ofertas
- **Dónde:** `/admin/ofertas`, con la pestaña en la dirección (`?estado=pending`, `published`, `rejected` o `closed`) y la oferta elegida (`&oferta=<id>`).
- **Qué hace:** lista y detalle en la misma página, como el catálogo.
  - Pestañas por estado con la cantidad de cada una (RF1.5.2). Las pendientes salen de la más vieja a la más nueva; en publicadas, primero las que pidieron el cierre.
  - En el detalle: el estado, la empresa con su teléfono y email (se llama o se escribe con un toque) y la oferta completa.
  - Pendiente: "Publicar" (con confirmación) o "Rechazar", que abre ahí mismo el campo del motivo, obligatorio (RF1.5.3).
  - Publicada con pedido de cierre: "Cerrar la oferta", con confirmación (RF1.5.4).
  - Publicada o cerrada: los postulantes, con su email, "Ver CV" (abre el PDF, RF1.5.5) y el estado para cambiar: Postulado, Pre-seleccionado, Derivado o No apto (RF1.5.6). Se guarda al elegirlo.
- **Estado:** lista, con la base real. El ciclo completo funciona: una oferta que publica la empresa aparece acá, al publicarla aparece en el catálogo, y las postulaciones llegan con su CV, que se abre con un link firmado que vence en un minuto.
- **Qué falta:**
  - Del postulante se ve solo el email, hasta que se decidan los datos del perfil. *Ref.: D-030, DT-006, Q-009.*

### P16 — Buscador de postulantes
- **Dónde:** `/admin/postulantes`.
- **Qué hace:** buscar en el padrón por oficios o rubros (RF1.5.7) y asociar a una persona con una oferta, como si se hubiera postulado (RF1.5.8).
- **Estado:** lista, con la base real. El rediseño se completó para ofrecer una vista densa (tipo SaaS administrativo) en escritorio y tarjetas en celular.
- **Qué falta decidir:** la lista definitiva de rubros; mientras tanto se usa la provisoria. (También falta la funcionalidad "asociar a una persona con una oferta", que no formó parte del rediseño UI).

  *Ref.: D-032, Q-006.*

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
- **Estado:** lista, con Supabase Auth. *Ref.: D-028, D-034.*

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
| 1. Acceso | P02, P08 y P13 | Hecha |
| 2. Postulante | P04, P05, P06 y P07 | Hecha |
| 3. Empresa | P09, P10, P11 y P12 | Hecha |
| 4. Menú con sesión | "Salir", el menú según el rol, la barra inferior en el celular y los accesos directos | Hecha |
| 5. Oficina de Empleo | P14 (con indicadores provisorios) y P15; además, el inicio (P01) y el catálogo con filtros | Hecha |
| 6. Lo bloqueado | P03 y los indicadores de P09 y P14 | P16 ya está hecha. P03 se puede construir (D-032, con la lista provisoria de rubros); los indicadores esperan Q-012 |
| 7. Backend real | Reemplazar los datos simulados por la base de datos | Hecha (2026-09-29, D-035) |

## Backend real, por partes

La base está creada en el proyecto de desarrollo de Supabase (`docs/modelo_datos.md`, `docs/migraciones.md`). Las pantallas pasan a la base siguiendo la vida de una oferta: la empresa la crea, la Oficina la publica, el postulante se postula y la Oficina lo evalúa. Así cada parte deja datos reales para probar la siguiente.

| Parte | Pantallas | Qué se hace | Qué hacés vos en Supabase | Estado |
|---|---|---|---|---|
| 1. Preparar el código | P11 (rubros) y todas por dentro | Roles y estados en español, de 1 a 3 rubros por oferta (casillas en P11), la sesión lee `perfiles` | Aplicar las migraciones (hecho) y descargar los tipos | Hecha |
| 2. Acceso | P02, P08, P13 y nueva contraseña | Ingreso, registro, recuperar contraseña, sesión y salida con Supabase Auth; la ruta del link del email | Confirmación de email, contraseña mínima de 8, URLs permitidas, plantillas de email, SMTP propio y cuentas de prueba | Hecha (falta tu configuración) |
| 3. Empresa | P09, P10, P11 y P12 | Datos de la empresa, crear oferta (con sueldo opcional), mis ofertas y pedido de cierre | — | Hecha |
| 4. Oficina: ofertas | P14 y P15 | Panel, publicar, rechazar y cerrar | Promover la cuenta de la Oficina | Hecha |
| 5. Postulante | P01, P04, P05, P06 y P07 | Catálogo, CV en el almacenamiento privado, postularse y mis postulaciones | Aplicar la migración `20260929130000` | Hecha |
| 6. Oficina: postulantes | P15 | Postulantes de cada oferta, cambio de estado y CV con link firmado | — | Hecha |
| 7. Sacar lo simulado | Todas | Borrar `src/mocks/` y el playground, pasar los e2e a Supabase, cerrar DT-003 | Cargar las variables `E2E_*` | Hecha |

Se hizo todo junto, sin la etapa intermedia de convivencia que estaba prevista: no queda ninguna ruta simulada.

## Cómo probar hoy

Todo está en **`docs/como_probar.md`**:
- qué configurar una sola vez en Supabase (migración, acceso, cuentas de prueba);
- cómo recorrer las dos ramas, empresa y postulante, desde la portada;
- qué hacer si algo no anda.

`npm run test:e2e` corre contra la base de testing y recorre:
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

- Nada pendiente: `src/mocks/` y el playground se borraron el 2026-09-29 (DT-003).
