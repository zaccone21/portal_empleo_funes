Vas a recibir dos instrucciones seguidas. Tratalas como un solo encargo:
primero las decisiones vigentes y la Fase 4 (Ofertas), después la Fase 4A
(identidad visual y correcciones). Ejecutá en este orden: 4A → Fase 4 → Fase 5.
Donde la 4A dice "leé docs/...", ignorá esa línea: el contenido ya está en este
mensaje. Si hay diferencias entre las dos, manda la 4A.

# Fase 4A — Correcciones + Identidad visual (y continuación con Fase 4 y 5)

> Pegá este documento completo al agente. Complementa `docs/plan-admin-fase-4-ofertas.md` (decisiones vigentes, cierre de Fase 3 y Fase 4) y `docs/plan-refactor-admin.md` (plan original). **Leé esos dos archivos antes de empezar.** Si hay diferencias, este documento tiene prioridad.
>
> **Orden de trabajo:** 4A (esta) → Fase 4 (Ofertas, con las enmiendas de la sección D) → Fase 5 (Postulantes y Empresas). Reportá al terminar cada una. No esperes confirmación entre fases salvo que te bloquee una duda de alcance o algo toque base de datos, API, auth o el portal público.

---

## A. Diagnóstico de lo que hay hoy (capturas del admin)

### Bugs y defectos concretos (corregilos primero)

1. **Ítem activo del sidebar incorrecto.** "Dashboard" aparece resaltado en *todas* las pantallas, además del ítem real (en Ofertas se resaltan Dashboard y Ofertas; en Postulantes, Dashboard y Postulantes). El matching por prefijo hace que `/admin` coincida con todo. Regla: el Dashboard solo está activo en `/admin` exacto; el resto, por prefijo más específico. Tiene que haber **un único** ítem activo.
2. **"1 Issue" en el overlay de desarrollo de Next.js** (badge rojo abajo a la izquierda, visible en Ofertas y Postulantes). Abrilo, identificá la causa (hidratación, warning de consola, key duplicada, etc.) y corregila. Reportá cuál era.
3. **Breadcrumb fijo** ("Oficina de Empleo", repetido con el encabezado del sidebar). Tiene que ser dinámico por ruta (Inicio › Ofertas › {puesto}).
4. **Dashboard que promete lo que no muestra.** El subtítulo dice "Tocá cada número" pero no hay números, solo "No hay ofertas pendientes".
5. **Contenido pegado a la izquierda con un hueco muerto a la derecha** en las tres pantallas (el contenedor tiene un ancho máximo fijo y no está centrado ni aprovecha el ancho). Con tablas de cientos de filas hay que usar el ancho disponible.
6. **Selector de estado con valor crudo** ("todas", en minúscula). Usar etiquetas del dominio ("Todas", "Publicadas"…).
7. **Celdas con "-" duplicado** en la columna Publicada de las ofertas rechazadas. Mostrar "Enviada" siempre (fecha + antigüedad) y "Publicada" solo si existe; cuando no exista, un solo "—" atenuado.
8. **Teléfono mostrado crudo** (`+543412719319`). Formatear para lectura (ver sección D.3).
9. **Pantalla de Postulantes todavía en el diseño viejo** (tarjeta grande de búsqueda, 11 chips, tarjetas de totales). Se rehace en la Fase 5 con el sistema nuevo; no la retoques ahora salvo para que herede los tokens.

### Por qué se siente genérico
Es shadcn por defecto: sidebar blanco, badges verdes y rojos saturados (`Publicada`/`Rechazada` en verde y rojo planos), ningún elemento que remita a la Municipalidad ni al portal público. El portal público tiene una identidad clara (verde profundo, acentos mostaza/dorado, escudo, mosaico de íconos por rubro, hoja blanca con esquina redondeada) y el admin no usa nada de eso.

---

## B. Identidad visual del admin

**Fuente de verdad: el portal público.** Antes de definir nada, leé (solo lectura, sin modificarlo) su `globals.css`, `layout`, componentes de cabecera/hero, fuentes (`next/font`) y assets (escudo, íconos por rubro, patrón de tiles). Extraé de ahí los colores, la tipografía y los radios **reales**. Los valores de abajo son referencias aproximadas tomadas de capturas; si difieren de los reales, mandan los reales.

### B.1 Tokens (en `globals.css`, vía variables de shadcn; nada de hex dentro de componentes)
| Rol | Referencia | Uso |
|---|---|---|
| Verde profundo | ~`#033320` (fondo del header público) | Sidebar, textos de énfasis |
| Verde de marca | ~`#0a5c2e` | `--primary`: botones, foco, enlaces |
| Menta | ~`#e6f0e9` | Ítem activo, hover de filas, fondos suaves |
| Mostaza/dorado | ~`#b8a02f` (tiles amarillos del hero) | Acento: contadores, estados "pendiente", marcas de atención |
| Superficie | gris cálido muy claro (como el fondo de la hoja pública) | Fondo del contenido |
| Tinta | casi negro verdoso | Texto principal |

