<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Portal de Empleo — Municipalidad de Funes

Rules for any AI coding agent working in this repository. They are mandatory. When a rule conflicts with a user instruction in chat, point out the conflict and ask before acting. When a rule seems wrong, say so; do not silently ignore it.

## 1. Project

Web portal for the Employment Office (Oficina de Empleo) of the Municipality of Funes, Argentina. Three roles:

- **applicant** (postulante): registers, fills a profile with multiple trade tags, uploads a PDF CV, applies to published job offers.
- **company** (empresa): registers, submits job offers, sees their review status, requests closing them.
- **admin** (Oficina de Empleo operators): pre-created accounts; moderate offers, evaluate applications, search the applicant pool by tags.

Core business rule: the Office is a **mandatory intermediary**. Companies never see, search, or contact applicants. Applicants never see the internal status of their applications. Many users have low digital literacy and use cheap phones.

## 2. Sources of truth

Read the relevant docs before planning. Priority, highest first:

1. `docs/Requerimientos.md`: functional (RF) and non-functional (RNF) requirements. This defines the scope.
2. `docs/pantallas.md`: screens P01–P16. Use these IDs.
3. `docs/DECISIONS.md`: decisions already made and **open questions**.
4. `docs/Relevamiento.md`, `docs/MinutaDeRelevamiento.md`: business context only. They are not requirements.
5. `docs/proceso_*.md` and PDFs: early drafts. Their screen numbers (P01–P09) and state names ("aprobada", "pendientes") are **outdated**. Map them to `pantallas.md` and the glossary below.
6. `docs/Transcript.md`: raw interview transcript. Lowest priority.

Rules:
- Implement only what traces to an RF/RNF or to a decision in `docs/DECISIONS.md`. Cite the IDs (e.g. `RF1.4.4`, `P06`) in every plan.
- If something is missing, ambiguous, contradictory, or listed as an open question: **stop and ask**. Do not guess. After the user answers, propose the entry for `docs/DECISIONS.md`.
- Out of MVP unless a decision says otherwise: notifications (email/WhatsApp), CIT referral after 3 rejections, 60-day follow-up, shortlist ("terna") export, institutional KPI reports, offer drafts (RF1.3.3 forbids drafts).

## 3. Language

- Talk to the user in **Spanish**. Commit messages are in **Spanish** too (see Git flow). Comments and test names stay in **English**.
- Domain identifiers in code (components, hooks, functions, types, files) are in **Spanish**, as in the reference README: `Oferta`, `useOferta`, `OfertaDetallePage`, `FormularioOferta`. Generic technical names stay in English (`handleSubmit`, `params`, `loading`, `error`). This is a guideline, not a strict rule: be consistent inside a feature and prefer the name that makes the function easy to find.
- All UI text in **Argentine Spanish** (voseo: "Ingresá", "Subí tu CV"). Use short sentences, plain words, and no jargon (RNF3).
- User-facing URL segments are in Spanish (`/ofertas`, `/mi-perfil`, `/empresa`, `/admin`).
- Use one name per concept. Do not mix synonyms for the same thing (for example `Oferta` and `Vacante`).

## 4. Glossary (canonical)

The names below are the ones already used by the DB schema and enums written so far (`profiles`, `user_role`). Whether the DB keeps English names is an open question; until it is decided, do not rename them. For code identifiers, see §3.

| Spanish (docs/UI) | Code / DB |
|---|---|
| Postulante | `applicant` |
| Empresa | `company` |
| Oficina de Empleo / Operadora / Admin | role `admin` |
| Oferta laboral | `job_offer` (table), `JobOffer` (type) |
| Postulación | `application` |
| Etiqueta / Rubro / Oficio | `tag` |
| CV (PDF) | `cv`, storage path `cv_path` |
| Motivo de rechazo | `rejection_reason` |
| Solicitud de cierre | `close_requested` (boolean) |
| Perfil de usuario (rol) | `profile` |

- Roles: `applicant | company | admin`.
- Job offer status: `pending | published | rejected | closed` → UI: Pendiente, Publicada, Rechazada, Cerrada.
- Application status: `applied | preselected | referred | not_suitable` → UI: Postulado, Pre-seleccionado, Derivado, No apto.
- Tables are plural snake_case (`job_offers`, `applications`, `applicant_tags`). Columns are snake_case. TS types are PascalCase. Variables and functions are camelCase.

