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

- Talk to the user in **Spanish**. Write code, identifiers, comments, commit messages, and test names in **English**.
- All UI text in **Argentine Spanish** (voseo: "Ingresá", "Subí tu CV"). Use short sentences, plain words, and no jargon (RNF3).
- User-facing URL segments are in Spanish (`/ofertas`, `/mi-perfil`, `/empresa`, `/admin`). Everything else is English.
- Use the glossary exactly. Never invent synonyms (no `vacancy`, `candidate`, `jobPost`, `employer`).

## 4. Glossary (canonical)

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
  - Forms use Server Actions with `useActionState`, not `useFormState`.
- **React 19.2**, TypeScript `strict`.
- **Tailwind CSS v4**, CSS-first. Theme tokens live in `app/globals.css`. There is no `tailwind.config.js`; do not create one.
- **shadcn/ui, style `base-vega`, built on `@base-ui/react` — NOT Radix.**
  - There is no `asChild`. Base UI composes with the `render` prop (e.g. `render={<Button />}`).
  - Before using a component, open its file in `components/ui/` and use only the props it actually exposes.
  - `cn` is imported from the `cn` package (via `@/lib/utils` in app code).
- **Supabase**: Postgres + Auth + Storage, used through `@supabase/ssr` and `@supabase/supabase-js`. Not installed yet; bootstrapping it is a planned task. Deployment target is **Vercel**.
- **Validation**: Zod 4 (`zod`). **Tests**: Vitest 5 + Testing Library (unit), Playwright (e2e). **Package manager**: npm only.

## 6. Architecture

```
app/                     routes (Server Components by default)
  <route>/actions.ts     Server Actions: thin (validate → call DAL → return typed result)
components/ui/           shadcn-generated primitives, customized by the user (do not hand-write here)
hooks/                   shared client hooks (use-mobile.ts comes from shadcn)
components/<feature>/    feature components (e.g. components/job-offers/)
lib/dal/                 Data Access Layer: 'server-only', all DB access + authorization, returns DTOs
lib/validation/          Zod schemas shared by forms and Server Actions
lib/supabase/            server.ts, client.ts, admin.ts (admin = secret key, server-only)
supabase/migrations/     versioned SQL migrations (schema + RLS policies)
e2e/                     Playwright specs
**/*.test.ts(x)          Vitest tests, next to the code they test
```

- Server Components by default. Add `"use client"` only to the smallest interactive leaf that needs it.
- Only `lib/dal/` and `lib/supabase/` talk to Supabase or read `process.env`. Pages, components, and actions call the DAL.
- The DAL returns **DTOs** with only the fields the caller needs. Never pass raw DB rows to Client Components.
- Server Actions return a typed result (`{ ok: true, data } | { ok: false, error }`) with user-safe Spanish messages. Never return stack traces or DB errors.
- Generate DB types from Supabase. Do not hand-write row types.
- No generic repositories, factories, service layers, or "utils" dumping grounds. Add an abstraction only when it has at least 2 real call sites.
- **Frontend-first split (D-009)**: feature components in `components/<feature>/` are presentational. They receive typed props (the future DTO shape) and never fetch data. Pages in `app/` fetch through the DAL and pass props down. Until the DAL exists, preview components only in `app/playground/`, which is blocked in production. Example data lives **only** in `app/playground/` and in tests, uses obviously fake values, and is never imported from `components/`, `lib/` or real routes.

## 7. Security (non-negotiable)

Read `node_modules/next/dist/docs/01-app/02-guides/data-security.md` and `authentication.md` before any auth or data work.

