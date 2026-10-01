# Portal de Empleo — Municipalidad de Funes

Portal web de la Oficina de Empleo (Secretaría de Desarrollo Productivo y Empleo) para conectar postulantes y empresas, con la Oficina como intermediaria obligatoria.

- **Postulantes:** perfil con múltiples rubros, CV en PDF, postulación a ofertas publicadas.
- **Empresas:** carga de ofertas, seguimiento de su estado y solicitud de cierre.
- **Oficina de Empleo:** moderación de ofertas, evaluación de postulaciones y búsqueda en el padrón.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · shadcn/ui (Base UI) · Supabase (Postgres, Auth, Storage con RLS) · Zod · Vitest · Playwright · Vercel.

## Requisitos

- Node.js 24+
- npm

## Primeros pasos

```bash
npm install
npx playwright install chromium   # solo la primera vez, para los tests e2e
cp .env.example .env.local        # completar con las claves del proyecto Supabase de desarrollo
npm run dev
```

## Scripts

| Script | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run typecheck` | Chequeo de tipos (`tsc --noEmit`) |
| `npm run lint` | ESLint |
| `npm run test` | Tests unitarios (Vitest) |
| `npm run test:e2e` | Tests end-to-end (Playwright, mobile + desktop) |
| `npm run verify` | typecheck + lint + test + build. Tiene que pasar antes de dar algo por terminado |

## Documentación

- `docs/Requerimientos.md`: requerimientos funcionales y no funcionales (definen el alcance).
- `docs/pantallas.md`: pantallas del MVP (P01–P16).
- `docs/DECISIONS.md`: decisiones tomadas y preguntas abiertas.
- `docs/Relevamiento.md`, `docs/MinutaDeRelevamiento.md`: contexto del proceso actual.

## Agentes de IA

- `AGENTS.md`: reglas obligatorias para cualquier agente (arquitectura, seguridad, flujo de trabajo).

## Flujo git

`main` (intocable) ← `testing` (integración) ← `feat/*` / `fix/*` / ramas de sesión. Commits con [Conventional Commits](https://www.conventionalcommits.org/).