## 5. Stack and version traps

The installed versions are the only truth. Check `package.json` and the bundled docs, not your memory.

- **Next.js 16.3, App Router only.** Before using any Next API, read the matching file under `node_modules/next/dist/docs/01-app/` and name it in your plan. Traps:
  - Request interception is `proxy.ts`, **not** `middleware.ts`.
  - `params`, `searchParams`, `cookies()` and `headers()` are async. Await them.
  - No Pages Router, `getServerSideProps`, `getStaticProps`, `next/router` or `next/head`.
  - Forms send their data with `fetch` to a Route Handler under `/api/...` and navigate afterwards with `useRouter` from `next/navigation` (reference README). Server Actions are not the default; use one only if the user asks for it.
- **React 19.2**, TypeScript `strict`.
- **Tailwind CSS v4**, CSS-first. Theme tokens live in `src/app/globals.css`. There is no `tailwind.config.js`; do not create one.
- **shadcn/ui, style `base-vega`, built on `@base-ui/react` — NOT Radix.**
  - There is no `asChild`. Base UI composes with the `render` prop (e.g. `render={<Button />}`).
  - Before using a component, open its file in `components/ui/` and use only the props it actually exposes.
  - `cn` is imported from the `cn` package (via `@/lib/utils` in app code).
- **Supabase**: Postgres + Auth + Storage, used through `@supabase/ssr` and `@supabase/supabase-js`. Installed; see §13 for what exists. Deployment target is **Vercel**.
- **Validation**: Zod 4 (`zod`). **Tests**: Vitest 5 + Testing Library (unit), Playwright (e2e). **Package manager**: npm only.

## 6. Architecture

```
src/app/                     routes (Server Components by default)
src/app/api/<resource>/route.ts   Route Handlers (GET/POST/PATCH/DELETE): thin (validate with Zod → get the session user → call one use case → map its result to JSON + HTTP status)
src/proxy.ts                 request interception (session refresh); logic in lib/supabase/proxy.ts
src/components/ui/           shadcn-generated primitives, customized by the user (do not hand-write here)
src/hooks/                   client hooks named useNombre.ts that fetch /api/... and expose { data, loading, error } (use-mobile.ts comes from shadcn and keeps its name)
src/components/<feature>/    feature components (e.g. components/job-offers/)
src/lib/use-cases/           use cases (D-018): 'server-only', one function per user action, one file per feature (e.g. postulaciones.ts); business rules + authorization, no HTTP, no Supabase
src/lib/dal/                 Data Access Layer: 'server-only', the only code that uses the Supabase client (DB, Auth, Storage); fetches and saves, never decides
src/lib/validation/          Zod schemas shared by forms and Route Handlers
src/lib/supabase/            server.ts, client.ts, admin.ts (admin = secret key, server-only)
supabase/migrations/         versioned SQL migrations (schema + RLS policies)
supabase/tests/              pgTAP tests for RLS
docs/                        requirements, screens, decisions (never under public/)
e2e/                         Playwright specs
**/*.test.ts(x)              Vitest tests, next to the code they test
```

All app code lives under `src/`, and the `@/` alias maps to `src/`. Paths written without `src/` elsewhere in this file (for example `components/ui/` or `lib/dal/`) are relative to it.

- Server Components by default. Add `"use client"` only to the smallest interactive leaf that needs it.
- **Layers (D-018)**: hook → Route Handler → use case → DAL → Supabase. Each layer calls only the next one. Pages and Client Components never call use cases or the DAL; they use hooks that call `/api/...` (D-017).
  - **Route Handler**: validates the input with Zod, gets the user with `getCurrentUser()` (no user → 401), calls one use case, and maps its result to the HTTP status. No business rules. `getCurrentUser()` is the only DAL function it may call.
  - **Use case**: receives the current user and the validated input. It checks the role and the ownership of the resource, applies the business rules, and builds the DTO. It returns either the data or an expected error (`forbidden` → 403, `not_found` → 404, `conflict` → 409, `invalid` → 400) with a short Spanish message the UI can show; unexpected failures are thrown (→ 500). It never imports `next/*`, builds HTTP responses, or uses the Supabase client. Every Route Handler goes through a use case, even a simple one.
  - **DAL**: together with `lib/supabase/`, the only code that uses the Supabase client or reads `process.env`. It uses the session client from `lib/supabase/server.ts`, so RLS applies to every query. It selects only the columns the use case needs and returns typed objects, never Supabase response objects or raw errors. It fetches and saves; it never decides.
