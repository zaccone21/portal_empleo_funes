# Cómo probar el portal

Desde el 2026-09-29 el portal funciona con la base real: el proyecto de **testing** de Supabase que está en tu `.env.local` (D-035). **No hay más datos de ejemplo.** Lo que se crea en la web (cuentas, ofertas, postulaciones, CV) queda guardado en Supabase, y se puede ver en su panel.

## Cómo está armado (en simple)

```
Pantalla ──► hook (src/hooks) ──► /api/… (src/app/api) ──► caso de uso (src/lib/use-cases) ──► DAL (src/lib/dal) ──► Supabase
```

- **La pantalla** muestra y pide datos. Nunca habla con la base.
- **La ruta `/api/…`** revisa lo que llega y que haya sesión (si no, 401).
- **El caso de uso** decide: si el rol puede hacerlo, si la oferta es suya, si tiene CV… y arma lo que cada rol puede ver.
- **El DAL** es lo único que le pregunta y le guarda a Supabase.
- **Supabase** repite los permisos con RLS: aunque el código se equivoque, una empresa no puede leer postulantes.

## 1. Preparar Supabase (una sola vez)

Todo en el panel del proyecto de **testing** (supabase.com).

### 1.1 Aplicar la migración nueva
SQL Editor → New query → pegá todo `supabase/migrations/20260929130000_ofertas_visibles_para_postulados.sql` → Run. Tiene que decir "Success". Avisame y la anoto en `docs/migraciones.md`.

### 1.2 Configurar el acceso (Authentication)
1. **URL Configuration:**
   - Site URL: `http://localhost:3000`.
   - Redirect URLs: agregá `http://localhost:3000/**`. Cuando haya deploy en Vercel, sumá también esa dirección.
2. **Contraseña mínima:** 8 caracteres (D-020).
3. **Confirmar el email:** en el proyecto de testing ya está prendido, con el SMTP propio (Gmail) configurado el 2026-09-29. Si algún día hay que armarlo de nuevo: el servicio de email que trae Supabase solo manda a los miembros del equipo del proyecto, y como máximo 2 por hora. Hay dos caminos:
   - **Para probar ya (recomendado en testing):** apagá "Confirm email". Al registrarse, la persona entra directo a su inicio.
   - **Para que se parezca a producción:** dejalo prendido y configurá un SMTP propio (Authentication → Emails → SMTP). Sin eso, el registro responde "No pudimos enviarte el email…".
4. **Recomendado con emails reales:** para que el link del email funcione en cualquier dispositivo (por ejemplo, registrarse en la computadora y abrir el email en el celular, DT-011), en Authentication → Emails:
   - plantilla "Confirm signup": cambiá el link por `{{ .SiteURL }}/acceso/confirmar?token_hash={{ .TokenHash }}&type=email`;
   - plantilla "Reset password": cambiá el link por `{{ .SiteURL }}/acceso/confirmar?token_hash={{ .TokenHash }}&type=recovery`.

### 1.3 Crear las tres cuentas de prueba
Authentication → Users → **Add user → Create new user**. Poné email y contraseña, y tildá **Auto Confirm User**. Los emails pueden ser inventados, porque no se manda nada; por ejemplo `postulante@ejemplo.com`, `empresa@ejemplo.com` y `oficina@ejemplo.com`.

Toda cuenta creada desde el panel nace como **postulante**. Para las otras dos, corré esto en el SQL Editor, cambiando los emails por los que usaste. Son datos, no estructura, así que no es una migración:

```sql
-- Cuenta de empresa
update public.perfiles set rol = 'empresa' where email = 'empresa@ejemplo.com';
delete from public.postulantes where id = (select id from public.perfiles where email = 'empresa@ejemplo.com');
insert into public.empresas (id) select id from public.perfiles where email = 'empresa@ejemplo.com';

-- Cuenta de la Oficina de Empleo (RF1.1.4: no tiene registro)
update public.perfiles set rol = 'admin' where email = 'oficina@ejemplo.com';
delete from public.postulantes where id = (select id from public.perfiles where email = 'oficina@ejemplo.com');
```

Con "Confirm email" apagado, la empresa y el postulante también se pueden crear desde la web (`/empresa/registrarse`, `/postulante/registrarse`). La Oficina siempre se crea a mano.

### 1.4 Para los tests automáticos (opcional)
Agregá a tu `.env.local` las credenciales de esas tres cuentas. Los nombres están en `.env.example`:

```
E2E_POSTULANTE_EMAIL=…   E2E_POSTULANTE_PASSWORD=…
E2E_EMPRESA_EMAIL=…      E2E_EMPRESA_PASSWORD=…
E2E_OFICINA_EMAIL=…      E2E_OFICINA_PASSWORD=…
```

## 2. Probar como alguien que entra hoy

