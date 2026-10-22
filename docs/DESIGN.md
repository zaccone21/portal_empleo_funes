# Diseño — valores predeterminados

Guía visual y de interacción del Portal de Empleo. Es la referencia para cualquier pantalla nueva: si algo no está acá, se decide y se agrega. Las decisiones que la originan son D-019 (paleta y tipografía), D-020 (acceso), D-021 (tamaños táctiles y cómo se arma una pantalla), D-022 (dirección visual), D-025 (lista con detalle), D-028 (navegación), D-029 (inicio y catálogo) y D-030 (Oficina de Empleo).

**Cada decisión de diseño se registra acá**: la regla en su sección y una línea con fecha en el §11, "Registro de decisiones de diseño", incluso cuando se vuelve atrás.

Público: personas con poca práctica digital, en celulares de gama baja y muchas veces al sol (RNF3). Todo lo que sigue sale de ahí: botones grandes, texto grande, contraste alto, una acción principal por pantalla y flujos de un solo sentido.

**Simple de usar no significa pelado.** El portal tiene una identidad visual propia y marcada (D-022). Una pantalla sin carácter, que parezca una plantilla, no está terminada.

---

## 0. Dirección visual: "Mosaico de oficios" (D-022)

La idea: **un mural de azulejos con los oficios de la ciudad** (albañilería, jardinería, cocina, electricidad, transporte, costura…), en los verdes de la Municipalidad y con un único acento amarillo "sol". Conecta con el corazón del portal, que es que cada persona encuentre trabajo de lo suyo (las etiquetas de oficios de RF1.2.2).

- **El mosaico es el elemento memorable** y aparece en los fondos verdes: el marco de acceso, los encabezados de sección y el bloque "¿Tenés una empresa…?" del inicio. Todo lo que está alrededor es sobrio: fondos blancos, tipografía clara, sin decoración extra. Si un fondo ya tiene mosaico, no se le suma otro adorno.
- **En el celular, el mosaico nunca va detrás de un texto.** En los encabezados de sección y en el bloque de empresas se oculta por debajo de `sm` (640 px), porque ahí queda detrás del título y le quita legibilidad. En el acceso aparece como franja propia, arriba del panel.
- **Forma firma, la "hoja":** dos esquinas redondeadas en diagonal (arriba a la izquierda y abajo a la derecha) y dos casi rectas, **siempre discreta**. La usan algunos azulejos, el panel blanco del acceso y las tarjetas. Clases:
  - Paneles grandes: `rounded-tl-[1.75rem] rounded-br-[1.75rem] rounded-tr-lg rounded-bl-lg`.
  - Tarjetas: `rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md`.
  - Íconos en azulejo: `rounded-tl-xl rounded-br-xl rounded-tr-sm rounded-bl-sm`.
- **Colores del mosaico que se alternan entre filas:** los azulejos van en colores llenos (verde municipal, verde monte, brote, menta y un sol cada 13). La secuencia de 13 tonos no coincide con la cantidad de columnas, así que cada fila empieza en otro punto y los colores cambian de lugar de una fila a la otra: se lee como un mural variado, no como franjas. Los azulejos "monte" son casi del color del fondo y dejan respiros entre los de color.
- **Tono adulto e institucional:** es atrevida pero no infantil. Los azulejos son cuadrados (uno de cada tres con forma "hoja"); no hay círculos ni arcos. Los títulos van en Sora semibold, no bold. La navegación marca la página actual con un subrayado, no con píldoras de color.
- **Superficies:** verde monte (`bg-brand-deep`) para los fondos de marca, con texto blanco. Blanco (`bg-background`) para el contenido que se lee o se completa.
- **Lema grande:** en los fondos verdes va una frase corta en Sora 700, grande y apretada (`tracking-[-0.03em]`, `leading-[1.05]`). Es un `<p>`; el `h1` de la página sigue siendo el título de la pantalla.
- **Movimiento:** un único momento al cargar, en el que los azulejos aparecen escalonados y el panel sube. Siempre con `motion-safe:`, para respetar "reducir movimiento". No hay animaciones de hover en cada tarjeta ni entradas por sección. Única excepción: los contadores de "El portal en números" del inicio, que suben una vez al aparecer y con "reducir movimiento" muestran el número final (D-059).
- **Qué evitar:** degradados de relleno, etiquetas en mayúsculas sobre los títulos, resaltar una palabra del título con otro color, tarjetas idénticas con la misma sombra gris, y "→" al final de los botones.

Componentes: `MosaicoOficios` y `MarcaPortal` (`src/components/marca/`), y `MarcoAcceso` y `PanelAcceso` (`src/components/auth/`).

---

## 1. Color

Los colores salen del sitio de la Municipalidad de Funes. Viven como tokens en `src/app/globals.css` (`:root`). **Los componentes usan siempre el token** (`bg-primary`, `text-muted-foreground`), nunca el hex.

| Token | Valor | Uso | Contraste |
|---|---|---|---|
| `primary` | `#074a1f` (verde municipal) | Botón principal, links, foco, barra superior | 10,5:1 sobre blanco |
| `primary-foreground` | `#ffffff` | Texto sobre verde | 10,5:1 |
| `foreground` | `#262b35` (gris oscuro municipal) | Texto normal | 14:1 |
| `muted-foreground` | `#636a75` | Texto secundario (descripciones, ayudas) | 5,4:1 sobre blanco; 4,95:1 sobre `muted` |
| `input` | `#868d98` (gris medio municipal) | Borde de campos | 3,4:1 (alcanza para componentes, no para texto) |
| `border` | `#e2e4e8` | Divisores y bordes decorativos | — |
| `secondary` / `accent` | `#e6efe9` (tinte verde) | Hover, fondos suaves, botón secundario | — |
| `secondary-foreground` / `accent-foreground` | `#074a1f` | Texto sobre el tinte | 8,9:1 |
| `muted` | `#f3f4f6` | Fondo de página en las pantallas de acceso | — |
| `background` / `card` / `popover` | `#ffffff` | Fondo de tarjetas, modales y menús | — |
| `destructive` | rojo de shadcn (sin cambio) | Errores y acciones destructivas | — |
| `brand-deep` | `#04311a` (verde monte) | Fondos de marca (acceso, encabezados de sección); solo texto blanco encima | 14:1 con blanco |
| `brand-leaf` | `#3c8c4f` (verde brote) | Azulejos del mosaico | Decorativo |
| `brand-mint` | `#cfe6d3` (menta) | Azulejos, íconos sobre verde, detalles de la marca | Decorativo |
| `brand-sun` | `#f2c230` (sol) | Único acento: algunos azulejos y la marca. **Nunca en texto** | Decorativo |
| `chart-1…5` | grises de shadcn (sin cambio) | Sin uso: el panel de la Oficina (P14) muestra números sin gráficos mientras no se definan sus indicadores (Q-012) | — |

Reglas:
- **El gris medio `#868d98` nunca va en texto**: con 3,4:1 no llega al 4,5:1 de WCAG AA. Para texto secundario está `muted-foreground`.
- El verde se reserva para lo accionable y la identidad (barra superior). No se usa como fondo de bloques grandes de texto.
- Sin modo oscuro (fuera del alcance). El bloque `.dark` de `globals.css` queda como lo generó shadcn y no se usa.