- The use case returns **DTOs** with only the fields the user's role may see. Never pass raw DB rows to Client Components or return them from a Route Handler.
- Route Handlers answer with the right HTTP status: 200 OK, 201 Created (POST), 204 No Content (DELETE), 400 invalid data, 401 no session, 403 no permission, 404 not found, 409 conflict, 500 unexpected error. Error bodies are `{ error: "message" }`.
- Error handling is temporary: hooks show the error message as it comes (`e.message`), as in the reference README. The user will define proper error handling later. Until then, do not put stack traces or raw database errors in the `error` field of a response.
- Generate DB types from Supabase. Do not hand-write row types.
- No generic repositories, factories, service classes, or "utils" dumping grounds. Use cases are plain functions: no classes, interfaces, or dependency injection. Add any other abstraction only when it has at least 2 real call sites (use cases are the exception, D-018).
- **Screen structure (D-021, replaces part of D-009)**: route group → screen → components.
  - A screen is its `page.tsx`: a Server Component that exports `metadata.title` and composes the view from components in `components/<feature>/`, with its own texts and links.
  - `src/app/` holds only routing files (`page.tsx`, `layout.tsx`, `route.ts`), never components.
  - A component that sends or loads data (for example a form) calls its hook from `hooks/` directly (D-017) and handles loading, error and success. Components that only display receive typed props (the DTO shape).
  - There is no container layer in between. Test components that use a hook by mocking the hook.
- **Preview data (D-009)**: a screen that shows data cannot be previewed in a real route before its API exists. For that case only, propose a preview in `app/playground/` (blocked in production) and let the user choose between it and building the backend first. Example data lives **only** in `app/playground/` and in tests, uses obviously fake values, and is never imported from `components/`, `lib/` or real routes.

## 7. Security (non-negotiable)

Read `node_modules/next/dist/docs/01-app/02-guides/data-security.md` and `authentication.md` before any auth or data work.

- **RLS** (RNF2): enable it on every table, in the same migration that creates the table, with explicit policies per role and operation. It is the second barrier: the database enforces the same ownership rules the use cases check, so a check missing in code does not leak data. Never disable RLS. Never write `using (true)` or `with check (true)` on writes. Never "temporarily" loosen a policy to make something work.
- **Keys**: the secret/service-role key is used only in `lib/supabase/admin.ts`, which starts with `import 'server-only'`. It bypasses RLS, so only DAL functions use it, and only when called by a use case that already verified the caller's role. Never put a secret in a `NEXT_PUBLIC_*` variable.
- **Authorization on the server, every time** (D-018): (1) the Route Handler checks there is a session user (401 otherwise); (2) the use case checks the role and (3) the ownership of the resource; RLS enforces the same rules again in the database. A Server Action, if the user asks for one, follows the Route Handler rules. `proxy.ts` only does optimistic redirects. It is never the only check. Hidden buttons are not security.
- **Role source**: read the role from the `profiles` table (or `app_metadata`), **never** from `user_metadata`, because users can edit it. Admin accounts are pre-created; there is no admin sign-up path (RF1.1.4).
- **Input**: validate every input on the server with Zod, even if the client already validated it. Never trust IDs sent by the client for ownership; derive the owner from the session.
- **CV files** (RNF1, RF1.2.3):
  - PDF only. Check MIME type **and** the `%PDF-` magic bytes, and enforce the size limit from `docs/DECISIONS.md`.
  - Store in a **private** bucket under `{user_id}/`. Applicants can manage only their own file.
  - Only admins get access, through short-lived signed URLs generated on the server. There are no public URLs.
- **Data exposure**:
  - Applicant DTOs never include application status (RF1.2.4).
  - Company DTOs never include applicant data.
  - Rejected offers show `rejection_reason` only to the owning company (RF1.3.5).
- **Personal data** (Argentine Law 25.326):
  - Collect the minimum.
  - Never log PII (names, emails, phone numbers, document numbers, CV content).
  - Use only fake data in seeds, fixtures, and tests.
  - Never send user data to external services.
