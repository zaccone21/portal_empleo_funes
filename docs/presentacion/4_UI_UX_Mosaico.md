# 🎨 UI / UX y "Mosaico de oficios"

El portal de la Municipalidad de Funes no utiliza un diseño genérico. El sistema de diseño fue creado a medida bajo la directriz **"Mosaico de oficios" (Decisión D-022)**, enfocado en inclusión digital y accesibilidad.

---

## 📱 1. Enfoque Mobile-First (RNF3)

El ciudadano promedio que busca trabajo en la plataforma accederá desde un celular, posiblemente de gama baja, y con conocimientos tecnológicos variables.

- **Tamaños Táctiles Estrictos:** Ningún botón (`Button`) ni campo de texto (`Input`) mide menos de **44px de alto**. Esta es la medida mínima recomendada por Apple/Google para que un pulgar no se equivoque al tocar.
- **Fuentes Anti-Zoom:** Todo input de texto utiliza un tamaño de fuente de **16px mínimo**. Si fuese más pequeño, los iPhones harían "zoom in" automático al escribir, rompiendo la pantalla.
- **Cero Modales Complejos:** Las ofertas de trabajo no se abren en ventanitas modales flotantes. El detalle se abre en la misma pantalla (con navegación real), permitiendo que el botón "Atrás" de Android siempre funcione correctamente (D-025).

---

## 🌿 2. Identidad Municipal (Colores y Fuentes)

La paleta sigue las pautas oficiales del Municipio de Funes, alejándose de los colores genéricos de plantillas web.

- **Verde Principal (Brand-Leaf):** `#3c8c4f` - Utilizado en botones primarios y acentos.
- **Verde Profundo (Brand-Deep):** `#04311a` - Utilizado para fondos de marca, dando autoridad.
- **Acento (Brand-Sun):** `#f2c230` - Un amarillo vibrante para destacar acciones clave. Jamás se usa para textos por problemas de contraste.
- **Gris Accesible:** `#262b35` para texto general, asegurando un contraste WCAG AA superior a 4.5:1.
- **Tipografía:** 
  - **Sora** para los Títulos (Fuerte, geométrica).
  - **Be Vietnam Pro** para textos de lectura largos (Altamente legible en pantallas chicas).

---

## 🧩 3. El "Mosaico de Oficios"

El concepto visual de la aplicación. En lugar de pantallas blancas aburridas, el sistema utiliza:
- Fondos texturados o superposiciones que simulan un "Mural de azulejos".
- Formas orgánicas con la "Firma Hoja": Tarjetas y contenedores con dos esquinas redondeadas en diagonal extrema, dándole un toque moderno pero amigable.
- Cero animaciones innecesarias: Un solo momento de carga sutil, respetando siempre la configuración "Reducir Movimiento" del sistema operativo del usuario.

---

## 🚏 4. Navegación por Menú Fijo (Bottom Bar)

Para la interfaz de celulares, eliminamos el clásico "Menú hamburguesa" oculto arriba a la derecha. 

- **Barra Inferior Fija:** Dependiendo de quién se logueó, abajo de todo en su celular siempre tendrá una barra con íconos grandes.
  - *Postulante:* Ofertas | Postulaciones | Mi CV
  - *Empresa:* Inicio | Mis Ofertas | **Publicar (Destacado en el centro)**
- **Reducción de Fatiga Cognitiva:** El botón primario ("Salir", "Postularme") siempre está visible. Si al postulante le falta subir su CV, en la parte superior del catálogo verá un aviso amistoso "Subí tu CV" que oficia de acceso directo.