## 2. Tipografía

| Rol | Familia | Cómo se aplica |
|---|---|---|
| Texto | **Be Vietnam Pro** (400, 500, 600, 700) | `font-sans`, por defecto en `<html>` |
| Títulos | **Sora** | `font-heading`: automático en `h1`, `h2`, `h3` y en los títulos de card, dialog, sheet, alert-dialog y empty |

Se cargan con `next/font/google` en `src/app/layout.tsx` (variables `--font-be-vietnam` y `--font-sora`). Be Vietnam Pro no es variable: si hace falta otro peso, hay que agregarlo en la lista `weight`.

Tamaños:
- Texto de lectura, labels, inputs y botones: **16 px (`text-base`) como mínimo**. En iOS, un input de menos de 16 px hace zoom al enfocarlo.
- `h1` de pantalla: `text-2xl font-semibold`. Hay **un solo `h1` por página**.
- `text-sm` solo para información de apoyo que no hace falta para completar la tarea.

## 3. Tamaños y espaciado

- **Targets táctiles de 44 × 44 px como mínimo.** Los primitivos ya lo cumplen:
  - `Button`: `default` 44 px (`h-11`), `lg` 48 px (`h-12`), `icon` 44 px, `icon-lg` 48 px.
  - `Input`: 44 px (`h-11`), texto de 16 px.
  - Los tamaños `xs`, `sm`, `icon-xs` e `icon-sm` de `Button` son para vistas densas de escritorio (tablas de admin). **No se usan en pantallas mobile.**
- Un link de texto que sea un target (por ejemplo "Olvidé mi contraseña") usa `buttonVariants({ variant: "link" })`, así mide 44 px de alto.
- Radio de borde: el de shadcn (`--radius: 0.625rem`).
- Separación entre campos de un formulario: `gap-5`. Entre bloques del formulario (campos, error, botón): `gap-6`.

## 4. Layout

- **Mobile-first.** Se diseña para 390 px y después se amplía.
- Margen lateral de 16 px (`px-4`) y nunca scroll horizontal.
- Pantallas de formulario (acceso, perfil): una columna centrada de `max-w-sm`.
- Una **acción principal por pantalla** (botón `default`, ancho completo en mobile). Las secundarias van abajo, como links.
- Pantallas de acceso (`MarcoAcceso` + `PanelAcceso`):
  - Mobile: lema arriba, franja de mosaico y el panel blanco con el formulario, que tiene que quedar visible sin scroll.
  - Desktop: lema a la izquierda sobre verde liso y el panel a la derecha, flotando sobre el mosaico.
- La marca (`MarcaPortal`) es el logo de la Municipalidad en blanco, una línea vertical fina y "Portal de Empleo", en una sola fila. No lleva cuadraditos de colores: compiten con el logo.

## 4 bis. Navegación y celular (D-028)

- **En el celular, el contenido empieza en la mitad de arriba de la pantalla.** El encabezado de cada sección es bajo (título de 28 px, sin mosaico) y no hay menú arriba.
- **El menú del celular es una barra fija abajo** (`BarraInferior`): de 3 a 4 opciones, cada una con **ícono y palabra** (nunca un ícono solo) y 68 px de alto, al alcance del pulgar.
  - La opción actual va resaltada.
  - La acción principal del rol va pintada en verde (el "Publicar" de la empresa).
  - Sin sesión: "Ofertas", "Ingresar" y "Crear cuenta".
- **Lo que se fija abajo** (por ejemplo "Postularme") se apoya sobre esa barra usando `--alto-barra-inferior`. Lo definen los layouts de cada área y vale 0 desde `lg`.
- **Arriba**, en todas las pantallas internas: la marca (logo de la Municipalidad en blanco + "Portal de Empleo") y la cuenta, alineadas con el contenido (`max-w-6xl`).
  - En desktop, el menú completo del rol va también arriba, con subrayado menta en la página actual, y la acción principal ("Publicar") como botón menta. La barra queda fija arriba desde `lg` (D-056).
  - **"Salir" es un botón visible con ícono y palabra**, no un menú escondido, también en el celular. Desde `xl`, a su izquierda, quién ingresó: inicial en un azulejo menta, rol y email.
  - Sin sesión, a la derecha: "Ingresar" (vuelve a la pantalla) y "Crear cuenta" o "Registrar mi empresa" en menta.
  - "Ayuda" (P20) está en el menú del postulante, de la empresa y de quien no ingresó; nunca en el de la Oficina.
- **Llevar a la persona de vuelta a donde estaba.** Si una pantalla pide ingresar, el link lleva `?volver=` con esa pantalla. Si falta el CV para postularse, "Mi CV" ofrece "Volver a la oferta".
- **Mostrar el estado que la persona iría a buscar:** "Te postulaste" en la oferta, "Subí tu CV" arriba de las ofertas.
- **Links cruzados** para quien entró por la puerta equivocada ("¿Sos una empresa? Ingresá acá").
- **Pantalla privada sin sesión o con otro rol:** `PedirIngreso` ("Ingresá…" con los botones), nunca un error.
- **Logo de la Municipalidad:** `LogoMunicipalidad`, en blanco (`variante="claro"`) sobre verde y en color sobre blanco (pie del inicio). Se muestra a su tamaño real, con ancho y alto fijos (92 × 26 px) y sin encogerse (`shrink-0`): si el contenedor lo estira o lo aprieta, se deforma. El archivo es chico; hace falta un SVG para verlo nítido en celulares.

## 4 ter. Reglas por pantalla

### Inicio (P01, D-029)

La portada sirve para **empezar a buscar trabajo sin leer nada más**. Orden, de arriba hacia abajo:
1. **Portada verde**: el título "Tu próximo trabajo está en Funes.", una bajada corta y el buscador "¿Qué trabajo buscás?". Buscar lleva al catálogo con la búsqueda hecha (`/ofertas?q=…`). Es un formulario común (GET): funciona aunque falle el JavaScript.
2. **Rubros como atajos**: los 7 rubros con más trabajos del día a día, como chips con ícono. Cada uno abre el catálogo filtrado (`/ofertas?rubro=…`). En el celular es una fila que se desliza de costado, para no empujar el contenido hacia abajo.
3. **El portal en números** (D-059): tarjeta blanca con cuatro totales reales, cada uno con su ícono en azulejo menta y un número grande en Sora que sube de 0 al aparecer. Sin datos, no aparece.
4. **Ofertas recientes**: las 8 ofertas publicadas más nuevas en un **carrusel** (deslizar, con botones de 44 px anterior/siguiente que se apagan en cada punta; en el celular asoma la tarjeta siguiente), con "Ver todas las ofertas". Se eligieron las recientes y no las "más relevantes" porque la relevancia necesita un criterio que no está definido.
5. **Buscá por rubro**: los 11 rubros en tarjetas-link con su cantidad de ofertas; los que tienen ofertas llevan el ícono en verde lleno, los demás en menta.
6. **Un servicio de la Municipalidad de Funes** (solo sin sesión): tarjeta blanca con el logo en color y cuatro garantías con ícono.
7. **Cómo postularte**: 3 pasos numerados (es una secuencia real: cuenta, CV, postulación) y "Crear mi cuenta".
8. **Para empresas**: bloque verde con mosaico (solo desde `sm`) y dos botones: "Registrar mi empresa" y "Ya tengo cuenta".
9. **Pie**: logo en color, "Ayuda y preguntas frecuentes" y el ingreso de la Oficina de Empleo, discreto, porque lo usan pocas personas.

