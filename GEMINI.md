# Antigravity / Gemini addendum

`AGENTS.md` is the complete, authoritative rulebook for this repository. Read it in full at the start of every conversation. This file only adds Antigravity-specific rules and never relaxes anything in `AGENTS.md`. If the two seem to conflict, apply the stricter rule and tell the user.

## Artifacts

- **Implementation Plan**: required before editing code, unless the change is trivial (typo, copy text, one-line fix). It must include the RF/RNF/P IDs, the docs you read (including the `node_modules/next/dist/docs/` files), the files to touch, the tests to add, and the risks. Then **wait for the user's review**. Do not start implementing in the same turn.
- **Task List**: keep it updated as you go. One task in progress at a time.
- **Walkthrough**: paste the real output of `npm run verify` (and `npm run test:e2e` when relevant). List what was not verified. Never summarize a command you did not run.

## Terminal

- Follow section 8 of `AGENTS.md` for every command, whatever the auto-execution setting is. Being able to run a command without a prompt is not permission to run it.
- Before any command that writes, deletes, or installs, state the exact command and the absolute path it affects.
- Never chain a destructive command after another with `;`.

## Browser agent

- Only open `http://localhost:*` pages of this project.
- Never sign in with real accounts or type real personal data. Use fake test users only.
- Do not execute arbitrary JavaScript in pages. Use the browser to observe and verify, not to change state outside the app under test.
- Check UI at mobile width (≈390 px) first, then desktop.

## Behavior

- Talk to the user in Spanish, and keep messages short and concrete.
- Do not apologize at length or promise to "be more careful". Fix the issue or state clearly what you need.
- When you are unsure whether something is in scope, it is not. Ask.
