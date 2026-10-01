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
- **Movimiento:** un único momento al cargar, en el que los azulejos aparecen escalonados y el panel sube. Siempre con `motion-safe:`, para respetar "reducir movimiento". No hay animaciones de hover en cada tarjeta ni entradas por sección.
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
- **Arriba**, en todas las pantallas internas: la marca (logo de la Municipalidad en blanco + "Portal de Empleo") y la cuenta.
  - En desktop, el menú va también arriba, con subrayado en la página actual.
  - **"Salir" es un botón visible con ícono y palabra**, no un menú escondido.
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
3. **Ofertas recientes**: las 4 ofertas publicadas más nuevas, con "Ver todas las ofertas". Se eligieron las recientes y no las "más relevantes" porque la relevancia necesita un criterio que no está definido.
4. **Cómo postularte**: 3 pasos numerados (es una secuencia real: cuenta, CV, postulación) y "Crear mi cuenta".
5. **Para empresas**: bloque verde con mosaico (solo desde `sm`) y dos botones: "Registrar mi empresa" y "Ya tengo cuenta".
6. **Pie**: logo en color y el ingreso de la Oficina de Empleo, discreto, porque lo usan pocas personas.

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

### Oficina de Empleo (P14 y P15, D-030)

La Oficina trabaja con una cola de tareas: la pantalla le dice **qué necesita atención y la lleva directo a resolverlo**.
- **Panel (P14)**: 4 números grandes, cada uno es un link a la lista que lo resuelve: ofertas para revisar, pedidos de cierre, postulaciones sin revisar y ofertas publicadas. **Los que requieren acción van en verde oscuro** cuando son más de cero; los informativos van en blanco. Texto en singular o plural según el número ("1 pedido de cierre").
- **Gestión de ofertas (P15)**: pestañas por estado (Pendientes, Publicadas, Rechazadas, Cerradas) con la cantidad de cada una. Son links (`?estado=`), no pestañas de JavaScript: el "atrás" y el link del panel funcionan.
- **Orden de la cola**: las pendientes, las más viejas primero (se atiende por orden de llegada). En publicadas, primero las que pidieron el cierre, marcadas con "Pidió el cierre".
- **Lista y detalle en la misma página** (D-025), igual que el catálogo. El detalle muestra, en este orden:
  1. el estado y qué hacer con él;
  2. la empresa, con teléfono (`tel:`) y email (`mailto:`) como links, para llamar o escribir de un toque;
  3. la oferta tal como la escribió la empresa;
  4. en publicadas y cerradas, los postulantes.
- **Decisiones fijas abajo**, y solo si hay algo para decidir (pendiente, o publicada con pedido de cierre). Si no hay nada, no se muestra la barra: una barra vacía tapa contenido.
- **Publicar y cerrar** piden una confirmación corta (`AlertDialog`), porque se ven enseguida en el catálogo.
- **Rechazar abre el campo "Motivo del rechazo" ahí mismo**, en la barra de abajo, no en un modal. El motivo es obligatorio porque la empresa lo lee (RF1.3.5): el error lo dice ("Escribí el motivo: la empresa lo va a leer").
- **Postulantes**: email (link `mailto:`), fecha, estado con palabra e ícono, "Ver CV" (abre el PDF en otra pestaña) y el selector de estado nativo. Al cambiar el estado se guarda enseguida y un toast confirma: "Guardado: Pre-seleccionado."

## 5. Componentes: cuándo usar cada uno

| Necesidad | Usar | Notas |
|---|---|---|
| Acción principal | `Button` (variante `default`, `size="lg"` en formularios) | Una por pantalla |
| Acción secundaria | `Button variant="outline"` o link | |
| Botón de ícono (mostrar contraseña, cerrar) | `Button variant="ghost" size="icon"` | Siempre con `aria-label` en español |
| Navegar a otra pantalla | `<Link>` de `next/link` | Nunca `<a href>` para rutas internas |
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
| `EncabezadoPortal` | `src/components/marca/EncabezadoPortal.tsx` | Barra superior: marca, menú del rol (solo desktop) y la cuenta |
| `BarraInferior` | `src/components/marca/BarraInferior.tsx` | Menú del celular, fijo abajo, con ícono y palabra |
| `BotonCuenta` | `src/components/marca/BotonCuenta.tsx` | "Salir" visible con sesión; "Ingresar" y "Crear cuenta" sin sesión (desktop) |
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
| `OfertasRecientes` | `src/components/inicio/` | Las 4 ofertas publicadas más nuevas y "Ver todas las ofertas" |
| `ComoFunciona` | `src/components/inicio/` | Los 3 pasos para postularse y "Crear mi cuenta" |
| `ParaEmpresas` | `src/components/inicio/` | Bloque verde para empresas: registrarse o ingresar |
| `PieInicio` | `src/components/inicio/` | Logo en color y el ingreso de la Oficina de Empleo |

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

### Oficina de Empleo (P14, P15)

| Componente | Archivo | Qué es |
|---|---|---|
| `ResumenOficina` | `src/components/oficina/` | Panel: 4 números que son links a lo que hay que resolver; los urgentes en verde oscuro |
| `GestionOfertas` | `src/components/oficina/` | Trae todas las ofertas, las separa por estado, las ordena como cola y arma lista + detalle |
| `PestanasEstado` | `src/components/oficina/` | Pestañas-link por estado con su cantidad |
| `TarjetaOfertaOficina` | `src/components/oficina/` | Tarjeta con empresa, título, "Pidió el cierre" y cantidad de postulaciones |
| `DetalleOfertaOficina` | `src/components/oficina/` | Estado, empresa con teléfono y email de un toque, la oferta y sus postulantes |
| `AccionesOferta` | `src/components/oficina/` | Publicar, rechazar con motivo (ahí mismo) o cerrar; solo aparece si hay algo para decidir |
| `PostulantesDeOferta` | `src/components/oficina/` | Postulantes con email, "Ver CV" y el estado para cambiar |
| `EstadoPostulacion` | `src/components/oficina/` | Etiqueta del estado de una postulación (Postulado, Pre-seleccionado, Derivado, No apto) con palabra e ícono; solo la ve la Oficina |

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
