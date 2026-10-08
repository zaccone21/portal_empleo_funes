<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Portal de Empleo — Municipalidad de Funes

Rules for any AI coding agent working in this repository. They are mandatory. They continue in `.agents/rules/*.md` (sections 8, 10 and 13, which are versioned; plus the user's working preferences and the hand-off notes, which are local-only and may be missing in another clone), which are just as mandatory: Antigravity loads them by itself, and `CLAUDE.md` imports them for Claude Code. When a rule conflicts with a user instruction in chat, point out the conflict and ask before acting. When a rule seems wrong, say so; do not silently ignore it.

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
5. `docs/proceso_*.md` and PDFs: early drafts, **local-only** (in `.gitignore`, DT-012; they may be missing in another clone). Their screen numbers (P01–P09) and state names ("aprobada", "pendientes") are **outdated**. Map them to `pantallas.md` and the glossary below.
6. `docs/Transcript.md`: raw interview transcript, **local-only** (in `.gitignore`, DT-012). Lowest priority.

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

The DB names are in Spanish (D-031). The full data model is in `docs/modelo_datos.md` (D-032). The code, the DTOs and the URLs (`?estado=pendiente`) use the same Spanish values as the database. Only the first migration (`20260924120000_create_profiles.sql`) keeps the old English names, because applied migrations are never edited (D-033); a later migration renames them. For code identifiers, see §3.

| Spanish (docs/UI) | DB |
|---|---|
| Postulante | role `postulante`, table `postulantes` |
| Empresa | role `empresa`, table `empresas` |
| Oficina de Empleo / Operadora / Admin | role `admin` |
| Oferta laboral | table `ofertas` (type `Oferta…` in code) |
| Postulación | table `postulaciones` |
| Etiqueta / Rubro / Oficio | table `rubros`; links `postulante_rubros`, `oferta_rubros` |
| CV (PDF) | columns `cv_ruta`, `cv_nombre`, `cv_tamano_bytes`, `cv_subido_el` in `postulantes`; private bucket `cvs` |
| Motivo de rechazo | `motivo_rechazo` |
| Solicitud de cierre | `cierre_solicitado` (boolean) |
| Perfil de usuario (rol) | table `perfiles` |

- Roles: `postulante | empresa | admin`.
- Job offer status: `pendiente | publicada | rechazada | cerrada` → UI: Pendiente, Publicada, Rechazada, Cerrada.
- Application status: `postulado | preseleccionado | derivado | no_apto` → UI: Postulado, Pre-seleccionado, Derivado, No apto.
- Application origin: `postulante | oficina`.
- Tables are plural snake_case (`ofertas`, `postulaciones`, `postulante_rubros`), without accents or ñ (`tamano_bytes`). Columns are snake_case; dates end in `_el` (`creada_el`). TS types are PascalCase. Variables and functions are camelCase.

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
- **Migrations (D-033)**: any change to the DB structure, however small, is a **new** timestamped file in `supabase/migrations/`. That includes tables, columns, constraints, indexes, policies, functions, triggers and fixed-list seeds. Never edit a migration once it was applied or committed; fix it with another migration. Add a row to `docs/migraciones.md` for every new migration, and record the date it was applied. The user applies migrations by hand in the Supabase **SQL Editor** (one whole file at a time, in order). The registry is therefore the only record of what is applied. Do not push the Supabase CLI on the user.
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

Moved to `.agents/rules/comandos-y-git.md` (Antigravity reads at most 24 KB per rules file). It is as mandatory as the rest of this file.

## 9. Dependencies

- Never add a package without approval. In the request, include: why it is needed, why existing deps or the platform cannot do it, and the exact npm name, weekly downloads, last publish date, and license.
- Beware of hallucinated or look-alike package names. Verify the exact name on npm before proposing it.
- Prefer what is installed: Zod, Base UI/shadcn, lucide-react, recharts (through the shadcn `chart` component once added), native `fetch`, `Intl` for dates and numbers.
- Forbidden: other UI kits (Radix directly, MUI, Chakra, Mantine), axios, moment, lodash, ORMs (Prisma, Drizzle), state libraries (Redux, Zustand) unless a decision approves them.
- Never resolve peer conflicts with `--force` or `--legacy-peer-deps`. Report the conflict instead.

## 10. UI and accessibility

Moved to `.agents/rules/ui-y-accesibilidad.md` (Antigravity reads at most 24 KB per rules file). It is as mandatory as the rest of this file. Es **obligatorio** consultar y seguir siempre la skill `shadcn` (oficial de shadcn/ui) cada vez que se modifique o se cree cualquier elemento de frontend.

### Design System Compliance

**Before creating, modifying, or substantially restructuring ANY UI, the agent MUST read and follow `DESIGN.md`.**

This is mandatory for:

* Pages and screens
* Layouts and sections
* Components
* Modals, dialogs, and drawers
* Forms and inputs
* Tables and lists
* Cards
* Navigation, headers, and sidebars
* Empty, loading, and error states
* Buttons and interactive controls
* Responsive layouts
* Any other user-facing visual element

`DESIGN.md` is the source of truth for the product's visual language and design patterns.

**Do not implement UI before consulting `DESIGN.md`.**

### Existing Patterns Before New Patterns

Before inventing a new visual treatment, the agent MUST:

1. Read `DESIGN.md`.
2. Inspect the existing implementation for similar screens or components.
3. Identify the closest existing design pattern.
4. Reuse existing components, tokens, spacing, typography, layouts, and interaction patterns whenever applicable.
5. Only introduce a new visual pattern when no existing pattern adequately satisfies the requirement.

Do not design every screen independently.

The application must feel like **one coherent product**, not a collection of independently generated pages.

### No Generic AI UI

Do not apply generic AI-generated UI conventions when they are not supported by `DESIGN.md` or the existing product.

In particular, do not arbitrarily introduce:

* Large solid-color backgrounds
* Low-contrast text
* Gray text on colored backgrounds when readability suffers
* Random accent colors
* Excessive gradients
* Excessive rounded containers
* Excessive cards
* Excessive pills or badges
* Arbitrary shadows
* Decorative elements without a clear UX purpose
* Generic dashboard layouts
* Visually disconnected sections
* Default-looking HTML/CSS layouts
* Unrelated visual styles between pages

Do not optimize for novelty.

**Consistency, hierarchy, readability, and usability take priority over visual novelty.**

### Color and Contrast

Never select foreground and background colors independently.

All text must remain clearly readable against its background.

Before considering a UI implementation complete, verify:

* Heading contrast
* Body text contrast
* Secondary text readability
* Button and interactive-state contrast
* Disabled-state clarity
* Focus-state visibility
* Color consistency with the design system

If `DESIGN.md` defines color tokens, use those tokens.

Do not invent arbitrary colors when an existing design token or pattern exists.

If a color combination looks visually weak or difficult to read, change it. Do not keep it merely because it technically renders.

### Visual Hierarchy

Every screen must have an intentional hierarchy.

The agent must consider:

* Primary vs secondary actions
* Heading hierarchy
* Content grouping
* Spacing and density
* Alignment
* Visual weight
* Information priority
* Interaction affordances

Do not make every element visually prominent.

Do not use large typography, saturated backgrounds, heavy borders, shadows, or oversized containers merely to make a screen appear "designed."

### Reuse Before Duplication

Prefer existing:

* Components
* shadcn primitives
* Design tokens
* Typography styles
* Spacing conventions
* Layout patterns
* Form patterns
* Feedback patterns
* Responsive patterns

over creating new one-off implementations.

If an existing component can be adapted without violating its established purpose, adapt it instead of creating a visually similar duplicate.

### Visual Verification

After implementing a significant UI change, the agent MUST inspect the resulting UI in the browser.

Source-code inspection alone is not sufficient for visual work.

Verify at minimum:

* Desktop presentation
* Mobile presentation at approximately 390px width
* Text/background contrast
* Visual hierarchy
* Spacing and alignment
* Component consistency
* Responsive behavior
* Console errors

If the rendered result does not visually match `DESIGN.md` or the surrounding application, fix it before considering the task complete.

### Design Drift

Do not gradually introduce new visual conventions through individual tasks.

If the existing design system does not define an appropriate pattern for a requested UI:

1. Inspect similar existing implementations.
2. Follow the closest established pattern.
3. If no suitable pattern exists, stop and ask before introducing a fundamentally new visual pattern.

Do not silently establish a new design language.

### UI Definition of Done

A UI task is NOT complete merely because the page renders or the functionality works.

Before reporting completion, confirm that:

* `DESIGN.md` was consulted.
* Existing patterns were inspected.
* Existing components were reused where appropriate.
* Design tokens were respected.
* Text/background contrast is acceptable.
* Typography follows the established hierarchy.
* Spacing and alignment are consistent.
* The screen visually belongs to the same product as the rest of the application.
* The UI was visually inspected in the browser.
* No generic or arbitrary visual treatment was introduced.


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

Moved to `.agents/rules/estado-del-proyecto.md` (Antigravity reads at most 24 KB per rules file). It is as mandatory as the rest of this file.

## 14. deuda_tecnica.md
- Whenever a decision taken by the agent, even if the developer agreed on it, generates any sort of technical debt beacause of a poor developing estructure, a bad programming practice is applicated to the proyect, maybe for test or debugging, or any type of thing that wouldnt be on production code it has to be reported in the document ../docs/deuda_tecnica.md 