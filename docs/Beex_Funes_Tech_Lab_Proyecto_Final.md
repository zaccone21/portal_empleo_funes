# Proyecto Final

## Funes Tech Lab

**Beex.dev**

## 1. Presentación y objetivo

**Funes Tech Lab --- Beex \| Portal Municipal de Empleo**

La evaluación final valorará el funcionamiento real del portal, el
cumplimiento del MVP, la organización técnica y la capacidad de cada
equipo para explicar su trabajo. El uso de inteligencia artificial está
permitido: se espera que los integrantes comprendan y puedan defender lo
implementado.

## 2. Fecha límite y condiciones de entrega

**Fecha límite:** lunes 2 de noviembre de 2026.

El proyecto deberá estar terminado, publicado y accesible para su
revisión.

Cada equipo deberá entregar:

-   El enlace de Vercel.
-   El repositorio GitHub actualizado.
-   Un README con instrucciones y tecnologías.
-   Usuarios de demostración para los roles de postulante, empresa y
    Municipalidad.

No se deben compartir contraseñas personales ni datos sensibles.

## 3. Criterios de evaluación

  ------------------------------------------------------------------------
  Criterio                                      Peso Qué se evalúa
  --------------------- ---------------------------- ---------------------
  Funcionalidad y                                25% Flujos principales
  cumplimiento del MVP                               completos y
                                                     operativos.

  Base de datos y                                15% Relaciones,
  Supabase                                           autenticación,
                                                     persistencia y
                                                     Storage.

  Arquitectura y buenas                          15% Next.js, TypeScript,
  prácticas                                          estructura y
                                                     reutilización.

  Diseño y experiencia                           10% Navegación,
  de usuario                                         coherencia visual y
                                                     adaptación móvil.

  Git y trabajo en                               10% Colaboración,
  equipo                                             historial y
                                                     organización.

  Calidad y                                      10% Estabilidad,
  funcionamiento                                     validaciones y uso
  general                                            real de los flujos.

  Deploy en Vercel                                5% Aplicación publicada
                                                     y conectada a sus
                                                     servicios.

  Presentación y                                 10% Demostración y
  defensa técnica                                    comprensión de
                                                     decisiones técnicas.

  **TOTAL**                                 **100%** 
  ------------------------------------------------------------------------

## 4. Requisitos mínimos del MVP

  -----------------------------------------------------------------------
  Módulo                              Requisito obligatorio
  ----------------------------------- -----------------------------------
  **Autenticación y roles**           Registro, ingreso y cierre de
                                      sesión; postulante, empresa y
                                      Municipalidad con accesos
                                      diferenciados.

  **Perfil del postulante**           Consultar y editar información
                                      personal y laboral; incluir acceso
                                      al CV y seleccionar múltiples
                                      categorías laborales.

  **Empresas**                        Registro y administración de sus
                                      ofertas.

  **Ofertas laborales**               Publicar, consultar, editar y
                                      cerrar ofertas; listado público y
                                      detalle.

  **Postulaciones**                   El postulante puede inscribirse a
                                      una oferta disponible.

  **Intermediación municipal**        La Municipalidad revisa
                                      postulaciones, realiza y registra
                                      una preentrevista antes de derivar
                                      candidatos a cada empresa. La
                                      preentrevista es opcional y no
                                      constituye un requisito obligatorio
                                      para la derivación. La
                                      Municipalidad podrá derivar
                                      candidatos directamente, sin
                                      necesidad de realizar o registrar
                                      una preentrevista previa. Cuando se
                                      realice una preentrevista, deberá
                                      quedar registrada y asociada al
                                      postulante y a la postulación
                                      correspondiente.

  **Búsqueda de candidatos**          La Municipalidad puede buscar y
                                      filtrar postulantes por rubro o
                                      categoría laboral.

  **Decisión empresarial**            La empresa visualiza solo
                                      candidatos derivados e informa si
                                      contrata o no contrata; si no
                                      contrata, debe indicar por qué.

  **Seguimiento**                     Historial por postulante de
                                      postulaciones, derivaciones,
                                      resultados y cantidad de rechazos.

  **Cursos de capacitación**          Registro básico de derivaciones
                                      municipales de postulantes a cursos
                                      y consulta del historial.

  **Supabase**                        Persistencia de datos,
                                      autenticación y uso real de
                                      Supabase Storage para subir y
                                      recuperar archivos.

  **Interfaz y deploy**               Diseño usable y responsive;
                                      aplicación funcionando en Vercel.
  -----------------------------------------------------------------------

