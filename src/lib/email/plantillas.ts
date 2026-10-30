import "server-only";

/*
 * HTML email templates for the Employment Office portal (courses, pre-interview
 * confirmation, and pre-interview rescheduling). Styled with the same municipal
 * layout and colors as `docs/plantillas-email/confirmar-registro.html`.
 */

function escaparHtml(texto: string): string {
  return texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function envolverPlantilla(titulo: string, cuerpoHtml: string): string {
  return `<div style="margin:0;padding:24px 16px;background-color:#f4f5f2;font-family:Arial,Helvetica,sans-serif;color:#262b35;">
  <div style="max-width:520px;margin:0 auto;background-color:#ffffff;border-radius:16px;overflow:hidden;">
    <div style="background-color:#04311a;padding:20px 24px;">
      <p style="margin:0;font-size:18px;font-weight:bold;color:#ffffff;">Portal de Empleo · Municipalidad de Funes</p>
    </div>
    <div style="padding:24px;">
      <h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;color:#262b35;">${escaparHtml(titulo)}</h1>
      ${cuerpoHtml}
      <hr style="border:none;border-top:1px solid #e2e4e8;margin:24px 0 16px;" />
      <p style="margin:0;font-size:13px;line-height:1.5;color:#636a75;">Oficina de Empleo · Municipalidad de Funes</p>
    </div>
  </div>
</div>`;
}

export function plantillaConfirmarPreentrevista(datos: {
  nombrePostulante: string;
  tituloOferta: string;
  fechaHoraTexto: string;
  notas?: string | null;
  urlConfirmar: string;
  urlCancelar: string;
}): { asunto: string; html: string } {
  const saludo = datos.nombrePostulante.trim() ? `Hola, ${escaparHtml(datos.nombrePostulante.trim())}:` : "Hola:";
  const notasBloque = datos.notas?.trim()
    ? `<div style="margin:0 0 20px;padding:12px 16px;background-color:#f4f5f2;border-radius:8px;font-size:15px;line-height:1.5;">
        <strong>Indicaciones de la Oficina:</strong><br />${escaparHtml(datos.notas.trim())}
      </div>`
    : "";

  const cuerpo = `
    <p style="margin:0 0 16px;font-size:16px;line-height:1.5;">${saludo}</p>
    <p style="margin:0 0 16px;font-size:16px;line-height:1.5;">
      Desde la Oficina de Empleo de Funes te agendamos una <strong>pre-entrevista</strong> por tu postulación a la oferta <strong>${escaparHtml(datos.tituloOferta)}</strong>.
    </p>
    <div style="margin:0 0 20px;padding:14px 16px;background-color:#e6efe9;border-left:4px solid #074a1f;border-radius:8px;">
      <p style="margin:0;font-size:16px;font-weight:bold;color:#04311a;">Fecha y hora: ${escaparHtml(datos.fechaHoraTexto)}</p>
    </div>
    ${notasBloque}
    <p style="margin:0 0 16px;font-size:16px;line-height:1.5;">Por favor, confirmá si podés asistir tocando una de las opciones:</p>
    <p style="margin:0 0 16px;">
      <a href="${escaparHtml(datos.urlConfirmar)}" style="display:inline-block;padding:14px 24px;background-color:#074a1f;color:#ffffff;font-size:16px;font-weight:bold;text-decoration:none;border-radius:8px;margin-right:12px;">Confirmar asistencia</a>
    </p>
    <p style="margin:0 0 8px;font-size:14px;line-height:1.5;">
      ¿No podés asistir en ese horario? <a href="${escaparHtml(datos.urlCancelar)}" style="color:#074a1f;font-weight:bold;text-decoration:underline;">Avisar que necesito reprogramar</a>
    </p>
  `;

  return {
    asunto: `Confirmá tu pre-entrevista · ${datos.tituloOferta}`,
    html: envolverPlantilla("Confirmá tu pre-entrevista", cuerpo),
  };
}

export function plantillaReprogramarPreentrevista(datos: {
  nombrePostulante: string;
  tituloOferta: string;
  fechaHoraTexto: string;
  notas?: string | null;
  requiereConfirmacion: boolean;
  urlConfirmar: string;
  urlCancelar: string;
}): { asunto: string; html: string } {
  const saludo = datos.nombrePostulante.trim() ? `Hola, ${escaparHtml(datos.nombrePostulante.trim())}:` : "Hola:";
  const notasBloque = datos.notas?.trim()
    ? `<div style="margin:0 0 20px;padding:12px 16px;background-color:#f4f5f2;border-radius:8px;font-size:15px;line-height:1.5;">
        <strong>Indicaciones de la Oficina:</strong><br />${escaparHtml(datos.notas.trim())}
      </div>`
    : "";

  const accionesBloque = datos.requiereConfirmacion
    ? `<p style="margin:0 0 16px;font-size:16px;line-height:1.5;">Por favor, confirmá que podés asistir en este nuevo horario:</p>
       <p style="margin:0 0 16px;">
         <a href="${escaparHtml(datos.urlConfirmar)}" style="display:inline-block;padding:14px 24px;background-color:#074a1f;color:#ffffff;font-size:16px;font-weight:bold;text-decoration:none;border-radius:8px;margin-right:12px;">Confirmar nuevo horario</a>
       </p>
       <p style="margin:0 0 8px;font-size:14px;line-height:1.5;">
         ¿Tampoco podés en este horario? <a href="${escaparHtml(datos.urlCancelar)}" style="color:#074a1f;font-weight:bold;text-decoration:underline;">Avisar a la Oficina</a>
       </p>`
    : `<p style="margin:0 0 8px;font-size:15px;line-height:1.5;">Tu cita ya quedó agendada con este nuevo horario.</p>`;

  const cuerpo = `
    <p style="margin:0 0 16px;font-size:16px;line-height:1.5;">${saludo}</p>
    <p style="margin:0 0 16px;font-size:16px;line-height:1.5;">
      La Oficina de Empleo reprogramó el horario de tu pre-entrevista para la oferta <strong>${escaparHtml(datos.tituloOferta)}</strong>.
    </p>
    <div style="margin:0 0 20px;padding:14px 16px;background-color:#e6efe9;border-left:4px solid #074a1f;border-radius:8px;">
      <p style="margin:0;font-size:16px;font-weight:bold;color:#04311a;">Nuevo horario: ${escaparHtml(datos.fechaHoraTexto)}</p>
    </div>
    ${notasBloque}
    ${accionesBloque}
  `;

  return {
    asunto: `Nuevo horario de pre-entrevista · ${datos.tituloOferta}`,
    html: envolverPlantilla("Reprogramación de pre-entrevista", cuerpo),
  };
}

export function plantillaAsignacionCurso(datos: {
  nombrePostulante: string;
  nombreCurso: string;
  descripcion?: string | null;
  modalidad?: string | null;
  horario?: string | null;
  fechaTexto: string;
  notas?: string | null;
}): { asunto: string; html: string } {
  const saludo = datos.nombrePostulante.trim() ? `Hola, ${escaparHtml(datos.nombrePostulante.trim())}:` : "Hola:";
  const detalles: string[] = [];
  if (datos.modalidad?.trim()) detalles.push(`<li><strong>Modalidad:</strong> ${escaparHtml(datos.modalidad.trim())}</li>`);
  if (datos.horario?.trim()) detalles.push(`<li><strong>Horario / Cursada:</strong> ${escaparHtml(datos.horario.trim())}</li>`);
  detalles.push(`<li><strong>Fecha de inscripción:</strong> ${escaparHtml(datos.fechaTexto)}</li>`);

  const descripcionBloque = datos.descripcion?.trim()
    ? `<p style="margin:8px 0 0;font-size:15px;line-height:1.5;color:#262b35;">${escaparHtml(datos.descripcion.trim())}</p>`
    : "";

  const notasBloque = datos.notas?.trim()
    ? `<div style="margin:0 0 16px;padding:12px 16px;background-color:#f4f5f2;border-radius:8px;font-size:15px;line-height:1.5;">
        <strong>Mensaje de la Oficina:</strong><br />${escaparHtml(datos.notas.trim())}
      </div>`
    : "";

  const cuerpo = `
    <p style="margin:0 0 16px;font-size:16px;line-height:1.5;">${saludo}</p>
    <p style="margin:0 0 16px;font-size:16px;line-height:1.5;">
      Desde la Oficina de Empleo de la Municipalidad de Funes te asignamos una vacante en una capacitación especial pensada para fortalecer tu perfil laboral:
    </p>
    <div style="margin:0 0 20px;padding:16px;background-color:#e6efe9;border-left:4px solid #074a1f;border-radius:8px;">
      <p style="margin:0;font-size:18px;font-weight:bold;color:#04311a;">${escaparHtml(datos.nombreCurso)}</p>
      ${descripcionBloque}
      <ul style="margin:12px 0 0;padding-left:20px;font-size:15px;line-height:1.6;color:#262b35;">
        ${detalles.join("")}
      </ul>
    </div>
    ${notasBloque}
    <p style="margin:0;font-size:15px;line-height:1.5;">
      Acercate o comunicate con la Oficina de Empleo para coordinar el inicio. ¡Te esperamos!
    </p>
  `;

  return {
    asunto: `Capacitación asignada: ${datos.nombreCurso} · Oficina de Empleo Funes`,
    html: envolverPlantilla("Te asignamos un curso de capacitación", cuerpo),
  };
}
