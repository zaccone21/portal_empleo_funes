# Deuda técnica

Registro de la deuda técnica del proyecto (`AGENTS.md` §14): qué es, por qué quedó así y cómo se salda.

### DT-001 — `requireRole` quedó en el DAL
Fecha: 2026-09-27 · Origen: D-018
Qué: `requireRole` (`src/lib/dal/auth.ts`) verifica la sesión y el rol dentro del DAL. Con D-018, la sesión la verifica el Route Handler, el rol lo verifica el caso de uso y el DAL no decide nada.
Por qué quedó: la función es anterior a D-018 y todavía no existe ningún caso de uso.
Cómo se salda: al escribir el primer caso de uso, pasar el chequeo de rol a `src/lib/use-cases/` (o quitar `requireRole` si deja de usarse, previa consulta), junto con sus tests.

### DT-002 — Campos provisorios de la oferta y la postulación
Fecha: 2026-09-28 · Origen: D-024
Qué: la oferta que ve el postulante tiene campos genéricos: título, descripción, requisitos, lugar, jornada y fecha de publicación (`src/lib/validation/ofertas.ts`). La postulación tiene id, fecha y la oferta (`src/lib/validation/postulaciones.ts`). No salen de un modelo de datos: la base todavía no está modelada.
Pregunta abierta: ¿el postulante ve el nombre de la empresa? Por ahora no se muestra, porque la Oficina es intermediaria obligatoria.
Por qué quedó: para avanzar con las pantallas P05, P06 y P07 sin esperar el modelo de la base.
Cómo se salda: al modelar `job_offers` y `applications`, reemplazar estos schemas por los campos reales, ajustar `TarjetaOferta`, `DatosOferta`, `DetalleOferta` y `ListaPostulaciones`, y actualizar los datos de ejemplo de los tests.

### DT-003 — Backend simulado para ofertas, postulaciones y CV
Fecha: 2026-09-28 · Origen: D-024, D-026
Qué:
- Las rutas `src/app/api/ofertas`, `src/app/api/postulaciones` y `src/app/api/cv` no usan casos de uso, DAL ni Supabase. Responden con datos ficticios (`src/mocks/datos-ejemplo.ts`) y guardan en la memoria del servidor de desarrollo (`src/mocks/almacen.ts`).
- Simulan un único postulante con sesión siempre iniciada, así que el caso "sin sesión" (401) no aparece en desarrollo.
- Del CV subido no se guarda el archivo, solo el nombre, el tamaño y la fecha.
- En producción responden 404 (`src/mocks/respuestas.ts`).
- El e2e `e2e/postulacion.spec.ts` corre contra este backend simulado.
- Queda `src/app/playground/ofertas/page.tsx`, la vista previa anterior, que ya no hace falta.
Por qué quedó: la base de datos todavía no está modelada, y el usuario pidió simular el backend para avanzar con el frontend.
Cómo se salda:
- Reemplazar el cuerpo de las tres rutas por Route Handler → caso de uso → DAL (D-018), con `getCurrentUser()` y 401 sin sesión, respetando los contratos de D-024 y D-026.
- Guardar el CV en el bucket privado bajo `{user_id}/` (RNF1).
- Agregar RLS y sus tests.
- Borrar `src/mocks/` y `src/app/playground/ofertas/page.tsx` (previa consulta).
- Adaptar el e2e para que use un postulante con sesión.

### DT-004 — Reglas provisorias del CV
Fecha: 2026-09-28 · Origen: D-026
Qué: el tamaño máximo del CV es 5 MB (`CV_TAMANO_MAXIMO_BYTES` en `src/lib/validation/cv.ts`), que es la propuesta de Q-005, todavía abierta. Subir un CV nuevo reemplaza al anterior, porque RF1.2.3 habla de 1 archivo por postulante. Solo se puede subir un PDF: crear el CV online (Q-004) no está.
Por qué quedó: para construir P04 sin esperar que se cierren Q-004 y Q-005.
Cómo se salda: cuando se decidan Q-004 y Q-005, ajustar la constante (y el límite del bucket) y confirmar si el anterior se borra o se conserva.
