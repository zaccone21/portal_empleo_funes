# Evaluación de Notificaciones del Portal de Empleo

Documento de análisis y arquitectura funcional para el sistema de notificaciones del Portal de Empleo de la Municipalidad de Funes.

---

## 1. Diagnóstico Actual

En la versión actual del portal:
* **Pre-entrevistas:** Cuentan con envío de correos electrónicos automáticos implementados (`plantillaConfirmarPreentrevista`, `plantillaReprogramarPreentrevista`) con confirmación en un clic desde el correo hacia `/preentrevista/[token]`.
* **Cursos de capacitación:** Cuentan con plantilla base (`plantillaAsignacionCurso`).
* **Resto de eventos:** La mayoría de las transiciones operativas dependen de que el usuario (postulante o empresa) ingrese por propia iniciativa al portal a chequear el estado de sus trámites o postulaciones.

Para maximizar la tasa de respuesta y efectividad de intermediación laboral de la Oficina de Empleo, se define la siguiente matriz de eventos y canales.

---

## 2. Matriz de Eventos y Notificaciones por Rol

### 2.1. Postulante (Ciudadano)

| Evento disparador | Canal principal | Contenido / Asunto | Impacto / Justificación |
| :--- | :--- | :--- | :--- |
| **Postulación a oferta completada** | In-App Toast inmediato + Email de acuse de recibo | *"Recibimos tu postulación para [Puesto] en Funes"* | Brinda tranquilidad al postulante confirmando que su CV ya está a disposición de la Oficina de Empleo. |
| **Pre-entrevista agendada / reprogramada** | Email con acciones directas (Confirmar / Pedir cambio) | *"Tenés una pre-entrevista laboral con la Oficina de Empleo"* | **Crítica (Activa):** Evita el ausentismo coordinando fecha y lugar con confirmación por token sin requerir login. |
| **Derivación a la empresa contratante** | Email informativo | *"Tu postulación avanzó: la empresa [Nombre o Rubro] ya tiene tu perfil"* | Mantiene motivado al candidato y le avisa que puede recibir un llamado o mensaje de WhatsApp en los próximos días. |
| **Asignación a curso de capacitación** | Email con cronograma y sede | *"Te asignamos una vacante para el curso de [Nombre del curso]"* | **Alta:** Informa fecha de inicio, sede física de cursada y requisitos de asistencia. |
| **Búsqueda cerrada o finalizada sin contratación** | In-App en "Mis postulaciones" (Pill de estado) | *Estado visual actualizado* | No requiere spam de email si no fue seleccionado, pero el historial en el portal refleja el cierre de la búsqueda con total transparencia. |

---

### 2.2. Empresa (Comercio / Industria / Empleador)

| Evento disparador | Canal principal | Contenido / Asunto | Impacto / Justificación |
| :--- | :--- | :--- | :--- |
| **Aprobación de cuenta de empresa** | Email de bienvenida | *"Tu empresa fue aprobada en el Portal de Empleo de Funes"* | **Alta:** Habilita formalmente al empleador a comenzar a publicar avisos de búsqueda laboral. |
| **Rechazo o solicitud de subsanación de empresa** | Email con motivo | *"Observaciones sobre el registro de tu empresa"* | Comunica si hubo errores en el CUIT, razón social o rubro para subsanar con la Oficina. |
| **Aprobación de oferta laboral** | Email con enlace a la oferta | *"Tu búsqueda [Puesto] ya está publicada en el portal"* | Confirma que la oferta fue revisada y ya es visible para toda la comunidad. |
| **Candidato derivado propuesto por la Oficina** | Email con botón de contacto | *"Nuevo candidato preseleccionado para tu búsqueda [Puesto]"* | **Crítica:** Reduce drásticamente el tiempo de contratación. El empleador recibe el aviso con el teléfono, WhatsApp y CV del candidato listo para entrevistar. |
| **Recordatorio de respuesta pendiente** | Email de seguimiento (a los 7 días de derivado sin respuesta) | *"¿Cómo avanzó la búsqueda de [Puesto]? Contanos si hubo contrataciones"* | Permite a la Oficina mantener al día el KPI de inserción laboral y habilitar el cierre ordenado de la oferta. |

---

### 2.3. Oficina de Empleo (Operadores Municipales)

| Evento disparador | Canal principal | Contenido / Visualización | Impacto / Justificación |
| :--- | :--- | :--- | :--- |
| **Nueva empresa registrada pendiente de aprobación** | Badge de notificación en barra lateral y Status Strip | Contador destacado en `/admin/empresas` | Permite verificar y aprobar empresas con agilidad. |
| **Nueva oferta pendiente de revisión** | Contador numérico en panel lateral | Contador destacado en `/admin/ofertas` | Asegura que ninguna oferta quede esperando revisión más de 24 horas. |
| **Solicitud de cierre de oferta por parte de empresa** | Filtro de cola en panel `/admin/ofertas` | Etiqueta *"Cierre solicitado"* | Informa si el puesto fue cubierto o desistido. |
| **Postulante que acumuló 3 procesos sin contratación** | Indicador en ficha y listado `/admin/cursos` | Sugerencia automática de capacitación | Permite a los operadores intervenir activamente ofreciendo reconversión de oficio. |

---

## 3. Canales y Buenas Prácticas Técnicas

1. **Email Transaccional (SMTP / Resend / Supabase Auth):**
   * Remitente institucional verificado (ej. `empleo@funes.gob.ar` o SMTP configurado).
   * Formato HTML limpio y responsive, legible en celulares sin necesidad de descargar imágenes pesadas.
   * Botones de acción directa con deep links a la sección correspondiente del portal (`/empresa/candidatos`, `/postulante/postulaciones`).
2. **Alertas en Pantalla (Toasts con Sonner):**
   * Montado en el layout raíz en la parte superior central.
   * Feedback inmediato en cada interacción de usuario (guardar perfil, postularse, actualizar estado).
3. **Bandeja y Contadores de Mesa de Trabajo (Admin):**
   * Actualizados en tiempo real mediante Server Components y recuento en base de datos PostgreSQL.