- **Secrets**: never read, print, create, or edit `.env*` files, except `.env.example`, which holds names only. Never hardcode keys, tokens, or URLs with credentials. If you need a value, ask the user to set it.
- **Other**:
  - Auth errors are generic ("Email o contraseña incorrectos"). Never reveal whether an account exists.
  - No `dangerouslySetInnerHTML` with user content. No `eval` or `new Function`.
  - Do not build SQL strings from input. Use the Supabase client or parameterized RPC.

## 8. Filesystem, commands and git (Windows)

The machine runs Windows with PowerShell 5.1, and the project lives on `D:\`. A wrong path in a delete command can wipe the whole drive.

**Never**
- Run anything that deletes recursively or irreversibly: `rm -rf`, `rm -r`, `rmdir /s`, `rd /s`, `Remove-Item -Recurse`, `del /s`, `git clean`, `git reset --hard`, `git checkout -- .`, `git restore .`, `git push --force`.
- Touch any path outside the workspace root, including the user's home, `C:\`, the root of `D:\`, and global npm/npx caches.
- Delete `node_modules`, `.next`, or lockfiles to "fix" an error.
- Push, touch `main`, or merge into `main` or `testing`. The user does that.
- Commit `.env*` files, run `npm audit fix --force`, or disable git hooks (`--no-verify`).

**Ask first** (explain why, show the exact command)
- Installing, upgrading, or removing dependencies, including `npx shadcn add`.
- Any command against Supabase (migrations, `db push`, `db reset`, type generation against a remote project).
- `git add`, `commit`, `branch`, `switch`, `merge`, `stash`, `rebase`.
- Deleting any file. List the exact paths, one by one.
- Editing config: `package.json`, `package-lock.json`, `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `components.json`, `vitest.config.mts`, `playwright.config.ts`, `.gitignore`, `src/app/globals.css` theme tokens.

**Allowed without asking**
- Reading any file in the repo.
- Editing source files within the scope of the approved plan.
- `npm run lint | typecheck | test | test:e2e | build | verify | dev`.
- `git status | diff | log | branch --show-current`.

**Shell hygiene**
- PowerShell 5.1: no `&&` or `||`. Use `;` or `if ($?) { ... }`. Do not mix bash syntax.
- Quote every path. Never build a path from a variable without printing it first.
- If a dev server is already running (`.next/dev/lock`), reuse it. Do not start a duplicate.

**Git flow**
- `main` is untouchable. `testing` is the integration branch.
- New work goes on a branch named `feature/<task>` (reference README). Branches that already exist (`feat/*`, `fix/*`, `testing`) keep their names.
- Integration is by Pull Request, reviewed by a teammate. The agent never pushes, opens the merge, or merges; the user does.
- Commit only when asked, and ask for the user's OK before `git add`, `commit` or any branch operation. Messages follow `tipo: descripción` in Spanish, with the types `feat`, `fix`, `style`, `refactor`, `docs` (`feat: agrega formulario de postulación`). One logical change per commit.

## 9. Dependencies

- Never add a package without approval. In the request, include: why it is needed, why existing deps or the platform cannot do it, and the exact npm name, weekly downloads, last publish date, and license.
- Beware of hallucinated or look-alike package names. Verify the exact name on npm before proposing it.
- Prefer what is installed: Zod, Base UI/shadcn, lucide-react, recharts (through the shadcn `chart` component once added), native `fetch`, `Intl` for dates and numbers.
- Forbidden: other UI kits (Radix directly, MUI, Chakra, Mantine), axios, moment, lodash, ORMs (Prisma, Drizzle), state libraries (Redux, Zustand) unless a decision approves them.
- Never resolve peer conflicts with `--force` or `--legacy-peer-deps`. Report the conflict instead.

## 10. UI and accessibility

- Read `docs/DESIGN.md` before building a screen. It holds the visual defaults: palette tokens and contrast, typography, sizes, which component to use for what, form and copy rules, and an accessibility checklist.
- Design mobile-first (RNF3). Touch targets must be ≥ 44×44 px, and inputs use font size ≥ 16 px to avoid iOS zoom. Keep one primary action per screen and one-way flows.
- Target WCAG 2.2 AA:
  - Every input has a visible `<label>`; do not rely on placeholders as labels.
  - Show errors next to their field, in plain Spanish.
  - Use sufficient contrast and a visible focus ring.
  - Everything must be keyboard-accessible.