Abrí `npm run dev` → `http://localhost:3000`. La portada es `/` (`/inicio` también lleva ahí). Con la base recién creada no hay ofertas publicadas, así que la portada y `/ofertas` aparecen vacías hasta el paso "La Oficina publica".

### Rama empresa: hasta que la oferta se publica
1. En `/`, el bloque para empresas → **Registrar mi empresa** (`/empresa/registrarse`), o **Ingresar** con la cuenta de empresa (`/empresa/ingresar`).
2. Entrás al inicio de la empresa (`/empresa`). Te recuerda completar los datos.
3. **Empresa** (`/empresa/perfil`): cargá razón social, CUIT (tiene que ser válido, por ejemplo `30-71234567-1`) y el contacto → Guardar.
4. **Publicar** (`/empresa/ofertas/nueva`): completá la oferta (1 a 3 rubros; el sueldo es opcional) → Enviar oferta.
5. **Mis ofertas** (`/empresa/ofertas`): la oferta aparece **Pendiente**.
6. Salí (botón **Salir**).

### La Oficina publica
1. `/admin/ingresar` con la cuenta de la Oficina → Panel (`/admin`): "1 oferta para revisar".
2. Tocalo → `/admin/ofertas?estado=pendiente` → abrí la oferta → **Publicar** y confirmá.
3. La oferta pasa a Publicadas y **ya aparece en `/` y en `/ofertas`**.
4. Para ver el rechazo: con otra oferta pendiente, **Rechazar** con un motivo. La empresa lo ve en "Mis ofertas".

### Rama postulante: hasta que se postula
1. En `/` o en `/ofertas`, abrí la oferta publicada → **Postularme**.
2. Sin sesión te ofrece **Ingresar** o **Crear cuenta**. Las dos vuelven a la oferta después.
3. Si no subiste CV, te lo pide → **Subir mi CV** (`/postulante/cv`). Subí un PDF de hasta 5 MB y volvé a la oferta.
4. **Postularme** → "Te postulaste a esta oferta".
5. **Postulaciones** (`/postulante/postulaciones`): aparece la oferta con la fecha, sin estado (RF1.2.4).

### La Oficina ve a quien se postuló
`/admin/ofertas?estado=publicada` → la oferta → **Postulantes**:
- el email de la persona;
- **Ver CV**: se abre el PDF con un link que vence en un minuto;
- el estado (Postulado, Pre-seleccionado, Derivado, No apto).

### Dónde verlo en Supabase
- Table Editor: `ofertas`, `oferta_rubros`, `postulaciones`, `postulantes` (el CV en las columnas `cv_*`), `empresas`, `perfiles`.
- Storage → bucket `cvs`: una carpeta por postulante con su `cv.pdf`.

## 3. Tests automáticos

| Comando | Qué prueba | Qué necesita |
|---|---|---|
| `npm run test` | Reglas y permisos de cada caso de uso, validaciones y componentes. No toca Supabase | Nada |
| `npm run verify` | Tipos, lint, `npm run test` y el build | Nada |
| `npm run test:e2e` | Los flujos en un navegador real (celular y escritorio), **sobre la base de testing** | Las variables `E2E_*` (1.4) y cerrar el `npm run dev` que esté corriendo (Playwright levanta el suyo) |

Los e2e crean ofertas "… (e2e)" y al terminar las sacan del catálogo, rechazándolas o cerrándolas (DT-010). También pisan el CV del postulante de prueba y los datos de la empresa de prueba.

## 4. Si algo no anda

| Qué pasa | Por qué | Qué hacer |
|---|---|---|
| "No pudimos enviarte el email…" al registrarse o recuperar la contraseña | El servicio de email de Supabase no atiende esa dirección, o se pasó el límite por hora | Apagar "Confirm email" en testing, o configurar SMTP (1.2) |
| "Todavía no activaste tu cuenta…" | La cuenta existe pero no abrió el link | Abrir el link del email, o tildar la cuenta como confirmada en Authentication → Users |
| "Email o contraseña incorrectos" con la cuenta de prueba | Email o contraseña distintos a los del panel | Revisar en Authentication → Users |
| La empresa entra y ve la pantalla del postulante | La cuenta sigue con rol `postulante` | Correr el SQL de 1.3 |
| La oferta no aparece en `/ofertas` | Está pendiente: la Oficina todavía no la publicó | Publicarla desde `/admin/ofertas` |
| El link del email lleva al ingreso sin activar | Se abrió en otro navegador o dispositivo (DT-011) | Abrirlo en el mismo navegador, o cambiar las plantillas (1.2.4) |
| Error 500 en "Mis postulaciones" después de que la Oficina cierra una oferta | Falta la migración de 1.1 | Aplicarla |
| `npm run test:e2e`: "Faltan E2E_…" | No están las variables | Paso 1.4 |
| `npm run test:e2e`: "Another next dev server is already running" | Hay un `npm run dev` abierto | Cerrarlo y volver a correr |
