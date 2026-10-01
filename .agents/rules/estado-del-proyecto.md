---
trigger: always_on
---

<!-- Section of AGENTS.md, moved here because Antigravity reads at most 24 KB per rules file. It is as mandatory as AGENTS.md. -->

## 13. Current state

- **Agent:** since 2026-09-29 the user works with Antigravity CLI (D-036). The rules are `AGENTS.md` plus `.agents/rules/*.md`; the user's preferences (`preferencias-del-usuario.md`) and the hand-off from Claude Code (`traspaso-desde-claude.md`) are there too, **local-only** (in `.gitignore`, DT-012). Add new lasting preferences to `preferencias-del-usuario.md`.

- The Next.js 16 app lives under `src/`: the home page (P01, D-029) is `src/app/page.tsx` with its components in `components/inicio/`; `/inicio` redirects to `/`; `lang="es-AR"`. Municipal palette and fonts (Be Vietnam Pro + Sora) are set (D-019, `docs/DESIGN.md`). `Button` and `Input` were resized to 44 px touch targets (D-021). Visual direction "Mosaico de oficios" (D-022, `docs/DESIGN.md` §0): brand tokens `brand-deep/leaf/mint/sun`, brand components in `components/marca/`. Every new screen follows it; a plain default-looking screen is not done. **Every design decision is recorded in `docs/DESIGN.md`**: the rule in its section and a dated line in §11.
- shadcn/ui is configured (`components.json`, theme tokens in `src/app/globals.css`). Installed in `components/ui/`: accordion, alert, alert-dialog, avatar, badge, breadcrumb, button, calendar, card, chart, checkbox, dialog, dropdown-menu, empty, field, input, label, navigation-menu, pagination, popover, radio-group, select, separator, sheet, sidebar, skeleton, sonner, spinner, switch, table, tabs, textarea, tooltip. Read the file before using any of them. Anything else is added on demand (see §10). The `Toaster` (sonner) is mounted in the root layout (light theme, top center).
- **Everything runs on the real database** (D-035): the Supabase **testing** project in `.env.local`. There is no simulated data: `src/mocks/` and the playground were deleted (DT-003, settled). How to set up and test by role: `docs/como_probar.md`.
- **Layers (D-018), in place:** the 20 Route Handlers in `src/app/api/` call one use case each (`src/lib/use-cases/`: `acceso`, `empresa`, `postulante`, `oficina`), which calls the DAL (`src/lib/dal/`: `auth`, `empresas`, `ofertas`, `postulaciones`, `cv`). Use cases return `Resultado` (`use-cases/resultado.ts`); routes turn it into HTTP with `src/lib/respuestas-api.ts`. The role check is `sinPermiso()`. The DTO builders for offers are in `use-cases/dto-ofertas.ts`.
- **Access (D-020, D-034):** Supabase Auth. `/acceso/confirmar` receives the email links. Registration answers `{ destino }` (null means "check your email"). Admin accounts are created in the Supabase dashboard and promoted with SQL (`docs/como_probar.md`). The testing project has email confirmation on and the user's own SMTP (Gmail) configured, so registration and recovery send real emails. The email templates still use the default `code` link, which only works in the same browser (DT-011).
- **Database:** model in `docs/modelo_datos.md` (D-031, D-032). The migrations are applied to the testing project by hand in the SQL Editor (D-033); `docs/migraciones.md` records which are applied, and `20260929130000` is pending. DB types are not generated: the DAL validates each row with Zod (DT-008). The trade list lives in the `rubros` table and in `lib/validation/rubros.ts` (DT-009). pgTAP tests in `supabase/tests/` need the Supabase CLI, which the user does not use.
- **Tests:** `npm run verify` (typecheck, lint, Vitest, build) is green. Use cases have unit tests with the DAL mocked. `npm run test:e2e` runs on the testing project with three test accounts from `.env.local` (`E2E_*`, names in `.env.example`; helpers in `e2e/ayudas.ts`). Each test creates its own offers and takes them out of the catalog afterwards (DT-010). Playwright starts its own dev server on port 3100, so close any running `npm run dev` first. Every request goes through `proxy.ts`, which needs the Supabase variables in `.env.local`.
- **Screens** (all connected to the real API):
  - Access: `src/app/(acceso)/`, components in `components/auth/`.
  - Applicant: `/ofertas` (P05 + P06), `/postulante/cv` (P04), `/postulante/postulaciones` (P07). Components in `components/ofertas/`, `cv/`, `postulaciones/`. The catalog filters live in the URL (`lib/catalogo.ts`).
  - Company: `src/app/(empresa)/empresa/` (P09-P12), components in `components/empresa/`. Offers have 1 to 3 trades and an optional pay (D-032).
  - Office: `src/app/(admin)/admin/` (P14, P15), components in `components/oficina/`, hooks in `hooks/useOficina.ts`. The panel indicators and the applicant data are provisional (DT-006, Q-012).
  - Session: each area layout uses `ProveedorSesion`/`useSesion` (display only, never permissions); menus in `components/marca/itemsNavegacion.ts`.
- **Frontend plan by screen and role**: `docs/plan_frontend.md`. Keep it updated when a screen changes state.
- Next step:
  1. The user: apply migration `20260929130000`, configure Supabase Auth and create the three test accounts (`docs/como_probar.md`, section 1), then walk both flows. Record the migration date in `docs/migraciones.md`.
  2. Download the DB types and pass `Database` to the Supabase clients (DT-008).
  3. Build P03 (applicant profile: name, surname, phone, DNI and trades, D-032) and later P16 (Office search); both use the provisional trade list (Q-006).
  4. Before production: email confirmation on with SMTP, email templates with `token_hash` (DT-011), and the open questions left in `docs/DECISIONS.md`.