### Ayuda (P20, D-057)

- Arriba, dos tarjetas "hoja" que son links: "Busco trabajo" y "Tengo una empresa" (`?para=empresa`). La elegida va con fondo menta claro, borde verde y su ícono en verde lleno.
- Debajo, en dos columnas desde `lg`: la **guía paso a paso** (pasos numerados con ícono en azulejo verde, unidos por una línea fina, y al final de cada paso un link a su pantalla) y las **preguntas frecuentes** en un `Accordion` dentro de una tarjeta blanca, con texto de 16 px.
- Al final, un bloque menta "¿Te quedó alguna duda?" que manda a la Oficina en persona.

### Catálogo de ofertas (P05 y P06, D-029)

- **Todo el filtro vive en la URL** (`q`, `rubro`, `orden` y `oferta`). Así funcionan el "atrás" del celular, recargar y compartir el link, y el inicio puede llevar a un catálogo ya filtrado.
- **Buscador** con label visible ("Buscá por puesto, tarea o barrio") y botón "Buscar". Busca en título, descripción, requisitos, lugar, horario y rubro, **sin importar tildes ni mayúsculas** ("jardineria" encuentra "Jardinería").
- **Rubros**: chips con ícono, con "Todos" primero. El elegido se pinta de verde y se anuncia con `aria-current`. En el celular, la fila se desliza de costado.
- **Ordenar**: "Más recientes" (por defecto) o "Más antiguas", con el selector nativo del teléfono (`SelectorNativo`).
- **"Limpiar filtros"** aparece solo cuando hay algún filtro.
- **Una frase dice qué se está viendo**: "Hay 2 ofertas de Gastronomía para “cocina”." También nombra la lista para los lectores de pantalla.
- **Sin resultados**: "No encontramos ofertas con esa búsqueda" y un botón "Ver todas las ofertas". Nunca una lista vacía sin salida.
- Al abrir una oferta, el filtro se conserva (`/ofertas?rubro=jardineria&oferta=…`). El "Volver" del celular vuelve a la lista filtrada.
- Cada tarjeta muestra el rubro con su ícono (`IconoRubro`), para reconocerlo de un vistazo.

### Oficina de Empleo: "Mesa de trabajo" (P13 a P16, D-042, D-049)

*Reescrita el 2026-10-18; reemplaza la versión de D-030 (panel de 4 números y pestañas por estado). La referencia visual son los mocks de `docs/admin-view-mocks/`.*

La Oficina trabaja como en una **mesa de trabajo de escritorio**: colas de tareas pendientes y registros para consultar. Está pensada para la computadora de la Oficina; en el celular se puede usar, pero no es su caso principal.
- **Menú lateral** (232 px, se pliega a 56 px de íconos): "Resumen" (Dashboard), "Tareas pendientes" (Ofertas por revisar, Postulaciones nuevas, Cierres solicitados, Por comunicar / derivar, Empresas nuevas) y "Gestión" (Ofertas, Postulaciones, Postulantes, Empresas). Las tareas muestran su cantidad en una pastilla de atención **solo si hay alguna**. Arriba, el logo en verde (32 px de alto) y, debajo de una línea, "Oficina de Empleo".
- **Dashboard (P14):** una tarjeta por cola, que lleva a resolverla; "Para resolver hoy" con las tareas más viejas primero; accesos a los registros. Los indicadores con datos reales se suman según D-051.
- **Colas** (ofertas por revisar, postulaciones nuevas, cierres, por comunicar): la más vieja primero (se atiende por orden de llegada), sin tira de estados, con la pista de teclado abajo.
- **Registros** (ofertas, postulaciones, postulantes, empresas): tira de estados con la cantidad de cada uno (filtra por la URL), búsqueda (`/` la enfoca) y filtros. Todo el estado de la pantalla va en la URL, así funcionan el "atrás" y compartir el link.
- **Tabla:** filas de 56 px y texto de 14 px (D-063), para que tocar la fila no sea un tiro al blanco. **Tocar la fila (o "Ver") abre la página completa del registro** (D-062); no hay panel lateral. Teclado: Tab para moverse, Enter abre, `/` busca.
- **Ordenar (D-063):** cada columna con dato se ordena tocando su encabezado (otro toque invierte); la columna activa va en negrita con una flecha ↑/↓ y las demás con ↕ tenue. El orden va en la URL. Sin elegir, la columna del orden de la pantalla ya aparece marcada (colas: la más vieja primero).
- **Empresas nuevas (D-064):** vista "Nuevas (7 días)" en Empresas y columna "Registrada" con la etiqueta "Nueva" (tono atención).
- **Página completa de un registro (D-062, `FichaAdmin`):** arriba, la flecha "Volver a …" (44 px) que lleva a la lista de origen con sus filtros (`?desde=`); el título en Sora 26 px con su estado y, al lado, las acciones (contacto de un toque, Ver CV, Aprobar/Rechazar). Debajo, dos columnas desde `lg`: lo principal a la izquierda y, en una columna de 300 a 380 px, la empresa, los datos de contacto y las herramientas (asociar a una oferta, cursos). Cada bloque es una tarjeta blanca con su título (`FichaSeccion`); texto de 14 px. Sin pestañas. Desde una cola, la decisión pasa a la oferta siguiente.
- **Decisiones sobre una oferta:** "Aprobar" es un clic y un toast lo confirma; "Rechazar" abre una confirmación con el motivo obligatorio, porque la empresa lo lee (RF1.3.5); "Cerrar oferta" pide confirmación. En la cola de revisión se pueden aprobar varias juntas. Si otra operadora decidió primero, el toast lo dice.
- **Evaluación de una postulación (P15):** dos columnas: la oferta a la izquierda; a la derecha, la persona (datos, contacto de un toque, rubros) y su CV en un visor. Abajo, "Preseleccionar" o "Marcar no apto", y anterior/siguiente para recorrer la cola (J/K).
- **Por comunicar / derivar:** cada fila trae el contacto de la empresa (WhatsApp, teléfono, email) y "Marcar como derivado" una vez que se habló con ella.
- **Contacto de un toque:** teléfono (`tel:`), WhatsApp y email (`mailto:`) son botones, nunca texto suelto.
- **Celular:** las tablas se desplazan de costado dentro de su caja, con la primera columna fija; la página no se desborda.
- **Evaluación (P15), además:** el contacto de la empresa junto a la oferta; la preentrevista opcional (fecha y hora en hora argentina, y notas) en la columna de la persona; una vez derivada, "Resultado con la empresa" (Contratado, No contratado con su motivo, o Sin respuesta y hace cuánto). Con la postulación preseleccionada, "Marcar como derivado" está en la misma pantalla; si la empresa no respondió por otras personas de esa oferta, un aviso lo dice, sin bloquear (D-054).
- **Evaluación (P15), herramientas (2026-10-20):** arriba de la oferta, cómo viene (postulaciones, derivadas y contratadas) y "Ver oferta"; la tarjeta de la empresa (la misma del panel de ofertas) con su descripción, el contacto de un toque y "Ver ficha"; los requisitos debajo de la descripción. Del lado de la persona: "Ver ficha", cuántas postulaciones más tiene y "Copiar datos para la empresa" (nombre, teléfono, email, oficios y la oferta, para pegar en el mensaje). El registro de postulaciones suma la columna "Resultado con la empresa".
- **Equipo (P21, D-058):** grupo "Oficina" del menú lateral. A la izquierda, la lista de cuentas (inicial en un azulejo menta, email, "Vos" en la propia y desde cuándo existe) y una línea que dice que no se borran; a la derecha, el formulario con solo el email. La contraseña temporal aparece una vez en un recuadro de atención, en monoespaciada, con "Copiar" y la indicación de entregarla en persona. Abajo del menú lateral, "Cambiar mi contraseña".
- **Panel (P14), además:** una quinta tarjeta "Sin respuesta de la empresa", esas derivaciones también en "Para resolver hoy" (por fecha de derivación), y una fila de indicadores reales en números, sin gráficos (D-051).
- **Ficha del postulante (P18, P19):** en la página completa, "Seguimiento" con los conteos (los rechazos son solo los "No contrata" de las empresas; el "No apto" va aparte) y, con 3 rechazos o más, un aviso que lleva a la pestaña "Cursos". "Cursos" tiene el formulario (curso, fecha, notas) y el historial. Cada postulación muestra su preentrevista y el resultado con la empresa.
- **Padrón (P16):** el filtro de rubros es múltiple (alcanza con uno). En el panel y en la ficha, "Asociar a una oferta" con el selector nativo y solo las ofertas publicadas a las que la persona no se postuló.

