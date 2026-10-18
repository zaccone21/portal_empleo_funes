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

<!-- Moved unchanged from AGENTS.md §10 on 2026-10-18 (AGENTS.md was over 24 KB). -->

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
