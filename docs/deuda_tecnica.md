# Deuda técnica

Registro de la deuda técnica del proyecto (`AGENTS.md` §14): qué es, por qué quedó así y cómo se salda.

### DT-001 — `requireRole` quedó en el DAL
Fecha: 2026-09-27 · Origen: D-018
Qué: `requireRole` (`src/lib/dal/auth.ts`) verifica la sesión y el rol dentro del DAL. Con D-018, la sesión la verifica el Route Handler, el rol lo verifica el caso de uso y el DAL no decide nada.
Por qué quedó: la función es anterior a D-018 y todavía no existe ningún caso de uso.
Cómo se salda: al escribir el primer caso de uso, pasar el chequeo de rol a `src/lib/use-cases/` (o quitar `requireRole` si deja de usarse, previa consulta), junto con sus tests.
