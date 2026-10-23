# Portal de Empleo — Municipalidad de Funes

Portal web de la Oficina de Empleo de la Municipalidad de Funes para conectar a quienes buscan trabajo con las empresas de la ciudad. La Oficina es la **intermediaria obligatoria**: las empresas nunca buscan en el padrón; solo ven a las personas que la Oficina les deriva.

Proyecto final del Funes Tech Lab (Beex). Consigna: `docs/Beex_Funes_Tech_Lab_Proyecto_Final.md`.

## Qué hace cada rol

- **Postulante:** se registra, completa su perfil (datos, varios rubros y experiencia laboral), sube su CV en PDF y se postula a las ofertas publicadas. Ve a qué ofertas se postuló, sin el estado interno de la evaluación.
- **Empresa:** se registra, publica ofertas (la Oficina las revisa antes), sigue su estado, pide cerrarlas y las duplica para volver a buscar. En cada oferta ve **solo** a los candidatos que le derivó la Oficina (nombre, contacto, rubros y CV) e informa si los contrató; si no, con el motivo.
- **Oficina de Empleo (Municipalidad):** aprueba o rechaza ofertas, evalúa postulaciones con el CV a la vista, registra la preentrevista, deriva candidatos a la empresa, sigue las respuestas pendientes, consulta el historial de cada persona (con la cantidad de rechazos), la deriva a cursos de capacitación y busca en el padrón por varios rubros para asociarla a una oferta.

## El flujo completo

1. El postulante consulta una oferta y se postula.
2. Su perfil tiene uno o varios rubros.
3. La Oficina revisa la postulación y la preselecciona o la marca como no apta.
4. La Oficina registra la preentrevista (opcional) y deriva a la persona a la empresa.
5. La empresa ve solo a los candidatos derivados a sus ofertas.
6. La empresa informa "contraté" o "no contraté" con el motivo.
7. La Oficina ve el resultado y el historial de cada persona, con sus rechazos.
8. La Oficina registra una derivación a un curso.

## Tecnologías

| Parte | Qué se usa |
|---|---|
| Aplicación | Next.js 16 (App Router), React 19, TypeScript estricto |
| Interfaz | Tailwind CSS 4, shadcn/ui sobre Base UI, lucide-react, fuentes Be Vietnam Pro y Sora |
| Datos | Supabase: Postgres con Row Level Security, Auth (email y contraseña) y Storage privado para los CV |
| Validación | Zod 4, con los mismos esquemas en el formulario y en el servidor |
| Tests | Vitest + Testing Library (unitarios), Playwright (e2e), pgTAP (RLS) |
| Publicación | Vercel |

## Cómo está organizado

```
src/app/            rutas (pantallas y Route Handlers en /api)
src/components/     componentes por área (postulante, empresa, admin, …) y primitivos de shadcn en ui/
src/hooks/          hooks que llaman a /api/... (postulante y empresa)
src/lib/use-cases/  reglas de negocio y permisos, una función por acción
src/lib/dal/        acceso a Supabase (el único código que lo usa)
src/lib/validation/ esquemas Zod compartidos
supabase/           migraciones SQL (esquema + RLS) y tests pgTAP
docs/               requerimientos, pantallas, decisiones, modelo de datos y diseño
```

Cada pedido pasa por las mismas capas: **hook → Route Handler → caso de uso → DAL → Supabase**. Las pantallas de la Oficina leen en Server Components y deciden con Server Actions (D-049). Los permisos se controlan dos veces: en el caso de uso y en la base con RLS.

## Poner en marcha (desarrollo)

Requisitos: Node.js 24 o más y npm.

1. Instalar dependencias:

   ```bash
   npm install
   npx playwright install chromium   # solo la primera vez, para los tests e2e
   ```

2. Crear `.env.local` copiando `.env.example` y completar las variables con las claves del proyecto de Supabase (nunca se suben al repositorio):

   | Variable | Para qué |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto |
   | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Clave pública |
   | `SUPABASE_SECRET_KEY` | Clave secreta, solo en el servidor: la usa la empresa para ver a sus candidatos derivados (D-044) |
   | `E2E_*` | Cuentas de prueba para `npm run test:e2e` (opcional) |

3. Preparar la base: en el **SQL Editor** de Supabase, correr una por una y en orden las migraciones de `supabase/migrations/`. La lista, con qué cambia cada una, está en `docs/migraciones.md`.

4. Crear las cuentas: postulante y empresa se registran desde el portal. Las cuentas de la Oficina se crean en el panel de Supabase y se promueven con SQL; los pasos están en `docs/como_probar.md`.

5. Levantar el portal:

   ```bash
   npm run dev
   ```

   Entradas: `/` (inicio y ofertas), `/postulante/ingresar`, `/empresa/ingresar` y `/admin/ingresar`.

## Publicar en Vercel

1. Importar el repositorio en Vercel (framework Next.js, sin cambios en el build).
2. Cargar las mismas variables de `.env.local` (salvo las `E2E_*`) en **Settings → Environment Variables**.
3. En Supabase, **Authentication → URL Configuration**: poner la URL de Vercel como *Site URL* y agregar `https://<tu-dominio>/acceso/confirmar` en *Redirect URLs*, para que funcionen los emails de confirmación y de recuperación.

## Usuarios de demostración

Hay una cuenta de demostración por rol: postulante, empresa y Oficina de Empleo (Municipalidad), con datos inventados. Las contraseñas no están en el repositorio: se entregan junto con el link del portal, como pide la consigna (D-050).

## Scripts

| Script | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run typecheck` | Chequeo de tipos (`tsc --noEmit`) |
| `npm run lint` | ESLint |
| `npm run test` | Tests unitarios (Vitest) |
| `npm run test:e2e` | Tests end-to-end (Playwright, celular y escritorio) |
| `npm run verify` | typecheck + lint + test + build. Tiene que pasar antes de dar algo por terminado |

## Documentación

- `docs/Requerimientos.md`: requerimientos funcionales y no funcionales (definen el alcance).
- `docs/pantallas.md`: pantallas P01 a P19.
- `docs/plan_frontend.md`: estado de cada pantalla, por rol.
- `docs/DECISIONS.md`: decisiones tomadas y preguntas abiertas.
- `docs/modelo_datos.md` y `docs/migraciones.md`: tablas, permisos (RLS) y migraciones aplicadas.
- `docs/DESIGN.md`: guía visual y de accesibilidad.
- `docs/deuda_tecnica.md`: lo que quedó pendiente a propósito, y cómo se salda.
- `docs/como_probar.md`: cómo probar cada rol paso a paso.

## Agentes de IA

`AGENTS.md` y `.agents/rules/` tienen las reglas obligatorias para cualquier agente: arquitectura, seguridad y flujo de trabajo.

## Flujo git

`main` (intocable) ← `testing` (integración, por Pull Request) ← `feature/*`, `feat/*`, `fix/*`. Los mensajes de commit van en español con el formato `tipo: descripción` (`feat`, `fix`, `style`, `refactor`, `docs`).