### Empresa: candidatos derivados (P17, D-044)

- Van **dentro del detalle de cada oferta** publicada o cerrada, en "Candidatos que te propuso la Oficina". No hay pantalla aparte.
- Una tarjeta "hoja" por persona: nombre, rubros, cuándo la propuso la Oficina, contacto de un toque (llamar, WhatsApp, email) y "Ver CV".
- La respuesta se da una sola vez: "Sí, la contraté" o "No la contraté". Para "No", el motivo se escribe ahí mismo, en la tarjeta (§5). Las dos se confirman con un `AlertDialog` que dice que no se puede cambiar después.
- Arriba de la lista, una frase dice a cuántas personas les falta respuesta. En el inicio (P09), un aviso "N personas esperan tu respuesta" lleva a la oferta de la más antigua. No hay topes: se pide el feedback (D-054).

## 5. Componentes: cuándo usar cada uno

| Necesidad | Usar | Notas |
|---|---|---|
| Acción principal | `Button` (variante `default`, `size="lg"` en formularios) | Una por pantalla |
| Acción secundaria | `Button variant="outline"` o link | |
| Botón de ícono (mostrar contraseña, cerrar) | `Button variant="ghost" size="icon"` | Siempre con `aria-label` en español |
| Navegar a otra pantalla | `<Link>` de `next/link` | Nunca `<a href>` para rutas internas |
| Link con forma de botón (Duplicar, Llamar, Ver CV) | `<Link>` o `<a>` con `className={buttonVariants(...)}` | No `Button render={<Link />}`: Base UI le pone `role="button"` y el lector de pantalla no lo anuncia como link |
| Lista con detalle (catálogo de ofertas, ofertas de la empresa, gestión de la Oficina) | Lista + panel de detalle en la misma página, con la selección en la URL (`?oferta=<id>`) | **No usar `Dialog` para contenido largo ni formularios**: en celulares de gama baja un modal es frágil (D-025). En desktop van lado a lado; en mobile el detalle reemplaza a la lista y tiene "Volver" |
| Confirmar una acción que no se deshace | `AlertDialog` | Por ejemplo, solicitar el cierre de una oferta. Texto corto y dos botones |
| Pedir un texto antes de una decisión (motivo del rechazo) | El campo aparece ahí mismo, en la barra de acciones | No es un modal: el teclado del celular y el modal se llevan mal (D-025) |
| Elegir de una lista corta (ordenar, estado de una postulación) | `SelectorNativo` (el `<select>` del navegador con el estilo del portal) | Abre el selector propio del teléfono, que la gente ya conoce y siempre entra en la pantalla. El `Select` de shadcn queda para listas que necesiten buscar o mostrar íconos |
| Filtrar por una categoría (rubros) | Chips que son links (`?rubro=`) | El elegido en verde y con `aria-current`; en el celular, fila que se desliza de costado |
| Elegir varios de una lista corta con tope (rubros de una oferta) | Casillas en tarjeta: `Checkbox` dentro de `FieldLabel` + `Field` horizontal, con el ícono del rubro, en una grilla de 2 columnas desde `sm` | Toda la tarjeta se toca (44 px o más). Al llegar al tope, las demás se apagan y se deshabilitan, y una línea arriba de las casillas (donde la persona está mirando) dice cómo cambiar una. Así el límite nunca aparece como error después de enviar |
| Separar una lista en estados (Oficina) | Pestañas que son links (`?estado=`), con la cantidad | No `Tabs` de shadcn: el estado va en la URL |
| Error del servidor en un formulario | `Alert variant="destructive"` arriba del botón | Componente `ErrorDelServidor` |
| Error de un campo | `FieldError` debajo del campo | Nunca solo en color |
| Confirmación breve después de navegar | Toast (`toast.success` de `sonner`) | El `Toaster` está montado en el layout raíz, arriba al centro, siempre en modo claro |
| Instrucción que el usuario tiene que seguir | Mensaje **fijo** en la página | Nunca un toast: desaparece y se pierde (por ejemplo, "Revisá tu correo") |
| Cargando | `Spinner` + texto ("Ingresando…") y botón deshabilitado | El spinner es decorativo (`aria-hidden`) |
| Lista vacía | `Empty` | Con una frase que diga qué hacer |

## 6. Formularios

- Cada campo tiene un **label visible** (`FieldLabel` con `text-base`). El placeholder no reemplaza al label.
- Los errores van **debajo de su campo**, en español simple, conectados con `aria-describedby` y con `aria-invalid` en el input.
- Se valida con **Zod** al enviar (los schemas de `src/lib/validation/`, los mismos que usa el servidor). El `<form>` lleva `noValidate` para que no aparezcan los globos del navegador.
- Inputs no controlados, que se leen con `FormData`. Solo se guarda en estado lo que cambia la pantalla (errores, mostrar u ocultar la contraseña).
- Atributos que ayudan en el celular: `type="email"` e `inputMode="email"` en el email; `autoComplete` correcto (`email`, `current-password`, `new-password`).
- El botón de enviar se deshabilita mientras la petición está en curso, para evitar envíos dobles con conexión lenta.

## 7. Textos