- **RLS** (RNF2): enable it on every table, in the same migration that creates the table, with explicit policies per role and operation. Never disable RLS. Never write `using (true)` or `with check (true)` on writes. Never "temporarily" loosen a policy to make something work.
- **Keys**: the secret/service-role key is used only in `lib/supabase/admin.ts`, which starts with `import 'server-only'`, and only after the caller's role was verified. Never put a secret in a `NEXT_PUBLIC_*` variable.
- **Authorization on the server, every time**: each Server Action, Route Handler, and DAL function checks (1) authenticated user, (2) role, (3) ownership of the resource. `proxy.ts` only does optimistic redirects. It is never the only check. Hidden buttons are not security.
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
- Editing config: `package.json`, `package-lock.json`, `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `components.json`, `vitest.config.mts`, `playwright.config.ts`, `.gitignore`, `app/globals.css` theme tokens.

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
- Work happens on `feat/<topic>`, `fix/<topic>` or session branches created from `testing`.
- Commit only when asked. Use Conventional Commits in English (`feat(job-offers): add close request action`), one logical change per commit.

## 9. Dependencies

- Never add a package without approval. In the request, include: why it is needed, why existing deps or the platform cannot do it, and the exact npm name, weekly downloads, last publish date, and license.
- Beware of hallucinated or look-alike package names. Verify the exact name on npm before proposing it.
- Prefer what is installed: Zod, Base UI/shadcn, lucide-react, recharts (through the shadcn `chart` component once added), native `fetch`, `Intl` for dates and numbers.
- Forbidden: other UI kits (Radix directly, MUI, Chakra, Mantine), axios, moment, lodash, ORMs (Prisma, Drizzle), state libraries (Redux, Zustand) unless a decision approves them.
- Never resolve peer conflicts with `--force` or `--legacy-peer-deps`. Report the conflict instead.

## 10. UI and accessibility

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
- Offer details open in a modal (shadcn `dialog`) without leaving the list (RF1.4.2).
- Every async UI has loading, empty, and error states.

## 11. Workflow — no vibe coding

1. **Understand.** Restate the task in one or two sentences. List the RF/RNF/P IDs, the docs and existing files you read, and any open questions. If there are open questions, stop here.
2. **Plan.** List the files to create or modify, the approach, the tests to add, and the risks (security, data exposure, migrations). Wait for approval unless the change is trivial (typo, copy text, one-line fix).
3. **Implement in small steps.** Do one task at a time with the minimal diff. Do not refactor, rename, reformat, or "improve" code outside the task. Mention such opportunities at the end instead.
4. **Test.**
   - Validation, DAL logic, and authorization rules get Vitest tests.
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
- **Over-engineering**: abstractions for a single use, config-driven "flexible" systems, custom hooks wrapping one call, premature optimization.
- **Noise**:
  - Comments that narrate the obvious. Comment only the *why* of non-obvious decisions.
  - Emojis in code, commits, or UI.
  - Leftover `console.log`, commented-out code, AI preambles in files.
- **False claims**: saying "tested", "verified", "works", "production-ready", or "secure" without having run the commands that prove it in this session.

## 13. Current state

- The Next.js 16 app is clean: placeholder home page, `lang="es-AR"`, Inter font.
- shadcn/ui is configured (`components.json`, theme tokens in `app/globals.css`). Installed in `components/ui/`: accordion, alert, alert-dialog, avatar, badge, breadcrumb, button, calendar, card, chart, checkbox, dialog, dropdown-menu, empty, field, input, label, navigation-menu, pagination, popover, radio-group, select, separator, sheet, sidebar, skeleton, sonner, spinner, switch, table, tabs, textarea, tooltip. Read the file before using any of them. Anything else is added on demand (see §10). The `Toaster` (sonner) is not mounted yet.
- Testing works: `npm run test` (Vitest) and `npm run test:e2e` (Playwright, mobile + desktop, port 3100). `npm run verify` is green.
- `.env.example` lists the Supabase variable names.
- **Not done yet**: Supabase is not installed (no clients, schema, auth, or storage). No feature screens exist.
- Suggested first task: Supabase bootstrap. Install the packages (ask first), add the `lib/supabase/*` clients, create the `profiles` table with the role and RLS policies, and add auth helpers in `lib/dal/`. This needs the user's development-project keys in `.env.local`, which the user sets, not the agent.
