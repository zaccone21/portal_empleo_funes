# Diseño — valores predeterminados

Guía visual y de interacción del Portal de Empleo. Es la referencia para cualquier pantalla nueva: si algo no está acá, se decide y se agrega. Las decisiones que la originan son D-019 (paleta y tipografía), D-020 (acceso) y D-021 (tamaños táctiles y cómo se arma una pantalla).

Público: personas con poca práctica digital, en celulares de gama baja y muchas veces al sol (RNF3). Todo lo que sigue sale de ahí: botones grandes, texto grande, contraste alto, una acción principal por pantalla y flujos de un solo sentido.

**Simple de usar no significa pelado.** El portal tiene una identidad visual propia y marcada (D-022). Una pantalla sin carácter, que parezca una plantilla, no está terminada.

---

## 0. Dirección visual: "Mosaico de oficios" (D-022)

La idea: **un mural de azulejos con los oficios de la ciudad** (albañilería, jardinería, cocina, electricidad, transporte, costura…), en los verdes de la Municipalidad y con un único acento amarillo "sol". Conecta con el corazón del portal, que es que cada persona encuentre trabajo de lo suyo (las etiquetas de oficios de RF1.2.2).

- **El mosaico es el elemento memorable** y aparece en los fondos verdes: el marco de acceso y los encabezados de sección. Todo lo que está alrededor es sobrio: fondos blancos, tipografía clara, sin decoración extra. Si un fondo ya tiene mosaico, no se le suma otro adorno.
- **Forma firma, la "hoja":** dos esquinas redondeadas en diagonal (arriba a la izquierda y abajo a la derecha) y dos casi rectas, **siempre discreta**. La usan algunos azulejos, el panel blanco del acceso y las tarjetas. Clases:
  - Paneles grandes: `rounded-tl-[1.75rem] rounded-br-[1.75rem] rounded-tr-lg rounded-bl-lg`.
  - Tarjetas: `rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md`.
  - Íconos en azulejo: `rounded-tl-xl rounded-br-xl rounded-tr-sm rounded-bl-sm`.
- **Tono adulto e institucional:** es atrevida pero no infantil. El mosaico es tonal (casi todo en verdes cercanos al fondo) y tiene azulejos cuadrados; no hay círculos ni arcos. Los títulos van en Sora semibold, no bold. La navegación marca la página actual con un subrayado, no con píldoras de color.
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
| `chart-1…5` | grises de shadcn (sin cambio) | Se definen al hacer el dashboard (P14) | — |

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
- La marca (`MarcaPortal`) es un mini mosaico de 2×2 con el nombre del portal. Reemplaza al logo hasta que haya uno nítido: `docs/LOGOcolor.png` mide 92 × 26 px y se ve borroso.

## 5. Componentes: cuándo usar cada uno

| Necesidad | Usar | Notas |
|---|---|---|
| Acción principal | `Button` (variante `default`, `size="lg"` en formularios) | Una por pantalla |
| Acción secundaria | `Button variant="outline"` o link | |
| Botón de ícono (mostrar contraseña, cerrar) | `Button variant="ghost" size="icon"` | Siempre con `aria-label` en español |
| Navegar a otra pantalla | `<Link>` de `next/link` | Nunca `<a href>` para rutas internas |
| Lista con detalle (ofertas, y en el futuro postulantes de una oferta) | Lista + panel de detalle en la misma página, con la selección en la URL (`?oferta=<id>`) | **No usar `Dialog` para contenido largo ni formularios**: en celulares de gama baja un modal es frágil (D-025). En desktop van lado a lado; en mobile el detalle reemplaza a la lista y tiene "Volver" |
| Confirmar una acción que no se deshace | `AlertDialog` | Por ejemplo, solicitar el cierre de una oferta. Texto corto y dos botones |
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
| `MarcaPortal` | `src/components/marca/MarcaPortal.tsx` | Mini mosaico 2×2 + nombre del portal; lleva al inicio |
| `EncabezadoPortal` | `src/components/marca/EncabezadoPortal.tsx` | Barra verde con la marca y la navegación; marca la página actual |
| `Seccion` | `src/components/marca/Seccion.tsx` | El `<main>` de una pantalla interna: encabezado verde con el `h1` y mosaico, y el área de contenido con esquina "hoja" |
| `ErrorAlCargar` | `src/components/estados/ErrorAlCargar.tsx` | Estado de error con "Probar de nuevo" |

### Ofertas y postulaciones (P05, P06, P07)

| Componente | Archivo | Qué es |
|---|---|---|
| `OfertasPublicadas` | `src/components/ofertas/` | Trae las ofertas y muestra cargando, error, vacío o la lista |
| `ListaOfertas` | `src/components/ofertas/` | Lista + detalle en la misma página (D-025); decide qué se ve en desktop y en mobile |
| `TarjetaOferta` | `src/components/ofertas/` | Tarjeta "hoja": es un link a `?oferta=<id>` y se resalta la elegida |
| `DatosOferta` | `src/components/ofertas/` | Lugar y horario con íconos |
| `DetalleOferta` | `src/components/ofertas/` | Panel del detalle: encabezado verde, descripción, requisitos y "Postularme" fijo abajo |
| `BotonPostularme` / `AvisoPostulacion` | `src/components/ofertas/` | Envía la postulación y muestra el resultado: postulado, sin sesión, falta el CV (con link a subirlo) o error |
| `MisPostulaciones` / `ListaPostulaciones` | `src/components/postulaciones/` | Trae las postulaciones y las muestra sin estado (RF1.2.4) |

### CV (P04)

| Componente | Archivo | Qué es |
|---|---|---|
| `MiCv` | `src/components/cv/` | Trae el CV, muestra el actual, el formulario y quién lo ve; si llegaste desde una oferta, ofrece volver |
| `TarjetaCvActual` | `src/components/cv/` | Nombre, tamaño y fecha del CV cargado (sin link para abrirlo, RNF1) |
| `FormularioCv` | `src/components/cv/` | Caja grande para elegir el PDF, validación inmediata (tipo, tamaño y `%PDF-`) y "Subir CV" |

Cómo se arma una pantalla interna: el layout del grupo pone `EncabezadoPortal`, y cada `page.tsx` usa `Seccion` con su título y adentro el componente que trae los datos.

Cómo se arma una pantalla de acceso:
- `(acceso)/layout.tsx` pone el marco (`MarcoAcceso`).
- El layout de cada portal (`postulante/`, `empresa/`, `admin/`, `nueva-contrasena/`) pone su lema (`PanelAcceso`).
- Cada `page.tsx` pone su contenido: `TarjetaAcceso` con el título, el formulario adentro y `EnlacesAcceso` en el pie (D-021).
