# Proceso AS-IS (situación actual, sin portal)

Resumen en texto del cursograma `Cursograma AS-IS.pdf`. Es contexto de negocio, no requerimiento: el alcance lo define `Requerimientos.md`. Sirve para entender qué hace hoy la Oficina de Empleo a mano y qué dolores debe resolver el portal.

## Actores (carriles del cursograma)

| Actor | Rol en el proceso actual |
|---|---|
| Postulante | Busca trabajo, arma su CV y lo entrega. |
| Oficina de Empleo | Hace casi todo el trabajo, de forma manual. |
| Empresa | Informa vacantes, elige entre los CV propuestos. |
| Diseñador | Tercero que arma el flyer de cada puesto. |
| Gobierno Provincial | Recibe el reporte final. |

Los registros de la Oficina viven en planillas Excel: vacantes, postulantes, contratados y rechazados.

## Flujo por etapa

### 1. Detección de vacantes
1. La Oficina consulta personalmente a las empresas si tienen una vacante. Si la empresa no tiene, el proceso termina.
2. También puede pasar al revés: la empresa detecta una vacante y la postula por WhatsApp o mail.
3. La Oficina anota informalmente el puesto buscado y lo registra en la planilla Excel de vacantes.

Dolores: 100% manual, falta de un canal estandarizado, aumento de tiempo y costo.

### 2. Difusión de la vacante
1. La Oficina pasa el perfil buscado al Diseñador.
2. El Diseñador crea el flyer del puesto y se lo devuelve.
3. La Oficina publica el flyer en redes sociales.

Dolores: dependencia de terceros, aumento de tiempo y costo.

### 3. Recepción de postulantes
1. El postulante ve la publicación, arma su CV y lo envía por mail, WhatsApp o en papel.
2. La Oficina registra al postulante en la planilla Excel de postulantes.

Dolores: múltiples canales desestructurados, carga manual repetitiva, inconsistencia de datos.

### 4. Búsqueda y matching
1. Con la postulación en mano, la Oficina cruza la planilla de vacantes con la de postulantes y busca candidatos.
2. Junto con los CV, hace el matching a ojo.
3. Si no matchea: no pasa nada (el candidato queda sin acción).
4. Si matchea: se le da turno al postulante para una entrevista.

Dolores: búsqueda sin categorización, por lo tanto secuencial. Gestión y comunicación de turnos 100% manual.

### 5. Entrevista y propuesta a la empresa
1. La Oficina entrevista al candidato y decide si está apto.
2. Si está apto: se confecciona la propuesta, un paquete de 5 o 6 CV, y se envía a la empresa.
3. Si no está apto: sigue el registro de rechazo (ver punto 6).

Dolores: confección manual del paquete de CV.

### 6. Selección y registro
La empresa selecciona a alguien del paquete.
- **Seleccionado**: la Oficina registra la selección en la planilla de contratados. Sigue el control de conformidad (punto 7).
- **No seleccionado**: la Oficina registra el rechazo en la planilla de rechazados.
  - Si el postulante acumula 3 rechazos, se lo deriva a un CIT.
  - Si no llega a 3, no pasa nada.

Dolores: falta de alertas automáticas para el seguimiento, seguimiento sin registro sistémico.

### 7. Seguimiento
- Control de conformidad cada 2 meses. Involucra a la empresa (on boarding empresarial) y al seguimiento del postulante.

### 8. Reportes
- A fin de mes o de proceso, la Oficina confecciona un reporte a mano y se lo envía al Gobierno Provincial.

Dolores: elaboración manual de reportes, análisis de métricas a ojo.

## Resumen de dolores (lo que el portal ataca)

| Dolor | Etapa |
|---|---|
| Sin canal estándar para vacantes | Detección |
| Difusión dependiente de un tercero | Difusión |
| Entrada por canales dispersos, carga repetida, datos inconsistentes | Recepción |
| Búsqueda secuencial, sin categorías | Búsqueda |
| Turnos y comunicación manuales | Búsqueda |
| Armado manual del paquete de CV | Propuesta |
| Sin alertas ni registro sistémico de seguimiento | Selección y seguimiento |
| Reportes manuales | Reportes |

## Notas sobre el cursograma original

- Hay dos hexágonos sin rótulo legible: uno en el carril del Postulante (a continuación de "se le da turno") y otro en el del Gobierno Provincial (destino del reporte). Se interpretaron como "el postulante recibe el turno" y "el gobierno recibe el reporte".
- El CIT aparece como derivación del postulante tras 3 rechazos. En `AGENTS.md` esa derivación y el seguimiento a 60 días están fuera del MVP salvo que una decisión diga lo contrario.
- Los términos del cursograma (postulación, rechazo, seleccionado) no siguen el glosario del proyecto. Para nombres y estados de código, valen `pantallas.md` y el glosario de `AGENTS.md`.
