# Auditoría y Mapeo - Admin del Portal de Empleo

## 1. Stack y Configuración
- **Next.js:** 16.3.6 (App Router).
- **Tailwind CSS:** v4.
- **shadcn/ui:** Inicializado correctamente (`components.json` presente, estilo `base-vega`, `cssVariables: true`).
- **Estructura de rutas:**
  - `src/app/(admin)/admin/page.tsx` (Panel Dashboard)
  - `src/app/(admin)/admin/ofertas/page.tsx` (Registro y ficha)
  - `src/app/(admin)/admin/postulantes/page.tsx`
- **Componentes:** Situados en `src/components/oficina/`. 

## 2. Modelo de Datos y Estados (Real vs Propuesto)
### Ofertas
- **Estados reales:** `pendiente`, `publicada`, `rechazada`, `cerrada`. (Coincide 100% con la Fase 2).
- **Cierre solicitado:** Es un flag booleano `cierre_solicitado` (o `cierreSolicitado` en DTO), no un estado independiente. La oferta sigue figurando como `publicada`.

### Postulaciones
- **Estados reales:** `postulado`, `preseleccionado`, `derivado`, `no_apto`.
- **Propuesta de Fase 2:** `postulada`, `preseleccionada`, `pre_entrevista`, `apta`, `no_apta`, `descartada`.
- **Análisis:** Hay una gran desconexión. No existe concepto de entrevista, resultado apto/no apto, ni estados descartados (o su equivalente actual es `derivado` / `no_apto`).

## 3. Autenticación y Arquitectura Actual
- Las rutas en `src/app/api/admin/...` validan rol usando `sinPermiso(usuario, "admin")`.
- El acceso está unificado bajo el rol único de `admin` en la tabla de `perfiles`.
- **Flujo de datos actual:** Los componentes (como `GestionOfertas.tsx`) son `Client Components` que delegan en hooks como `useOfertasOficina`. Estos hooks hacen fetching de todas las ofertas y la UI se encarga de filtrar y ordenar.
- Esto contradice tu requerimiento de Server Components con carga/filtrado/orden por URL (Server-Driven) y Server Actions/Route Handlers para la mutación, por lo que todo este flujo requerirá ser reescrito según tus reglas de `domain -> data -> ui`.

## 4. Dónde está mezclada la lógica (Ejemplos)
- En `src/components/oficina/GestionOfertas.tsx` hay funciones como `ordenar()` que determinan lógicas de prioridad de negocio ("las publicadas con cierre solicitado van primero", "pendientes por más antigua").
- Las transiciones válidas no están definidas en un modelo de dominio independiente, sino de manera implícita al pintar los botones en `AccionesOferta.tsx`.
- Manejo de UI de listados como tabs en el cliente en lugar de resolverse desde el servidor.

---

## 5. Preguntas Abiertas (Espero tus respuestas antes de la Fase 1)

1. **Cierres solicitados:** Como actualmente es una bandera booleana (`cierreSolicitado`) en lugar de un estado. ¿Te parece bien que agregue la cola separada "Cierres solicitados" en el sidebar como tarea pendiente, consumiendo ofertas publicadas que tengan el flag en true?
2. **Postulaciones y Pre-entrevistas:** La tabla actual de postulaciones no soporta los estados del flujo de entrevistas (pre-entrevista, apta, descartada). ¿Debería crear una migración de base de datos para alinear el esquema con la Fase 2, o adaptamos la UI del Admin para que use solo los estados actuales (`postulado`, `preseleccionado`, `derivado`, `no_apto`)?
3. **Roles de operadores:** Actualmente solo hay un rol `admin`. ¿Avanzamos usando este acceso general para todo el panel de la Oficina de Empleo?
4. **Auditoría de historial:** Registrar quién hizo cada cambio requerirá crear una tabla extra (`historial_estados`) mediante una migración. Lo dejaré en pausa para la Fase 8, ¿correcto?
5. **Notas internas:** Actualmente las entidades `postulantes` o `postulaciones` no contemplan campos para notas o comentarios del operador. ¿Creamos migración para sumarlos, o por ahora los omitimos de la vista de evaluación de la UI?