- Los tonos semánticos de la Fase 1 (`--success`, `--warning`, `--danger`) se **armonizan** con la paleta: success = verde de marca, warning = mostaza, danger = rojo apagado (no `red-600` plano), neutral = gris cálido. Cada tono tiene fondo suave + texto oscuro + borde sutil (para los badges).
- Mismos radios y tipografía que el público (mismas fuentes de `next/font`; no agregues fuentes nuevas). Títulos con el mismo carácter que el público (peso medio-alto, tracking ajustado). `tabular-nums` en todo número (contadores, cantidades, fechas).
- Sin modo oscuro por ahora, pero con tokens que permitan agregarlo después.

### B.2 Sidebar con marca
- Fondo verde profundo, texto claro, `variant="inset"` (la hoja de contenido con esquina redondeada replica la del público).
- Cabecera: **escudo de la Municipalidad** + "Oficina de Empleo" / "Gobierno de la Ciudad de Funes". Reutilizá el mismo archivo de escudo del portal público. No lo recolorees ni lo deformes: si solo existe la versión a color, colocalo sobre una chapa clara; si hay versión monocromática blanca, usala directamente.
- Ítem activo: fondo translúcido o menta + marca vertical dorada de 3 px a la izquierda. Hover sutil. Etiquetas de grupo en versalitas pequeñas y atenuadas.
- Contadores como pill mostaza con texto oscuro (solo se muestran si son mayores que 0).
- Pie: avatar + email del operador, más discreto.
- Colapsa a íconos con tooltips; el estado persiste.

### B.3 Encabezado de página (`PageHeader`)
- Bloque compacto con fondo menta suave, esquina redondeada y **patrón de íconos de rubros** del público a muy baja opacidad (≈8–10 %) en el extremo derecho. **No puede agregar altura** respecto del encabezado actual: ahí está la identidad sin gastar espacio vertical.
- Título + subtítulo de una línea + acción principal a la derecha.
- En las fichas de detalle usar la versión sin patrón (más sobria).

### B.4 Tiles de rubro
- Reutilizá el **mapeo rubro → ícono del portal público** (importalo, no lo dupliques). Crear un componente `RubroTile` (cuadrado redondeado de 28 px con el ícono, en tonos verde/mostaza/menta como en el hero).
- Usarlo en las columnas de Rubro de ofertas y postulantes, en las fichas y, más grande, en las tarjetas del Dashboard.

### B.5 Badges de estado (`StatusBadge`)
- Tonales, con punto de color a la izquierda, fondo suave, texto oscuro, sin colores planos saturados.
- Sugerencia de mapeo: Pendiente → mostaza; Publicada → verde; Rechazada → rojo apagado; Cerrada → neutro; "Cierre solicitado" (marca adicional) → mostaza con ícono. En postulaciones: `postulado` neutro-menta, `preseleccionado` verde, `derivado` verde profundo, `no_apto` rojo apagado. Ajustalo si el dominio sugiere otra cosa, pero un estado = un tono en toda la app.

### B.6 Tablas y componentes
- Encabezado de tabla: fondo superficie, texto pequeño en versalitas con tracking; fila de 48–52 px; hover menta; encabezado sticky; números a la derecha.
- Fila clickeable (abre la ficha) además del botón **"Ver"** con texto (no solo el ojo). Acciones secundarias en menú `⋯` con tooltips.
- Botón primario verde de marca; destructivos en rojo apagado, con variante outline para "Rechazar".
- Estados vacíos con un `RubroTile` grande, mensaje claro y siguiente paso.
- Foco visible en verde de marca. Transiciones de 150 ms; respetar `prefers-reduced-motion`.
- Sin gradientes pesados, sin emojis, sin librerías nuevas.

### B.7 Layout
- Contenido a ancho completo con un máximo generoso (≈1600 px) y centrado; padding consistente. Nada pegado a un costado con el resto vacío.
- La **densidad no puede empeorar**: la identidad se logra con color, forma y detalles, no con espacio vacío.

### B.8 Dashboard v1 (el rediseño completo sigue siendo la Fase 7)
Ahora, solo lo necesario para que no mienta:
- Grilla responsive de tarjetas clickeables (1/2/4 columnas) con **número grande**, rótulo, texto breve y `RubroTile`/ícono: Ofertas por revisar, Cierres solicitados, Postulaciones nuevas (`postulado`), Por derivar (`preseleccionado`). Los números salen de `getConteosAdmin` y deben coincidir con los contadores del sidebar y con cada cola.
- Cada tarjeta lleva a su cola. Con valor 0 se muestra "Al día" con tono neutro, no un número gigante en rojo.
- Debajo, la lista "Últimas postulaciones" con ancho completo (hoy es una tarjeta chica).
- Borrá el texto "Tocá cada número" o hacelo verdadero.

