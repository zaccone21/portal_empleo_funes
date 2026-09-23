# Requerimientos

## **1. Requerimientos Funcionales (RF)**

### **1.1 Gestión de Usuarios y Autenticación**

- **RF1.1.1 (P01)**: El sistema debe proveer un punto de entrada (Landing Page) que derive a los tres portales distintos: Postulante, Empresa y Administración.
- **RF1.1.2 (P02)**: El sistema debe permitir el registro, login y recuperación de contraseña para cuentas con rol "Postulante".
- **RF1.1.3 (P08)**: El sistema debe permitir el registro, login y recuperación de contraseña para cuentas con rol "Empresa".
- **RF1.1.4 (P13)**: El sistema debe permitir el acceso seguro exclusivamente a los operadores de la Oficina de Empleo mediante cuentas pre-configuradas (Rol "Admin").

### **1.2 Gestión del Postulante**

- **RF1.2.1 (P03)**: El postulante debe poder cargar, editar y visualizar sus datos personales y medios de contacto.
- **RF1.2.2 (P03)**: El sistema debe permitir al postulante seleccionar múltiples etiquetas, oficios o rubros de una lista predefinida (ej: jardinero, albañil), evitando el encasillamiento único.
- **RF1.2.3 (P04)**: El sistema debe permitir al postulante subir de forma asíncrona 1 archivo en formato PDF correspondiente a su Currículum Vitae.
- **RF1.2.4 (P07)**: El postulante debe poder visualizar un listado histórico de las ofertas a las que se ha postulado. Este listado solo mostrará información de la oferta y fecha de postulación, ocultando cualquier estado interno de la oficina.

### **1.3 Gestión de la Empresa**

- **RF1.3.1 (P09)**: La empresa debe acceder a un dashboard inicial que resuma su actividad en el portal.
- **RF1.3.2 (P10)**: La empresa debe poder cargar y editar sus datos fiscales (CUIT), razón social, descripción y datos de la persona de contacto.
- **RF1.3.3 (P11)**: El sistema debe permitir a la empresa crear una oferta laboral completando un formulario con validación de campos obligatorios. No existirá la funcionalidad de guardar "Borradores".
- **RF1.3.4 (P12)**: El sistema debe mostrar a la empresa un listado de sus ofertas con el estado actualizado (Pendiente, Publicada, Rechazada, Cerrada).
- **RF1.3.5 (P12)**: Si una oferta está en estado "Rechazada", el sistema debe mostrar a la empresa el motivo del rechazo emitido por la Oficina.
- **RF1.3.6 (P12)**: La empresa debe poder emitir una solicitud de cierre para una oferta que se encuentre "Publicada". Esta acción no ocultará la oferta del portal público, sino que generará un flag interno para el operador.

### **1.4 Ofertas y Postulación Autogestionada**

- **RF1.4.1 (P05)**: El sistema debe mostrar un listado público de tarjetas resumiendo las ofertas que se encuentren exclusivamente en estado "Publicada".
- **RF1.4.2 (P06)**: Al interactuar con una tarjeta, el sistema debe abrir un modal sin cambiar de página, mostrando la descripción completa y requisitos de la oferta.
- **RF1.4.3 (P06)**: Dentro del modal de la oferta, debe existir una acción para postularse.
- **RF1.4.4 (P06)**: Al intentar postularse, el sistema debe validar si el postulante tiene cargado su archivo CV (P04). En caso negativo, el sistema debe impedir la postulación y requerir la carga del documento.

### **1.5 Operativa y Moderación (Oficina de Empleo)**

- **RF1.5.1 (P14)**: El sistema debe proveer al administrador un panel con indicadores clave, como cantidad de ofertas pendientes de revisión, total de postulantes activos, etc.
- **RF1.5.2 (P15)**: El sistema debe mostrar al administrador el padrón de ofertas dividido por estados (Pendientes, Publicadas, Rechazadas, Cerradas).
- **RF1.5.3 (P15)**: El administrador debe poder transicionar el estado de una oferta nueva de "Pendiente" a "Publicada" o a "Rechazada". Para rechazar, el sistema debe exigir ingresar un motivo.
- **RF1.5.4 (P15)**: El administrador debe poder ejecutar el cierre definitivo ("Cerrada") de las ofertas que posean una solicitud de cierre por parte de la empresa.
- **RF1.5.5 (P15)**: Dentro de una oferta, el administrador debe visualizar el listado de postulantes que aplicaron a la misma y poder descargar/ver sus CVs (en formato PDF).
- **RF1.5.6 (P15)**: El administrador debe poder cambiar el estado individual de cada postulante dentro de una oferta específica (Postulado -> Pre-seleccionado, Derivado, No apto).
- **RF1.5.7 (P16)**: El sistema debe contar con un buscador general del padrón de postulantes. Debe permitir filtrar por etiquetas de oficios/rubros, cruzando datos de los perfiles.
- **RF1.5.8 (P16)**: El administrador debe poder seleccionar manualmente un candidato desde el buscador (P16) y asociarlo a una oferta activa como si fuera una postulación directa.

---

## **2. Requerimientos No Funcionales (RNF)**

- **RNF1 (Seguridad y Privacidad)**: Los archivos PDF correspondientes a los CVs no deben ser de acceso público. Se almacenarán en buckets privados y solo la Oficina de Empleo podrá visualizarlos mediante generación de URLs firmadas temporalmente.
- **RNF2 (Aislamiento de Datos - RLS)**: A nivel de base de datos, deben implementarse políticas estrictas para asegurar que una Empresa solo pueda consultar y modificar sus propias ofertas, y que un Postulante solo pueda consultar y modificar su propio perfil.
- **RNF3 (Usabilidad e Inclusión Digital)**: La interfaz gráfica debe priorizar componentes grandes, legibles y flujos de un solo sentido para garantizar el uso intuitivo a personas con baja alfabetización digital (enfoque Mobile-First).
- **RNF4 (Rendimiento de Búsqueda)**: La base de datos debe contar con indexación optimizada en la tabla relacional de Etiquetas/Rubros para asegurar que las consultas del Administrador en la P16 respondan instantáneamente, sin bloqueo de interfaz, previendo escalabilidad en el padrón.