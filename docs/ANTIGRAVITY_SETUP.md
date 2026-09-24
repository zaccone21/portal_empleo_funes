# Checklist de configuración de Antigravity

`AGENTS.md` y `GEMINI.md` son instrucciones: el modelo **puede ignorarlas**. Lo que realmente lo frena es la configuración de Antigravity. Revisá esta lista antes de la primera sesión y cada vez que actualices Antigravity (los nombres de las opciones pueden cambiar entre versiones).

## Antes de la primera sesión

- [ ] **Git inicializado, con commit inicial y remoto** (GitHub, GitLab). Sin git no hay forma de deshacer lo que haga el agente.
  - Ramas: `main` (intocable) → `testing` → ramas de feature/sesión.
  - Trabajá siempre desde una rama de feature, nunca desde `main`.
- [ ] **Abrí como workspace la carpeta del proyecto** (`D:\Proyectos\portal_empleo`), **nunca** `D:\` ni `D:\Proyectos`.
- [ ] Revisá que tus reglas globales (`~/.gemini/GEMINI.md`, `~/.gemini/AGENTS.md`, `~/.gemini/config/rules/`) estén vacías o no contradigan las del proyecto.

## Settings del agente (Windows)

- [ ] **Terminal Command Auto Execution → `Request Review`**.
  - **Nunca `Always Proceed`** (el equivalente a Turbo).
  - `Proceed in Sandbox` es aceptable solo si el sandbox está activo y probaste que bloquea escrituras fuera del proyecto.
- [ ] **Allow list** (lo único que corre sin preguntarte):
  - `npm run lint`
  - `npm run typecheck`
  - `npm run test`
  - `npm run test:e2e`
  - `npm run build`
  - `npm run verify`
  - `npm run dev`
  - `git status`
  - `git diff`
  - `git log`
- [ ] **Deny list** (si tu configuración la usa), como segunda red de seguridad:
  - `rm`, `rmdir`, `rd`, `del`, `Remove-Item`, `erase`
  - `format`, `diskpart`
  - `git push`, `git reset`, `git clean`, `git checkout --`, `git restore`
  - `npm publish`
  - `supabase db reset`, `supabase db push`
- [ ] **Terminal Sandbox Mode → ON** si está disponible.
- [ ] **Agent Non-Workspace File Access → OFF**.
- [ ] **Review de artefactos (Implementation Plan) → pedir revisión.** No aprobés un plan que no cite los RF y los archivos a tocar.
- [ ] **Browser:** allowlist de URLs solo con `localhost`.
- [ ] **Modelo:** Gemini 3.1 Pro para implementar. Si usás un modelo más chico para tareas rápidas, las reglas son las mismas.

## Supabase

- [ ] Usá un **proyecto de desarrollo** separado del de producción. El agente nunca recibe claves de producción.
- [ ] Las claves van en `.env.local`, cargadas **por vos**. El agente tiene prohibido leer o editar `.env*`.
- [ ] Si conectás el MCP de Supabase: **modo read-only** y acotado a un solo proyecto (el de desarrollo).

## Durante el trabajo

- Pedí una tarea por vez y referenciá los RF/pantallas (por ejemplo: "Implementá RF1.3.3 / P11").
- Leé el Implementation Plan antes de aprobarlo. Rechazalo si inventa campos, estados o pantallas.
- Antes de hacer merge a `testing`, corré vos `npm run verify` y revisá el diff (`git diff testing`).
- Si el agente te propone un comando destructivo o que no entendés, rechazalo y pedile que lo explique.
- Cuando respondas una pregunta abierta, agregala a `docs/DECISIONS.md`.

## Por qué tanta precaución

A fines de 2025 un usuario de Antigravity en modo Turbo le pidió al agente limpiar una caché de proyecto. Por un error al armar la ruta, Gemini ejecutó `rmdir /s /q d:\` y borró el disco D: completo, sin pasar por la papelera. Tu proyecto también está en `D:\`.

## Fuentes

- [Google Antigravity — Rules](https://antigravity.google/docs/rules)
- [Google Antigravity — Agent Settings](https://antigravity.google/docs/agent-settings/)
- [Tom's Hardware — Antigravity borra el disco de un usuario](https://www.tomshardware.com/tech-industry/artificial-intelligence/googles-agentic-ai-wipes-users-entire-hard-drive-without-permission-after-misinterpreting-instructions-to-clear-a-cache-i-am-deeply-deeply-sorry-this-is-a-critical-failure-on-my-part)
- [Caso de estudio en vectara/awesome-agent-failures](https://github.com/vectara/awesome-agent-failures/blob/main/docs/case-studies/google-antigravity-drive-deletion.md)