### B.9 Criterios de aceptación de la 4A
- [ ] Un solo ítem activo en el sidebar en todas las rutas.
- [ ] El overlay de Next.js no muestra issues en `/admin`, `/admin/ofertas` ni `/admin/postulantes`.
- [ ] Ningún color hardcodeado en componentes; todo sale de tokens.
- [ ] Escudo y nombre institucional en el sidebar; tiles de rubro reutilizando el mapeo del público.
- [ ] El portal público no cambió (verificá con `git diff` que no tocaste sus archivos; solo los leíste).
- [ ] Se ve bien a 1366 px, 1920 px y 390 px (móvil, sidebar off-canvas).
- [ ] Contraste AA en textos sobre verde profundo, mostaza y menta.
- [ ] `npm run verify` pasa.

---

## C. Después de la 4A: continuar con la Fase 4 (Ofertas)

Seguí `docs/plan-admin-fase-4-ofertas.md` (secciones B, C y D), construida **sobre el sistema visual de la 4A**: los `StatusBadge`, `PageHeader`, `RubroTile` y tablas ya salen con la identidad nueva, no se reestilizan después. Aplicá las enmiendas de la sección D.

---

## D. Enmiendas a la Fase 4

### D.1 Registro de ofertas
Además de lo ya pedido: columna Rubro con `RubroTile`; columna Postulaciones numérica y alineada a la derecha; estados con etiquetas del dominio en el filtro ("Todas", "Pendientes", "Publicadas", "Rechazadas", "Cerradas"), idealmente como segmentos con conteo en lugar de un select.

### D.2 Fechas
Una sola convención en todas las tablas: fecha en formato argentino + antigüedad atenuada debajo. Valor ausente = un único "—".

### D.3 Teléfonos (corrige el helper de WhatsApp del plan anterior)
En la base los teléfonos están en formatos distintos (`341 271 9319` en la empresa, `+543412719319` en el postulante), así que el helper de la Fase 4 debe ser más robusto. Crear `src/lib/telefonos.ts` con tests:

- `normalizarTelefonoAR(raw)`: quita todo lo que no sea dígito; quita un `54` inicial; quita un `9` inicial **solo si** después quedan 10 dígitos; quita un `0` inicial. Si el resultado tiene exactamente **10 dígitos** (código de área + número), lo devuelve; si no, devuelve `null`.
- `formatearTelefonoAR(raw)`: si normaliza, muestra `341 271 9319` (código de área + número, agrupado); si no, muestra el valor original sin tocar.
- `enlaceWhatsApp(raw)`: si normaliza, `https://wa.me/549` + los 10 dígitos; si no, `null` (se oculta el botón de WhatsApp y queda solo `tel:`).
- `enlaceLlamada(raw)`: `tel:+54` + dígitos si normaliza; si no, `tel:` con los dígitos originales.

Casos de test obligatorios, todos deben dar `5493412719319` en `enlaceWhatsApp` (terminando en `wa.me/`): `"341 271 9319"`, `"+543412719319"`, `"+5493412719319"`, `"0341 271-9319"`. Y `"12345"` → `null`. Usarlo en la ficha de empresa, la ficha y el registro de postulantes.

---

## E. Fase 5 (Postulantes y Empresas)

Como en el plan original, con estos ajustes:
- Rehacé la pantalla de Postulantes con el sistema nuevo: tabla densa en lugar de la tarjeta grande de búsqueda, los totales (Con CV / Sin CV) pasan a **filtros clickeables** con conteo, y los 11 chips se reemplazan por un selector múltiple de rubros (`Popover` + `Command`) con `RubroTile` en cada opción. Aclarar en la UI si el filtro múltiple es "alguno de" (hoy dice "se muestra quien tenga alguno de ellos").
- Siempre mostrar el DNI. Postulante sin nombre = "Sin nombre cargado" con marca de perfil incompleto.
- Sin notas internas (decisión vigente).
- Ficha de postulante: datos, contacto con botones (helpers de D.3), visor/descarga de CV, rubros, historial de postulaciones con `StatusBadge`.

---

## F. Entrega (por cada fase)
1. Archivos creados, modificados y eliminados.
2. Causa del "1 Issue" y cómo se corrigió (en la 4A).
3. Cómo verificar manualmente, con URLs.
4. Decisiones tomadas y dudas para mí.
5. Resultado de `npm run verify`.