- Use theme tokens (`bg-primary`, `text-muted-foreground`, …). No hardcoded hex/oklch colors in components.
- Build screens from `components/ui/`. Components are added **on demand, one at a time, only when the current task needs them**: name the component, why this screen needs it, and ask before running `npx shadcn@4.21.0 add <name>` (use `--dry-run` first to show files and new deps). Never add components "for later". Never hand-write or copy a primitive.
- **`components/ui/` belongs to the user.** The user customizes these files by hand. Never run `shadcn add` with `--overwrite`, and never re-add or regenerate an existing component. Edit a primitive only when the task explicitly requires it, and show the diff. For a one-off variation, pass `className` or compose in `components/<feature>/` instead of changing the primitive.
- Dates are shown in Spanish (es-AR): pass the `es` locale from `date-fns/locale` to `calendar` and use `Intl.DateTimeFormat("es-AR")` for text.
- Offer details open next to the list on the same page, never in a modal (D-025, RF1.4.2): list + detail side by side on desktop, the detail in place of the list on phones, and the selection in the URL (`?oferta=<id>`). Use `dialog` only for short confirmations, not for long content or forms.
- Navigate between pages with `<Link>` from `next/link`, never with `<a href>` for internal routes. For navigation from code (for example after a form), use `useRouter` from `next/navigation`.
- Every async UI has loading, empty, and error states.

## 11. Workflow — no vibe coding

1. **Understand.** Restate the task in one or two sentences. List the RF/RNF/P IDs, the docs and existing files you read, and any open questions. If there are open questions, stop here.
2. **Plan.** List the files to create or modify, the approach, the tests to add, and the risks (security, data exposure, migrations). Wait for approval unless the change is trivial (typo, copy text, one-line fix).
3. **Implement in small steps.** Do one task at a time with the minimal diff. Do not refactor, rename, reformat, or "improve" code outside the task. Mention such opportunities at the end instead.
4. **Test.**
   - Validation, use cases (business rules and authorization), and DAL logic get Vitest tests. Use-case tests mock the DAL module: it is a dependency, not the unit under test.
   - Critical flows get Playwright specs: sign-up/login, apply to an offer, offer moderation, CV access.
   - Every new table gets tests proving that RLS denies cross-user access.
   - Write the failing test first when fixing a bug.
5. **Verify** — the Definition of Done. The task is done only when all of these hold:
   - `npm run verify` passes (typecheck + lint + unit tests + build). Paste the real tail of the output.
   - `npm run test:e2e` passes when the flow is covered by e2e.
   - UI changes were checked in the browser at mobile width (≈390 px) with no console errors.
   - Any decision taken was proposed for `docs/DECISIONS.md`.
6. **Report honestly.** Say what changed (files), what was verified and how, what was **not** verified, and what is pending. If something failed, say so and show the error.

If the same fix fails twice, stop. Explain what you tried, your hypotheses, and what information you need. Do not keep trying random variations.

## 12. Forbidden behaviors (known LLM failure modes)

- **Placeholders and fakes**: `// ... rest of the code`, `// TODO: implement`, empty stubs, mock or hardcoded data in production code, functions that return fixed values to look finished.
- **Destructive edits**:
  - Rewriting a whole file for a small change.
  - Deleting code, comments, or tests you did not write or do not understand.
  - Reverting the user's manual changes.
  - The user also writes code in this repo, especially UI. Treat it as intentional: build on it, do not restyle or restructure it. If it breaks a rule in this file, point it out and propose a fix; do not silently rewrite it.
- **Silencing errors**:
  - The escape hatches `any`, `as unknown as X`, `@ts-ignore`, `@ts-expect-error`, `eslint-disable`, and the non-null `!` used to quiet the compiler.
  - `catch {}`, `catch → return null`, or logging and continuing as if nothing happened.
  - Handle the error or let it surface.
- **Gaming tests**:
  - Deleting, skipping (`.skip`, `.todo`), or focusing (`.only`) tests.
  - Changing assertions to match wrong behavior.
  - Mocking the unit under test, or special-casing test inputs in production code.