- Español rioplatense con voseo: "Ingresá", "Subí tu CV", "Revisá tu correo".
- Frases cortas y palabras comunes, sin jerga técnica ("enlace" o "email", no "token" ni "sesión").
- Los botones dicen lo que hacen: "Crear cuenta", "Enviar enlace", "Guardar contraseña". Mientras cargan, lo mismo en gerundio: "Creando cuenta…".
- Los errores dicen qué hacer: "Ingresá tu email", "La contraseña tiene que tener al menos 8 caracteres".
- **Los errores de acceso nunca revelan si una cuenta existe**: "Email o contraseña incorrectos" y "Si hay una cuenta con ese email, te va a llegar un enlace…".
- Fechas en es-AR: `Intl.DateTimeFormat("es-AR")` y el locale `es` de `date-fns` en el calendario.

## 8. Íconos

- `lucide-react`. Tamaño por defecto dentro de un botón: el del primitivo (`size-4`).
- Si el ícono acompaña a un texto, es decorativo: `aria-hidden="true"`.
- Un botón que tiene solo un ícono lleva `aria-label` en español.

## 9. Accesibilidad (WCAG 2.2 AA): checklist por pantalla

- [ ] Un `h1` y un `metadata.title` propios de la página (el layout raíz agrega " — Portal de Empleo Funes").
- [ ] Todo se puede usar con teclado y el foco es visible (el anillo verde de `ring`).
- [ ] Contraste de 4,5:1 en texto y 3:1 en bordes de componentes.
- [ ] Targets de 44 px.
- [ ] Labels visibles y errores junto al campo.
- [ ] Estados de carga, vacío y error en toda la UI asíncrona.
- [ ] Revisado a 390 px, sin scroll horizontal y sin errores en la consola.

## 10. Catálogo actual

### Acceso (P02, P08, P13)

| Componente | Archivo | Qué es |
|---|---|---|
| `MarcoAcceso` | `src/components/auth/MarcoAcceso.tsx` | Fondo verde con mosaico y marca; está en `(acceso)/layout.tsx` |
| `PanelAcceso` | `src/components/auth/PanelAcceso.tsx` | Lema del portal + panel blanco "hoja"; está en el layout de cada portal |
| `TarjetaAcceso` | `src/components/auth/TarjetaAcceso.tsx` | Contenido del panel: `h1`, descripción, formulario y pie de links |
| `EnlacesAcceso` | `src/components/auth/EnlacesAcceso.tsx` | Links secundarios de 44 px |
| `CampoEmail` | `src/components/auth/CampoEmail.tsx` | Campo de email con su error |
| `CampoContrasena` | `src/components/auth/CampoContrasena.tsx` | Campo de contraseña con botón "Mostrar contraseña" |
| `BotonEnviar` | `src/components/auth/BotonEnviar.tsx` | Botón principal con estado de carga |
| `ErrorDelServidor` | `src/components/auth/ErrorDelServidor.tsx` | Alerta con el mensaje del servidor |
| `AvisoRevisaTuCorreo` | `src/components/auth/AvisoRevisaTuCorreo.tsx` | Mensaje fijo que reemplaza al formulario después de mandar un email |
| `FormularioIngreso` / `FormularioRegistro` / `FormularioRecuperarContrasena` / `FormularioNuevaContrasena` | `src/components/auth/` | Validan, envían con su hook y muestran el resultado |

### Marca y estructura de las pantallas internas

| Componente | Archivo | Qué es |
|---|---|---|
| `MosaicoOficios` | `src/components/marca/MosaicoOficios.tsx` | El mural de azulejos de oficios (decorativo) |
| `MarcaPortal` | `src/components/marca/MarcaPortal.tsx` | Logo de la Municipalidad en blanco + "Portal de Empleo" en una fila; lleva al inicio |
| `EncabezadoPortal` | `src/components/marca/EncabezadoPortal.tsx` | Barra superior: marca, menú completo del rol con "Ayuda" (solo desktop, fija desde `lg`) y la cuenta |
| `BarraInferior` | `src/components/marca/BarraInferior.tsx` | Menú del celular, fijo abajo, con ícono y palabra |
| `BotonCuenta` | `src/components/marca/BotonCuenta.tsx` | Con sesión: quién ingresó (desde `xl`) y "Salir" siempre visible; sin sesión: "Ingresar" y el registro del área (desktop) |
| `itemsNavegacion` | `src/components/marca/itemsNavegacion.ts` | Qué opciones tiene el menú de cada rol, en un solo lugar |
| `LogoMunicipalidad` | `src/components/marca/LogoMunicipalidad.tsx` | Logo de la Municipalidad, claro o en color |
| `ProveedorSesion` | `src/components/sesion/ProveedorSesion.tsx` | Lee la sesión una vez por área; se usa con `useSesion` |
| `PedirIngreso` | `src/components/estados/PedirIngreso.tsx` | Estado de pantalla privada sin acceso, con "Ingresar" que vuelve a la pantalla |
| `AvisoCvFaltante` | `src/components/cv/AvisoCvFaltante.tsx` | "Subí tu CV" arriba de las ofertas, para el postulante sin CV |
| `Seccion` | `src/components/marca/Seccion.tsx` | El `<main>` de una pantalla interna: encabezado verde con el `h1` y mosaico, y el área de contenido con esquina "hoja" |
| `ErrorAlCargar` | `src/components/estados/ErrorAlCargar.tsx` | Estado de error con "Probar de nuevo" |
| `ListaConDetalle` | `src/components/marca/ListaConDetalle.tsx` | Disposición lista + detalle en la misma página (D-025): lado a lado en desktop, uno u otro en mobile |
| `PanelDetalle` | `src/components/marca/PanelDetalle.tsx` | Panel del detalle: encabezado verde, "Volver" en mobile y la acción principal fija abajo (solo si hay una); en mobile lleva el scroll y el foco al título |
| `TarjetaSeleccionable` | `src/components/marca/TarjetaSeleccionable.tsx` | Tarjeta "hoja" de una lista con detalle: es un link y se resalta la elegida |
| `CampoTexto` | `src/components/formularios/CampoTexto.tsx` | Campo de texto (una o varias líneas) con label, ayuda y error debajo |
| `SelectorNativo` | `src/components/formularios/SelectorNativo.tsx` | El `<select>` del navegador con el estilo de los inputs (44 px, texto de 16 px); siempre con label visible |
| `MarcoArea` | `src/components/marca/MarcoArea.tsx` | Sesión + barra superior + barra inferior de un área (postulante, empresa, Oficina); también envuelve el inicio |

### Inicio (P01)

