# Pantallas MVP

## **Acceso Público**

- **P01. Landing Page**: Presentación del portal, opciones de registro/login separadas por rol (Postulante / Empresa / Institucional).

### **Postulante**

- **P02. Autenticación Postulante**: Login, Registro, Recuperar contraseña.
- **P03. Mi Perfil**: Datos personales, contacto.
- P04. Cargar/Crear CV.
- **P05. Ofertas Laborales** *(P07)*: Listado de tarjetas con ofertas publicadas.
- **P06. Detalle Oferta** *(P08)*: Se abre sobre PAN-04. Muestra info. completa y botón "Postularme".
- **P07. Mis Postulaciones**: Historial para que el postulante vea a qué aplicó ( sin estado interno).

## Empresa:

- **P08. Login Empresarial** *(P01)*: Acceso empresas.
- **P09. Dashboard Empresa** *(P02)*: Resumen de bienvenida.
- **P10. Perfil de Empresa**: Para editar CUIT, razón social, teléfonos de contacto.
- **P11. Crear Oferta** *(P03)*: Formulario de alta de vacante.
- **P12. Mis Ofertas** *(P05)*: Grilla de ofertas con sus estados y botón para solicitar cierre.

### **Oficina de Empleo (Admin)**

- **P13. Login Admin**: Acceso seguro para los operadores.
- **P14. Dashboard Admin**: Panel rápido para ver cuántas ofertas pendientes hay y métricas básicas.
- **P15. Gestión de Ofertas** *(P04)*:
    - Pestañas: Pendientes, Publicadas, Rechazadas, Cerradas.
    - Al abrir una oferta: Evaluar postulantes, ver CVs y transicionar estados (pre-seleccionado, derivado, no apto).
- **P16. Gestión de Postulantes** *(P09)*: Buscador proactivo en el padrón por etiquetas para asociar manualmente a ofertas.