## 5. Flujo funcional obligatorio

1.  El postulante consulta una oferta laboral y se postula.
2.  El postulante puede seleccionar múltiples categorías laborales en su
    perfil.
3.  La Municipalidad recibe la postulación, revisa el perfil y puede
    buscar y filtrar candidatos por rubro o categoría laboral.
4.  La Municipalidad realiza y registra una preentrevista antes de
    decidir si deriva al candidato.
5.  La empresa ve únicamente los candidatos derivados por la
    Municipalidad.
6.  La empresa informa si contrata o no contrata al candidato. Cuando no
    contrata, registra obligatoriamente el motivo.
7.  La Municipalidad consulta los resultados y el historial de cada
    postulante, incluida su cantidad de rechazos.
8.  La Municipalidad puede registrar una derivación a un curso de
    capacitación y consultar ese antecedente.

### Reglas de seguimiento

Cada rechazo debe quedar asociado a la postulación correspondiente y al
perfil del postulante, conservando el motivo informado por la empresa.
La cantidad de rechazos debe poder consultarse desde el seguimiento del
postulante.

Las derivaciones a cursos son independientes de las postulaciones
laborales. No se exige una plataforma educativa ni gestión académica:
alcanza con registrar el curso, el postulante y la derivación.

## 6. Escala de evaluación

    Puntaje Resultado
  --------- --------------
    90--100 Excelente
     75--89 Muy bueno
     60--74 Aprobado
     40--59 Insuficiente
      0--39 No aprobado

## 7. Selección del proyecto ganador

La Municipalidad de Funes, en su carácter de cliente, será la
responsable de seleccionar el proyecto ganador. Beex Tech Lab realizará
la evaluación académica y técnica de cada equipo de manera
independiente.

La propuesta elegida por la Municipalidad no necesariamente será la de
mayor calificación técnica. La elección responderá a las necesidades,
preferencias y valoración general del cliente, y no implica que el
proyecto ganador sea técnicamente superior a los demás.

## 8. Consideraciones finales

Se priorizarán funcionalidades completas y utilizables por encima de la
cantidad de pantallas o características. Los equipos deberán demostrar
los recorridos principales con datos persistidos y explicar las
decisiones de implementación. El diseño visual, por sí solo, no
reemplaza el funcionamiento real del sistema.

## 9. Funcionalidades adicionales (Bonus)

Estas funcionalidades son opcionales y están destinadas a los equipos
que completen los requisitos obligatorios del MVP. No son necesarias
para aprobar ni para presentar el proyecto ante la Municipalidad.

### Notificaciones automáticas por correo electrónico (+5 puntos)

Investigar e integrar un servicio de correo electrónico para enviar
notificaciones automáticas ante eventos del portal, por ejemplo:

-   Confirmación de postulación.
-   Derivación de un candidato a una empresa.
-   Aviso de nuevos candidatos derivados.
-   Resultado de una postulación.
-   Derivación a un curso.

**Requisito para obtener el bonus:** demostrar al menos una notificación
automática real, disparada por una acción del sistema y recibida
correctamente.

Tecnologías posibles: Resend, Supabase Edge Functions u otra integración
compatible con Next.js.

### Dashboard para la Municipalidad (+5 puntos)

Desarrollar un panel administrativo que permita consultar indicadores
del funcionamiento del portal, como:

-   Cantidad de postulantes.
-   Ofertas activas.
-   Postulaciones.
-   Derivaciones a empresas.
-   Contrataciones.
-   Rechazos.
-   Derivaciones a cursos.

**Requisito para obtener el bonus:** mostrar al menos tres indicadores
calculados a partir de datos reales de Supabase. No se considerarán
válidos los valores estáticos o simulados.

### Puntaje adicional

  Funcionalidad opcional                    Puntaje adicional
  --------------------------------------- -------------------
  Notificaciones automáticas por correo                    +5
  Dashboard municipal con datos reales                     +5
  **Máximo adicional**                                **+10**

Los 100 puntos de evaluación corresponden al MVP y a los criterios
generales. Los bonus permiten alcanzar más puntos, pero no compensan
requisitos obligatorios incompletos. La selección del proyecto ganador
continúa siendo una decisión exclusiva de la Municipalidad,
independiente de la calificación técnica.