| Componente | Archivo | Qué es |
|---|---|---|
| `PortadaInicio` | `src/components/inicio/` | Título, buscador "¿Qué trabajo buscás?" y rubros como atajos al catálogo |
| `CifrasPortal` | `src/components/inicio/` | "El portal en números": cuatro totales reales con contador (D-059) |
| `OfertasRecientes` | `src/components/inicio/` | Trae las ofertas una vez: las 8 más nuevas en `CarruselOfertas` y, debajo, `RubrosConOfertas` |
| `CarruselOfertas` | `src/components/inicio/` | Lista que se desliza de costado con puntos de anclaje y botones anterior/siguiente |
| `RubrosConOfertas` | `src/components/inicio/` | Los 11 rubros con su cantidad de ofertas, como links al catálogo filtrado |
| `Confianza` | `src/components/inicio/` | "Un servicio de la Municipalidad de Funes": logo y cuatro garantías reales |
| `ComoFunciona` | `src/components/inicio/` | Los 3 pasos para postularse y "Crear mi cuenta" |
| `ParaEmpresas` | `src/components/inicio/` | Bloque verde para empresas: registrarse o ingresar |
| `PieInicio` | `src/components/inicio/` | Logo en color y el ingreso de la Oficina de Empleo |

### Ayuda (P20)

| Componente | Archivo | Qué es |
|---|---|---|
| `SelectorPublico` | `src/components/ayuda/` | Las dos tarjetas-link que eligen la guía (postulante o empresa) |
| `GuiaPasos` | `src/components/ayuda/` | Pasos numerados con ícono, texto y link a la pantalla de cada paso |
| `PreguntasFrecuentes` | `src/components/ayuda/` | Acordeón de preguntas y respuestas |
| `ContactoAyuda` | `src/components/ayuda/` | Cierre: la Oficina ayuda en persona |
| `contenido.ts` | `src/components/ayuda/` | Todo el texto de la ayuda, con la regla de la que sale cada respuesta |

### Ofertas y postulaciones (P05, P06, P07)

| Componente | Archivo | Qué es |
|---|---|---|
| `OfertasPublicadas` | `src/components/ofertas/` | Trae las ofertas y muestra los filtros, y cargando, error, vacío o la lista |
| `FiltrosOfertas` | `src/components/ofertas/` | Buscador, chips de rubros, "Ordenar" y "Limpiar filtros"; todo cambia la URL |
| `ListaOfertas` | `src/components/ofertas/` | Aplica los filtros, dice qué se está viendo y arma lista + detalle en la misma página (D-025) |
| `TarjetaOferta` | `src/components/ofertas/` | Tarjeta "hoja": es un link a la oferta (conservando los filtros), con rubros, lugar, horario y "Te postulaste" |
| `IconoRubro` | `src/components/ofertas/IconoRubro.tsx` | El ícono de cada rubro, el mismo en chips, tarjetas y detalle |
| `DatosOferta` | `src/components/ofertas/` | Rubros, lugar, horario y sueldo (si la empresa lo cargó) con íconos. Varios rubros van en una sola línea, separados por "·", con el ícono del primero |
| `DetalleOferta` | `src/components/ofertas/` | Panel del detalle: encabezado verde, descripción, requisitos y "Postularme" fijo abajo |
| `BotonPostularme` / `AvisoPostulacion` | `src/components/ofertas/` | Envía la postulación y muestra el resultado: postulado, sin sesión, falta el CV (con link a subirlo) o error |
| `MisPostulaciones` / `ListaPostulaciones` | `src/components/postulaciones/` | Trae las postulaciones y las muestra sin estado (RF1.2.4) |

### Empresa (P09 a P12)

| Componente | Archivo | Qué es |
|---|---|---|
| `EstadoOferta` | `src/components/ofertas/EstadoOferta.tsx` | Etiqueta del estado (Pendiente, Publicada, Rechazada, Cerrada) con palabra e ícono, nunca solo color; la va a reusar la Oficina |
| `ResumenEmpresa` | `src/components/empresa/` | Inicio: aviso si faltan los datos, "Publicar una oferta", ofertas por estado y las últimas |
| `PerfilEmpresa` / `FormularioPerfilEmpresa` | `src/components/empresa/` | Datos de la empresa y de contacto, con CUIT validado |
| `FormularioOferta` | `src/components/empresa/` | Publicar una oferta: todos los campos obligatorios salvo el sueldo, de 1 a 3 rubros con casillas, y sin borrador |
| `OfertasEmpresa` / `TarjetaOfertaEmpresa` / `DetalleOfertaEmpresa` | `src/components/empresa/` | Mis ofertas: lista + detalle con estado, motivo del rechazo y pedido de cierre |
| `BotonSolicitarCierre` | `src/components/empresa/` | "Pedir el cierre" con confirmación (`AlertDialog`, el único tipo de modal del portal) |
| `CandidatosDerivados` / `TarjetaCandidato` / `DecisionCandidato` | `src/components/empresa/` | P17: los candidatos que derivó la Oficina, con contacto, CV y la respuesta "contraté / no contraté" (motivo ahí mismo, confirmación con `AlertDialog`) |

### Oficina de Empleo (P14 a P16, "Mesa de trabajo", D-042)

Todo en `src/components/admin/`. La UI anterior (`components/oficina/`) se borró el 2026-10-18 (DT-015).

| Componente | Qué es |
|---|---|
| `AppSidebar`, `NavUser` | Menú lateral de 232 px (56 px plegado) con contadores de tareas pendientes, y el operador con "Cerrar sesión" |
| `PageHeader` | Migas, título de 20 px y un texto opcional a la derecha |
| `Dashboard` | Pantalla 01: cuatro tarjetas de tareas que llevan a su cola, "Para resolver hoy" y accesos de gestión |
| `StatusStrip`, `Toolbar` | Tira de estados con su cantidad (filtro en la URL) y búsqueda con filtros (`/` la enfoca) |
| `AdminTable` | Tabla de filas de 56 px con paginado, encabezados que ordenan (`ordenable`, `?orden=`) y teclado (Tab, Enter, `/`). Con `hrefFila`, la fila abre la página del registro |
| `TablaOfertas`, `TablaPostulacionesNuevas`, `TablaPostulacionesRegistro`, `TablaPorComunicar`, `TablaPostulantes`, `TablaEmpresas` | Las tablas de cada cola o registro |
| `Split` | La caja con borde de la tabla, que ocupa el alto que queda |
| `FichaAdmin`, `FichaSeccion`, `EnlaceVolver` | Página completa de un registro (D-062): flecha "Volver a …", título con estado y acciones, dos columnas con tarjetas |
| `FichaOferta`, `FichaPostulante`, `FichaEmpresa` | La página completa de cada registro, con botones de contacto (llamar, WhatsApp, email) |
| `DatosLista`, `TarjetaEmpresa` (`panel-detalle.tsx`) | Lista rótulo/valor y tarjeta de la empresa con su contacto, compartidas por las páginas y la evaluación |
| `AccionesOferta`, `AccionesPostulacion` | Aprobar / rechazar con motivo / cerrar una oferta; preseleccionar / no apto / derivar una postulación (Server Actions, toast con el resultado) |
| `EvaluacionPostulacion` | Pantalla 06: oferta a la izquierda y postulante con su CV en un visor a la derecha (J/K para pasar de una a otra) |
| `ConfirmDialog` | Confirmación corta (`AlertDialog`), con motivo obligatorio cuando corresponde |
| `FormularioPreentrevista`, `ResultadoEmpresa` | Preentrevista opcional de una postulación; qué pasó después de derivarla (decisión de la empresa o sin respuesta) |
| `FormularioDerivacionCurso`, `AsociarOferta` | Derivar a un curso desde la ficha (P19); asociar a una persona con una oferta publicada (P16) |
| `StatusBadge`, `EmptyState`, `BotonAdmin`, `celdas` | Estado con punto de color, estado vacío sobrio, botón de 12,5 px y celdas comunes |
| `ListaEquipo`, `FormularioCuentaOficina` | P21: las cuentas de la Oficina (sin botón de borrar) y la creación con la contraseña temporal que se ve una sola vez |
| `EnlaceAccion` | Link con forma de botón chico y chevron, para la columna de acción de tablas y listas ("Resolver", "Evaluar", "Ver"); verde en la acción de la cola, con borde en las demás |

