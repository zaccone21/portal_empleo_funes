# Pantallas MVP

*Actualizado el 2026-10-18: se suman P17 a P19 por la consigna final (D-043) y se anota dónde quedó cada pantalla. El estado de cada una está en `docs/plan_frontend.md`.*

## **Acceso Público**

- **P01. Landing Page** (`/`): Presentación del portal, opciones de registro/login separadas por rol (Postulante / Empresa / Institucional).
- **P20. Ayuda** *(nueva, 2026-10-20)* (`/ayuda`, `/ayuda?para=empresa`): Guía paso a paso y preguntas frecuentes para postulantes y empresas; la Oficina no tiene guía (D-057).

### **Postulante**

- **P02. Autenticación Postulante**: Login, Registro, Recuperar contraseña.
- **P03. Mi Perfil** (`/postulante/perfil`): Datos personales, contacto, rubros e información laboral (RF1.6.7). Incluye P04.
- P04. Cargar/Crear CV: integrada en P03 (`/postulante/perfil#cv`). Solo se sube un PDF (Q-004).
- **P05. Ofertas Laborales** *(P07)* (`/ofertas`): Listado de tarjetas con ofertas publicadas.
- **P06. Detalle Oferta** *(P08)*: Se abre al lado de la lista, en la misma página (D-025). Muestra info. completa y botón "Postularme".
- **P07. Mis Postulaciones** (`/postulante/postulaciones`): Historial para que el postulante vea a qué aplicó (sin estado interno).

## Empresa:

- **P08. Login Empresarial** *(P01)*: Acceso empresas.
- **P09. Dashboard Empresa** *(P02)* (`/empresa`): Resumen de bienvenida.
- **P10. Perfil de Empresa** (`/empresa/perfil`): Para editar CUIT, razón social, teléfonos de contacto.
- **P11. Crear Oferta** *(P03)* (`/empresa/ofertas/nueva`): Formulario de alta de vacante. También se abre precargado al duplicar una oferta (RF1.6.8).
- **P12. Mis Ofertas** *(P05)* (`/empresa/ofertas`): Grilla de ofertas con sus estados, botón para solicitar cierre y "Duplicar" en rechazadas y cerradas (D-048).
- **P17. Candidatos derivados** *(nueva, consigna)*: Los candidatos que la Oficina derivó a cada oferta de la empresa, con sus datos y CV, y la decisión "Contrata" / "No contrata" con motivo obligatorio (RF1.6.3, RF1.6.4, D-044).

### **Oficina de Empleo (Admin)**

La "Mesa de trabajo" (D-042) reparte estas pantallas en colas y registros bajo `/admin`.

- **P13. Login Admin** (`/admin/ingresar`): Acceso seguro para los operadores.
- **P14. Dashboard Admin** (`/admin`): Tareas pendientes e indicadores con datos reales (D-051).
- **P15. Gestión de Ofertas** *(P04)*:
    - Colas: ofertas por revisar, cierres solicitados; registro de ofertas con tira de estados (Pendientes, Publicadas, Rechazadas, Cerradas).
    - Postulaciones: postulaciones nuevas, por comunicar / derivar y registro.
    - Evaluación de una postulación: ver el CV, registrar la preentrevista (opcional, RF1.6.1) y transicionar estados (pre-seleccionado, derivado, no apto).
- **P16. Gestión de Postulantes** *(P09)* (`/admin/postulantes`): Buscador en el padrón por etiquetas para asociar manualmente a ofertas.
- **P18. Seguimiento del postulante** *(nueva, consigna)*: Dentro de la ficha del postulante (`/admin/postulantes/[id]`): postulaciones, preentrevistas, derivaciones, resultados, cantidad de rechazos y derivaciones a cursos (RF1.6.5, D-046).
- **P19. Derivaciones a cursos** *(nueva, consigna)*: Dentro de la ficha del postulante, junto a P18. Registrar que la Oficina derivó a una persona a un curso y ver el historial (RF1.6.6, D-047).
- **P21. Equipo** *(nueva, 2026-10-20)* (`/admin/equipo`): Cuentas de la Oficina y "Crear una cuenta de operadora" con contraseña temporal. No se borran cuentas (D-058).