- **Inventing things**: APIs, props, config options, CLI flags, package names, environment variables, or DB columns you have not verified in the installed code, the bundled docs, or the migrations.
- **Outdated patterns**: `middleware.ts`, Pages Router APIs, Radix `asChild`, `tailwind.config.js`, `useFormState`, sync `cookies()`/`params`.
- **Scope creep**: features, fields, screens, roles, or states that are not in the requirements. This includes "nice to have" extras, i18n, analytics, and dark-mode toggles.
- **Over-engineering**: abstractions for a single use (use cases are the exception, D-018), config-driven "flexible" systems, custom hooks wrapping one call, premature optimization.
- **Noise**:
  - Comments that narrate the obvious. Comment only the *why* of non-obvious decisions.
  - Emojis in code, commits, or UI.
  - Leftover `console.log`, commented-out code, AI preambles in files.
- **False claims**: saying "tested", "verified", "works", "production-ready", or "secure" without having run the commands that prove it in this session.

## 13. Current state

- The Next.js 16 app lives under `src/`: the home page (P01, D-029) is `src/app/page.tsx` with its components in `components/inicio/`; `/landing` is a page in progress by the user (do not touch it); `lang="es-AR"`. Municipal palette and fonts (Be Vietnam Pro + Sora) are set (D-019, `docs/DESIGN.md`). `Button` and `Input` were resized to 44 px touch targets (D-021). Visual direction "Mosaico de oficios" (D-022, `docs/DESIGN.md` §0): brand tokens `brand-deep/leaf/mint/sun`, brand components in `components/marca/`. Every new screen follows it; a plain default-looking screen is not done. **Every design decision is recorded in `docs/DESIGN.md`**: the rule in its section and a dated line in §11.
- shadcn/ui is configured (`components.json`, theme tokens in `src/app/globals.css`). Installed in `components/ui/`: accordion, alert, alert-dialog, avatar, badge, breadcrumb, button, calendar, card, chart, checkbox, dialog, dropdown-menu, empty, field, input, label, navigation-menu, pagination, popover, radio-group, select, separator, sheet, sidebar, skeleton, sonner, spinner, switch, table, tabs, textarea, tooltip. Read the file before using any of them. Anything else is added on demand (see §10). The `Toaster` (sonner) is mounted in the root layout (light theme, top center).
- Testing works: `npm run test` (Vitest) and `npm run test:e2e` (Playwright, mobile + desktop, port 3100). `npm run verify` is green. Every request goes through `proxy.ts`, which needs `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: without a `.env.local` (or those variables in the shell), `npm run dev` and `npm run test:e2e` answer 500.
- `.env.example` lists the Supabase variable names. The user creates `.env.local`.
- **Supabase, done**: packages installed, clients in `lib/supabase/` (`server`, `client`, `admin`, `proxy`, `env`), `proxy.ts` refreshing the session, `lib/dal/auth.ts` (`getCurrentUser`, `requireRole`) with unit tests, and the migration `supabase/migrations/20260924120000_create_profiles.sql` (table `profiles`, RLS, trigger) with pgTAP tests in `supabase/tests/`.
- **Supabase, pending**: the migration is **not applied** anywhere and the pgTAP tests were never run (the Supabase CLI is not installed). DB types are not generated. The DB naming (English vs Spanish) is open, see Q-015. No Route Handlers or use cases exist yet.
- **Access flow, frontend done (D-020, D-021)**: the screens are `src/app/(acceso)/{postulante,empresa}/{ingresar,registrarse,recuperar-contrasena}/page.tsx`, `admin/ingresar` and `nueva-contrasena`. Their components (forms that send with their hook, fields, card, links) are in `components/auth/`, the Zod schemas in `lib/validation/auth.ts`, the hooks are `useIngreso`, `useRegistro`, `useRecuperarContrasena` and `useNuevaContrasena`, and the fetch helper is `lib/http.ts`. The `/api/auth/*` endpoints are simulated (D-028, DT-003). The frame and slogans come from `MarcoAcceso` (group layout) and `PanelAcceso` (one layout per portal).
- **Applicant area, frontend done (D-023 to D-026)**:
  - Screens in `src/app/(postulante)/`: `/ofertas` (P05 list + P06 detail on the same page), `/postulante/postulaciones` (P07) and `/postulante/cv` (P04).
  - Components are in `components/ofertas/`, `components/postulaciones/` and `components/cv/`. The hooks are `useOfertasPublicadas`, `usePostularme`, `useMisPostulaciones` and `useMiCv`.
  - The APIs `/api/ofertas`, `/api/postulaciones` and `/api/cv` are **simulated** (DT-003, D-026): fake data and in-memory state from `src/mocks/`, 404 in production. `e2e/postulacion.spec.ts` runs against them.
  - Offer fields (DT-002) and CV rules (DT-004) are provisional.
  - `src/app/playground/ofertas/page.tsx` is obsolete and pending deletion.
  - `/ofertas` is a catalog (D-029): search, trade filter and order live in the URL (`q`, `rubro`, `orden`, `oferta`); the logic is in `lib/catalogo.ts` and the controls in `FiltrosOfertas`. Trades are a provisional list in `lib/validation/rubros.ts` (DT-002, Q-006).
- **Company area, frontend done (D-027)**:
  - Screens in `src/app/(empresa)/empresa/`: home (P09), `perfil` (P10), `ofertas/nueva` (P11) and `ofertas` (P12, list + detail).
  - Components are in `components/empresa/`. Shared structure pieces are in `components/marca/` (`ListaConDetalle`, `PanelDetalle`, `TarjetaSeleccionable`); `CampoTexto` is in `components/formularios/`.
  - The hooks are `usePerfilEmpresa`, `useOfertasEmpresa`, `useCrearOferta` and `useSolicitarCierre`. The APIs under `/api/empresa/` are simulated (DT-003). The company data and the P09 summary are provisional (DT-005).
  - `e2e/empresa.spec.ts` runs against the simulated API.
- **Session and navigation, frontend done (D-028)**:
  - Each area layout wraps its screens in `ProveedorSesion`; read the session with `useSesion` (only for what the screen shows, never for permissions).
  - Top bar: `EncabezadoPortal`. Phone bottom bar: `BarraInferior`. The menu items live in `components/marca/itemsNavegacion.ts`. Private screens show `PedirIngreso` on 401/403.
  - Login is **simulated** (`src/mocks/sesion.ts`, cookie `portal_sesion_simulada`). The test users are `postulante@ejemplo.com`, `empresa@ejemplo.com` and `oficina@ejemplo.com`, with any password. `/api/auth/*` follows D-020 plus `sesion` and `salida`.
  - e2e specs log in through `e2e/ayudas.ts`.
- **Employment Office, frontend done (D-030)**:
  - Screens in `src/app/(admin)/admin/`: panel (P14) and `ofertas` (P15, status tabs `?estado=` + list and detail).
  - Components are in `components/oficina/`, the hooks in `hooks/useOficina.ts`, the schemas in `lib/validation/oficina.ts`.
  - The APIs under `/api/admin/` are simulated (DT-003). The panel indicators and the applicant data are provisional (DT-006, Q-012, Q-009). P16 is blocked (Q-006, Q-007, Q-009).
  - `e2e/oficina.spec.ts` runs against the simulated API.
- **Simulated store**: all simulated routes share one in-memory store (`src/mocks/almacen.ts`), so the whole cycle works across the three roles. Restart `npm run dev` to reset it.
- **Frontend plan by screen and role**: `docs/plan_frontend.md`. Keep it updated when a screen changes state.
- **Architecture (D-018)**: the layers are documented but `lib/use-cases/` does not exist yet. `requireRole` in `lib/dal/auth.ts` predates D-018 and does not fit it (see DT-001 in `docs/deuda_tecnica.md`); resolve it when writing the first use case.
- Next step:
  1. Once Q-015 is decided, adjust the migration names if needed and apply the migration to the development project (ask first).
  2. Implement `/api/auth/*` behind the D-020 contract (Route Handler → use case → DAL).
  3. Add the route that receives the email link (confirmation and recovery), which redirects to `/nueva-contrasena` in the recovery case.
  4. In Supabase Auth, turn on email confirmation and set the minimum password length to 8.
  5. Frontend: follow `docs/plan_frontend.md`. Phases 1 to 5 are done with simulated data. What is left is blocked by open questions (P03: Q-006, Q-009; P16: Q-006, Q-007, Q-009; indicators: Q-012) or is the real backend (phase 7).

## 14. deuda_tecnica.md
- Whenever a decision taken by the agent, even if the developer agreed on it, generates any sort of technical debt beacause of a poor developing estructure, a bad programming practice is applicated to the proyect, maybe for test or debugging, or any type of thing that wouldnt be on production code it has to be reported in the document ../docs/deuda_tecnica.md 