### CV (P04)

| Componente | Archivo | Qué es |
|---|---|---|
| `MiCv` | `src/components/cv/` | Trae el CV, muestra el actual, el formulario y quién lo ve; si llegaste desde una oferta, ofrece volver |
| `TarjetaCvActual` | `src/components/cv/` | Nombre, tamaño y fecha del CV cargado (sin link para abrirlo, RNF1) |
| `FormularioCv` | `src/components/cv/` | Caja grande para elegir el PDF, validación inmediata (tipo, tamaño y `%PDF-`) y "Subir CV" |

Cómo se arma una pantalla interna: el layout del grupo pone `MarcoArea` (sesión, barra superior y barra inferior), y cada `page.tsx` usa `Seccion` con su título y adentro el componente que trae los datos.

Cómo se arma una pantalla de acceso:
- `(acceso)/layout.tsx` pone el marco (`MarcoAcceso`).
- El layout de cada portal (`postulante/`, `empresa/`, `admin/`, `nueva-contrasena/`) pone su lema (`PanelAcceso`).
- Cada `page.tsx` pone su contenido: `TarjetaAcceso` con el título, el formulario adentro y `EnlacesAcceso` en el pie (D-021).

## 11. Registro de decisiones de diseño

Una línea por decisión, en orden. Cuando se vuelve atrás, se agrega una línea nueva que lo dice; las anteriores no se borran.

