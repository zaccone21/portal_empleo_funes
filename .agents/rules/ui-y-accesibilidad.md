---
trigger: always_on
---

<!-- Section of AGENTS.md, moved here because Antigravity reads at most 24 KB per rules file. It is as mandatory as AGENTS.md. -->

## 10. UI and accessibility

- **Uso obligatorio de la skill `shadcn`**: Siempre que se modifique o se cree cualquier componente, formulario, vista o pantalla de frontend, es obligatorio consultar y aplicar las pautas de la skill oficial de `shadcn` (`skills/shadcn/SKILL.md` y sus reglas bajo `rules/`). En particular:
  - Principios de composición antes de escribir estilos o markup custom.
  - Estructura de formularios (`FieldGroup`, `Field`, `FieldLabel`, etc.) y atributos de validación (`data-invalid`, `aria-invalid`).
  - Base UI: uso estricto de la prop `render` (no `asChild`, ver `rules/base-vs-radix.md`).
  - Reglas de estilo: tokens semánticos, `size-*` en vez de `w-* h-*`, flex con `gap-*` en vez de `space-*`.
  - Iconos en botones con `data-icon` sin clases de tamaño manuales.
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
