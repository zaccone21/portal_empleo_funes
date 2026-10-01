---
trigger: always_on
---

<!-- Section of AGENTS.md, moved here because Antigravity reads at most 24 KB per rules file. It is as mandatory as AGENTS.md. -->

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
