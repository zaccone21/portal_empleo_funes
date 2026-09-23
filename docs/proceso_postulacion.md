Proceso de postulación sobre una oferta laboral:

Postulante

Oficina

Portal

Requiere login

Login /
Register

Tabla: postulantes

P06. Login postulante
(form)

No

Si

El usuario quiere

cargar CV en el

momento?

Tabla: ofertas

estado = ‘aprobadas’

P07. Ofertas Laborales

Modal con detalle

Selecciona

oferta

Clickea

“Postularme”

P08. Cargar/Crear CV

Cargar

Crear

CV

Form de carga

Form de creacion

Si

No

Tiene CV

cargado/creado?

CV

Para  búsqueda pro-

activa

DB legacy

Usuarios inactivos

Tabla: postulantes

cv_url = bucket path

P09. Gestión de
Postulantes

zaccone

Se registra

postulacion

Tabla: postulaciones

postulante_id ; oferta_id

Faltaria flujo de busquda

pro-activa desde Gestión

Postulantes

Flujo de Auto-Postulación:

postulante se postula → el

registro aparece en P04

dentro de esa oferta → la

Oficina evalúa desde P04.

zaccone

zaccone

P04. Gestión ofertas

Tabla: ofertas

Tabla: postulaciones

postulante_id ; oferta_id

Notifica postulante?

Elimina postulacion?

Tabla: postulaciones

estado_pos = ‘pre-
seleccionado’

Atajos de contacto del
postulante

Revisa

postulación

Si

No

Encaja?

Marca

postulante

(pre-selec.)

Contacta postulante

para entrevista

Pre-Entrevista

P09. Gestión de
Postulantes

No

Si

Esta apto?

Tabla: postulaciones

estado_pos = ‘no apto’

cant_rechazos = +1

Tabla: postulaciones

estado_pos = ‘derivado’

Derivado con la

empresa

