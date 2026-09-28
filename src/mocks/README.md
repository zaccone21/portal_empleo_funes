# Backend simulado (temporal)

Todo lo de esta carpeta es **provisorio** (DT-003, D-026). Existe porque la base de datos todavía no está modelada, y sin ella las pantallas de ofertas, postulaciones y CV no tendrían datos.

- `datos-ejemplo.ts`: ofertas ficticias, marcadas "(ejemplo)".
- `almacen.ts`: guarda en memoria las postulaciones y el CV que se cargan mientras corre `npm run dev`. Se borra al reiniciar el servidor. Simula siempre un postulante con sesión iniciada.
- `respuestas.ts`: hace que las rutas simuladas respondan 404 en producción.

Las rutas que lo usan son `src/app/api/ofertas`, `src/app/api/postulaciones` y `src/app/api/cv`.

**Cómo se saca:** cuando exista el backend real, reemplazar el cuerpo de esas rutas por Route Handler → caso de uso → DAL (D-018), respetando el contrato de D-024 y D-026, y borrar esta carpeta.