- **2026-09-28 — Colores y letras de la Municipalidad.** Verde `#074A1F`, gris oscuro `#262b35` para el texto y gris medio `#868d98` solo en bordes e íconos (no llega al contraste de texto). Be Vietnam Pro para el texto y Sora para los títulos. Por qué: identidad institucional y contraste WCAG AA. (§1, §2, D-019)
- **2026-09-28 — Botones y campos de 44 px, texto de 16 px.** Los primitivos de shadcn se agrandaron. Por qué: dedos y celulares chicos, y que iOS no haga zoom al tocar un campo. (§3, D-021)
- **2026-09-28 — "Revisá tu correo" es un mensaje fijo, no un toast.** Por qué: un toast desaparece y la persona puede no leerlo. (§5, D-020)
- **2026-09-28 — Dirección visual "Mosaico de oficios".** Mural de azulejos con oficios, forma "hoja", fondos verde monte y un lema grande. Por qué: la primera versión parecía una plantilla. (§0, D-022)
- **2026-09-28 — Tono adulto.** Azulejos cuadrados (sin círculos ni arcos), títulos en semibold y el menú con subrayado en vez de píldoras. Por qué: la versión anterior se sentía infantil. (§0)
- **2026-09-28 — Lista y detalle en la misma página, sin modal.** Como en los portales de empleo: lista a la izquierda y detalle a la derecha; en el celular, uno u otro. Por qué: el usuario lo había definido así, y un modal es frágil en celulares de gama baja. (§5, D-025)
- **2026-09-28 — Menú del celular abajo y encabezados bajos.** Barra fija inferior con ícono y palabra, "Salir" visible y el contenido en la mitad de arriba de la pantalla. Por qué: en el celular, el menú y el encabezado ocupaban media pantalla. (§4 bis, D-028)
- **2026-09-28 — Accesos directos.** Volver a donde estaba después de ingresar, "Te postulaste" en la oferta, aviso "Subí tu CV" y links cruzados entre los ingresos. Por qué: menos pasos para personas con poca práctica digital. (§4 bis, D-028)
- **2026-09-28 — Logo de la Municipalidad en la barra superior.** En blanco sobre el verde. (§4 bis, D-028)
- **2026-09-28 — Vuelven los colores alternados del mosaico.** Se había pasado a un mosaico tonal (casi todo verde oscuro); se vuelve a los colores llenos que cambian de lugar entre filas. Por qué: al usuario le gustaba ese efecto. Reemplaza, en "Tono adulto", lo del mosaico tonal. (§0)
- **2026-09-28 — Marca sin cuadraditos y logo a tamaño fijo.** La marca es el logo en blanco, una línea y "Portal de Empleo"; se sacaron los cuadrados de colores. El logo tiene ancho y alto fijos y no se encoge. Por qué: el logo se veía estirado y los cuadrados competían con él. (§4, §4 bis)
- **2026-09-28 — Inicio para buscar trabajo.** Buscador, rubros como atajos y las 4 ofertas más recientes, antes de "Cómo postularte" y del bloque para empresas. Por qué: idea del usuario; que la portada sirva para empezar a buscar. Recientes y no "más relevantes" porque la relevancia no tiene un criterio definido. (§4 ter, D-029)
- **2026-09-28 — Ofertas como catálogo.** Buscar (sin importar tildes), filtrar por rubro y ordenar, todo en la URL, con una frase que dice qué se está viendo y una salida cuando no hay resultados. Por qué: idea del usuario, y que el "atrás" del celular y los links compartidos funcionen. (§4 ter, D-029)
- **2026-09-28 — Selector nativo para listas cortas.** El `<select>` del navegador con el estilo del portal, en lugar del `Select` de shadcn. Por qué: en el celular abre el selector propio del teléfono, que la gente ya conoce y siempre entra en la pantalla. (§5)
- **2026-09-28 — Oficina: panel de números que llevan a resolver.** Los urgentes en verde oscuro, pestañas-link por estado con su cantidad y la cola ordenada por llegada. Por qué: la Oficina trabaja con tareas pendientes; la pantalla tiene que decir qué hacer primero. (§4 ter, D-030)
- **2026-09-28 — El motivo del rechazo se escribe ahí mismo.** El campo aparece en la barra de acciones del detalle, no en un modal. Publicar y cerrar usan una confirmación corta. Por qué: el teclado del celular y los modales se llevan mal (D-025), y la empresa necesita el motivo (RF1.3.5). (§4 ter, §5, D-030)
- **2026-09-28 — En el celular, el mosaico no va detrás de un texto.** Se oculta por debajo de 640 px en los encabezados de sección y en el bloque para empresas del inicio. Por qué: tapaba el título y costaba leerlo. (§0)
- **2026-09-28 — La barra de acciones del detalle solo aparece si hay algo para hacer.** Por qué: vacía, igual ocupaba lugar y tapaba el final del contenido (los postulantes). (§4 ter, §10)
- **2026-09-29 — Varios rubros por oferta.** En P11, casillas en tarjeta con el ícono de cada rubro, de 1 a 3; al llegar a 3 las demás se apagan y un aviso arriba dice cómo cambiar una. En tarjetas y detalle, los rubros van en una sola línea separados por "·". Por qué: una oferta puede cruzar rubros (D-032); prevenir el error es mejor que mostrarlo, y en el celular una línea no alarga la tarjeta. (§5, D-032)
- **2026-09-29 — El sueldo, cuando está, en la misma lista que lugar y horario.** Una línea más con ícono de billete; si la empresa no lo cargó, la línea no aparece (nada de "A convenir" inventado). Por qué: es de lo primero que mira quien busca trabajo, y el campo es opcional (D-032). (§4 ter)
- **2026-09-29 — "Crear cuenta" también vuelve a la oferta.** Desde "Postularme" sin sesión, tanto "Ingresar" como "Crear cuenta" llevan `?volver=` y, al terminar, devuelven a la oferta. Si Supabase deja entrar directo (confirmación de email apagada), no se muestra "Revisá tu correo". Por qué: que postularse sea un solo camino para quien entra por primera vez (D-034). (§5)
- **2026-10-15 — Interfaz "Mesa de trabajo" para el panel de administración de la Oficina de Empleo.** Rediseño integral al píxel de la vista de administración según especificaciones y mockups 01 a 10 (D-042). Sidebar colapsable a 56 px con escudo municipal institucional a 30 px, tira de estados con estilo menta y conteos en tiempo real, contenedor split 1fr 500px para tablas y panel de inspección lateral (con hoja de CV y reproductor PDF en evaluación), atajos de teclado (/ para búsqueda, ↑/↓/Enter/Esc para tablas, J/K en evaluación), altura de fila de 40 px estricta, tokens semánticos suaves (attention, success-soft, danger-soft, neutral-soft) en coherencia con el verde primario municipal (#074A1F), y mutaciones con Server Actions y confirmaciones toast. (§4 ter, D-042)
- **2026-10-18 — En las tablas de la Oficina sin panel, la fila abre su página.** En "Postulaciones" y "Postulaciones nuevas", tocar la fila (o Enter) abre la evaluación, igual que "Ver"/"Evaluar". Antes la fila solo quedaba marcada y no pasaba nada. En "Por comunicar" no: sus filas tienen botones con diálogo. (§4 ter, §10, `AdminTable.hrefFila`)
- **2026-10-18 — Candidatos derivados dentro de la oferta, sin topes.** La empresa ve y responde por cada persona en el detalle de su oferta; "No la contraté" pide el motivo ahí mismo y las dos respuestas se confirman porque no se cambian. En lugar de limitar candidatos, se muestra cuántas respuestas faltan, también en el inicio. Por qué: D-044 y D-054 (el debate con el usuario: un tope cortaba al candidato que podía servir). (§4 ter, §5)
- **2026-10-18 — Seguimiento y cursos en la ficha de la Oficina.** Conteos del seguimiento, aviso con 3 rechazos que lleva a "Cursos", preentrevista y resultado con la empresa en la evaluación, tarjeta y tareas "Sin respuesta de la empresa" e indicadores en números en el panel. Por qué: RF1.6.1 a RF1.6.6, D-051 y D-054; el aviso de 3 rechazos es la idea del usuario y solo informa. (§4 ter)
- **2026-10-18 — Los links con forma de botón conservan el rol de link.** `buttonVariants` sobre `<Link>` o `<a>`, no `Button render`. Por qué: Base UI los anunciaba como botones. (§5)
- **2026-10-18 — "Mi perfil" sin sesión pide ingresar una sola vez.** El bloque del CV (`SeccionCv`) se muestra solo con sesión de postulante; sin ella, el aviso de los datos personales alcanza. Antes salían dos avisos seguidos con los mismos botones.
- **2026-10-20 — Acciones de las tablas de la Oficina como botón chico.** "Resolver", "Evaluar" y "Ver" dejan de ser texto con "→" y pasan a `EnlaceAccion` (borde, chevron y fondo menta al pasar el mouse; verde lleno en la acción de cada cola). El paginado usa chevrons. `BotonAdmin` fija el color del texto al pasar el mouse: antes el botón verde quedaba con texto gris oscuro. Por qué: el usuario marcó el botón y su hover como malos; "→" al final está en "Qué evitar" (§0). (§10)
- **2026-10-20 — La evaluación muestra la empresa completa y suma atajos.** Tarjeta de la empresa con descripción, contacto y "Ver ficha"; requisitos de la oferta; cómo viene la oferta; "Ver ficha" de la persona y "Copiar datos para la empresa". El texto copiado no viaja en el link de WhatsApp: la operadora lo pega donde quiera. Por qué: el usuario pidió los datos de la empresa en la postulación y más herramientas para la Oficina; mandar datos personales dentro de una URL a un servicio externo está prohibido (§7 de AGENTS.md). (§4 ter)
- **2026-10-20 — Barra de navegación completa y "Salir" a la vista.** En la computadora, el menú completo del rol con "Ayuda", "Publicar" como botón menta, la barra fija arriba y alineada con el contenido; a la derecha, quién ingresó y "Salir" (sin menú desplegable). En el celular, "Salir" arriba y 4 opciones abajo. Por qué: el usuario la marcó como "malísima, con 2 botones cualquiera". Reemplaza D-040. (§4 bis, D-056)
- **2026-10-20 — Ayuda (P20).** Tarjetas para elegir el público, guía numerada con links a cada pantalla y preguntas frecuentes en acordeón. Por qué: pedido del usuario; guías para quien tiene poca práctica digital. (§4 ter, D-057)
- **2026-10-20 — Equipo de la Oficina (P21).** Lista de cuentas sin botón de borrar y formulario de un solo campo; la contraseña temporal se ve una vez, en un recuadro de atención con "Copiar". Por qué: pedido del usuario (crear sin borrar, D-058); que no quede a la vista más de lo necesario. (§4 ter, §10)
- **2026-10-20 — Inicio con cifras, carrusel, rubros y confianza.** Totales reales con contador, ofertas en carrusel, rubros con su cantidad de ofertas y un bloque institucional con garantías que el sistema cumple; sin testimonios ni números inventados. Los contadores son la única animación además de la carga (§0). Por qué: el usuario pidió una landing menos vacía, con estadísticas, sliders y cosas que den seguridad. (§0, §4 ter, §10, D-059)
- **2026-10-22 — La Oficina abre cada registro en una página completa.** Se saca el panel lateral de 500 px: la fila abre la página, con la flecha "Volver a …" a la misma lista y dos columnas a todo el ancho. La evaluación también tiene la flecha. Por qué: el usuario marcó que el panel tenía "mucha info en muy poco lugar" y que "Abrir página completa" se veía roto. Reemplaza, en "Mesa de trabajo", el panel al lado de la tabla. (§4 ter, §10, D-062)
- **2026-10-22 — Tablas de la Oficina que se ordenan y filas más altas.** Encabezados que ordenan toda la lista (flecha en la columna activa, orden en la URL), filas de 56 px y botones de acción de 36 px; "Empresas nuevas" en Tareas pendientes con su vista. Por qué: el usuario marcó que el orden "solo se informaba", que las filas eran angostas y propensas a errores, y preguntó dónde ver las empresas nuevas. (§4 ter, §10, D-063, D-064)
