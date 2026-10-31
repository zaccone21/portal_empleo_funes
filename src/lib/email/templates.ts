import "server-only";

export function escaparHtml(texto: string): string {
  return texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function obtenerUrlBase(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  }
  return "http://localhost:3000";
}

type OpcionesLayout = {
  preencabezado?: string;
  titulo: string;
  cuerpoHtml: string;
  botonTexto?: string;
  botonUrl?: string;
  pieAdicional?: string;
};

/**
 * Base responsive HTML email template for the Municipality of Funes Employment Office.
 * Adheres to the "Mosaico de oficios" visual identity tokens (brand-deep #04311a, brand-leaf #3c8c4f).
 */
export function layoutBaseEmail({
  preencabezado = "Municipalidad de Funes",
  titulo,
  cuerpoHtml,
  botonTexto,
  botonUrl,
  pieAdicional,
}: OpcionesLayout): string {
  const botonHtml =
    botonTexto && botonUrl
      ? `
      <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 28px 0;">
        <tr>
          <td align="center" style="border-radius: 8px; background-color: #04311a;">
            <a href="${escaparHtml(botonUrl)}" target="_blank" style="display: inline-block; padding: 14px 28px; font-size: 15px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 8px;">
              ${escaparHtml(botonTexto)}
            </a>
          </td>
        </tr>
      </table>
    `
      : "";

  const pieExtraHtml = pieAdicional
    ? `
      <div style="border-top: 1px solid #f1f5f9; padding-top: 16px; margin-top: 24px;">
        <p style="font-size: 12px; line-height: 1.5; color: #94a3b8; margin: 0;">
          ${escaparHtml(pieAdicional)}
        </p>
      </div>
    `
    : "";

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escaparHtml(titulo)}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f6f4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f6f4; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 560px; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(4, 49, 26, 0.05);" cellspacing="0" cellpadding="0">
          <tr>
            <td style="background-color: #04311a; padding: 28px 32px; text-align: left;">
              <span style="color: #cfe6d3; font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; display: block; margin-bottom: 4px;">${escaparHtml(preencabezado)}</span>
              <h1 style="color: #ffffff; font-size: 20px; font-weight: 700; margin: 0; letter-spacing: -0.3px;">Oficina de Empleo</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 36px 32px 28px 32px;">
              <h2 style="color: #04311a; font-size: 19px; font-weight: 700; margin-top: 0; margin-bottom: 16px; line-height: 1.3;">${escaparHtml(titulo)}</h2>
              ${cuerpoHtml}
              ${botonHtml}
              ${pieExtraHtml}
            </td>
          </tr>
          <tr>
            <td style="background-color: #f8fafc; padding: 20px 32px; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="font-size: 12px; color: #64748b; margin: 0; line-height: 1.5;">
                <strong>Oficina de Empleo · Municipalidad de Funes</strong><br>
                Funes, Santa Fe, Argentina
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * 1. Template: Offer approved for the company
 */
export function plantillaOfertaAprobadaEmpresa(datos: {
  razonSocial: string;
  tituloOferta: string;
}): { asunto: string; html: string } {
  const urlBase = obtenerUrlBase();
  const asunto = `Tu oferta laboral "${datos.tituloOferta}" fue aprobada - Portal de Empleo`;
  const cuerpoHtml = `
    <p style="font-size: 15px; line-height: 1.6; color: #334155; margin-bottom: 16px;">
      Hola <strong>${escaparHtml(datos.razonSocial)}</strong>:
    </p>
    <p style="font-size: 15px; line-height: 1.6; color: #334155; margin-bottom: 20px;">
      Te informamos que tu oferta laboral <strong>“${escaparHtml(datos.tituloOferta)}”</strong> fue revisada y aprobada por el equipo de la Oficina de Empleo. Ya se encuentra publicada en el catálogo oficial y disponible para recibir postulaciones.
    </p>
    <p style="font-size: 14px; line-height: 1.6; color: #64748b; margin-bottom: 0;">
      A medida que la Oficina evalúe los perfiles interesados y te derive candidatos aptos, los verás directamente en tu panel.
    </p>
  `;

  const html = layoutBaseEmail({
    titulo: "¡Tu oferta laboral ya está publicada!",
    cuerpoHtml,
    botonTexto: "Ver mis ofertas",
    botonUrl: `${urlBase}/empresa/ofertas`,
    pieAdicional: "Este es un aviso automático de la Oficina de Empleo.",
  });

  return { asunto, html };
}

/**
 * 2. Template: Candidate referred to company
 */
export function plantillaCandidatoDerivadoEmpresa(datos: {
  razonSocial: string;
  tituloOferta: string;
}): { asunto: string; html: string } {
  const urlBase = obtenerUrlBase();
  const asunto = `Nuevo candidato derivado para "${datos.tituloOferta}" - Portal de Empleo`;
  const cuerpoHtml = `
    <p style="font-size: 15px; line-height: 1.6; color: #334155; margin-bottom: 16px;">
      Hola <strong>${escaparHtml(datos.razonSocial)}</strong>:
    </p>
    <p style="font-size: 15px; line-height: 1.6; color: #334155; margin-bottom: 20px;">
      La Oficina de Empleo evaluó y derivó un nuevo candidato para tu búsqueda <strong>“${escaparHtml(datos.tituloOferta)}”</strong>.
    </p>
    <div style="background-color: #f1f5f9; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
      <p style="font-size: 14px; line-height: 1.5; color: #334155; margin: 0;">
        Podés ingresar a tu panel de empresa para consultar los datos de contacto, rubros y acceder al CV en PDF del postulante para registrar tu decisión de contratación.
      </p>
    </div>
  `;

  const html = layoutBaseEmail({
    titulo: "Tenés un nuevo candidato derivado",
    cuerpoHtml,
    botonTexto: "Revisar candidatos",
    botonUrl: `${urlBase}/empresa/ofertas`,
    pieAdicional: "Por políticas de protección de datos, la información del candidato solo es visible dentro de tu sesión.",
  });

  return { asunto, html };
}

/**
 * 3. Template: Application referred notification to applicant
 */
export function plantillaPostulacionDerivadaPostulante(datos: {
  nombrePostulante: string;
  tituloOferta: string;
}): { asunto: string; html: string } {
  const urlBase = obtenerUrlBase();
  const nombre = datos.nombrePostulante ? datos.nombrePostulante : "Postulante";
  const asunto = `Novedades sobre tu postulación a "${datos.tituloOferta}" - Portal de Empleo`;
  const cuerpoHtml = `
    <p style="font-size: 15px; line-height: 1.6; color: #334155; margin-bottom: 16px;">
      Hola <strong>${escaparHtml(nombre)}</strong>:
    </p>
    <p style="font-size: 15px; line-height: 1.6; color: #334155; margin-bottom: 20px;">
      ¡Tenemos novedades sobre tu búsqueda laboral! Tu postulación para el puesto <strong>“${escaparHtml(datos.tituloOferta)}”</strong> fue evaluada favorablemente por la Oficina de Empleo y ha sido <strong>derivada a la empresa</strong> para su consideración final.
    </p>
    <p style="font-size: 14px; line-height: 1.6; color: #64748b; margin-bottom: 0;">
      La empresa tiene ahora acceso a tu perfil y CV para coordinar los próximos pasos en caso de avanzar en el proceso de selección.
    </p>
  `;

  const html = layoutBaseEmail({
    titulo: "Tu postulación fue derivada a la empresa",
    cuerpoHtml,
    botonTexto: "Ver mis postulaciones",
    botonUrl: `${urlBase}/postulante/postulaciones`,
    pieAdicional: "La Oficina de Empleo acompaña tu búsqueda de oportunidades en la ciudad.",
  });

  return { asunto, html };
}

/**
 * 4. Template: Pre-interview scheduled notification to applicant
 */
export function plantillaPreentrevista(datos: {
  nombrePostulante: string;
  fechaHora: string;
  notas?: string | null;
}): { asunto: string; html: string } {
  const urlBase = obtenerUrlBase();
  const nombre = datos.nombrePostulante ? datos.nombrePostulante : "Postulante";
  const asunto = `Citación a preentrevista - Oficina de Empleo de Funes`;
  const notasHtml = datos.notas
    ? `<p style="font-size: 14px; line-height: 1.5; color: #475569; margin-top: 8px; margin-bottom: 0;"><strong>Detalles / Notas:</strong> ${escaparHtml(datos.notas)}</p>`
    : "";

  const cuerpoHtml = `
    <p style="font-size: 15px; line-height: 1.6; color: #334155; margin-bottom: 16px;">
      Hola <strong>${escaparHtml(nombre)}</strong>:
    </p>
    <p style="font-size: 15px; line-height: 1.6; color: #334155; margin-bottom: 20px;">
      El equipo de la Oficina de Empleo te cita a una preentrevista para conversar sobre tus postulaciones y perfil laboral.
    </p>
    <div style="background-color: #f1f5f9; border-left: 4px solid #3c8c4f; border-radius: 4px; padding: 16px; margin-bottom: 20px;">
      <p style="font-size: 15px; font-weight: 600; color: #04311a; margin-top: 0; margin-bottom: 4px;">
        Fecha y hora: ${escaparHtml(datos.fechaHora)}
      </p>
      ${notasHtml}
    </div>
  `;

  const html = layoutBaseEmail({
    titulo: "Citación a preentrevista laboral",
    cuerpoHtml,
    botonTexto: "Ir a mi perfil",
    botonUrl: `${urlBase}/postulante/perfil`,
    pieAdicional: "Si tenés algún inconveniente con el horario, comunicate con la Oficina de Empleo.",
  });

  return { asunto, html };
}

/**
 * 5. Template: Training course referral notification to applicant
 */
export function plantillaDerivacionCurso(datos: {
  nombrePostulante: string;
  nombreCurso: string;
  notas?: string | null;
}): { asunto: string; html: string } {
  const urlBase = obtenerUrlBase();
  const nombre = datos.nombrePostulante ? datos.nombrePostulante : "Postulante";
  const asunto = `Derivación a curso de capacitación: ${datos.nombreCurso}`;
  const notasHtml = datos.notas
    ? `<p style="font-size: 14px; line-height: 1.5; color: #475569; margin-top: 8px; margin-bottom: 0;"><strong>Información adicional:</strong> ${escaparHtml(datos.notas)}</p>`
    : "";

  const cuerpoHtml = `
    <p style="font-size: 15px; line-height: 1.6; color: #334155; margin-bottom: 16px;">
      Hola <strong>${escaparHtml(nombre)}</strong>:
    </p>
    <p style="font-size: 15px; line-height: 1.6; color: #334155; margin-bottom: 20px;">
      Queremos informarte que la Oficina de Empleo te ha derivado a la siguiente propuesta de capacitación y formación profesional:
    </p>
    <div style="background-color: #f1f5f9; border-left: 4px solid #04311a; border-radius: 4px; padding: 16px; margin-bottom: 20px;">
      <p style="font-size: 16px; font-weight: 700; color: #04311a; margin-top: 0; margin-bottom: 4px;">
        ${escaparHtml(datos.nombreCurso)}
      </p>
      ${notasHtml}
    </div>
  `;

  const html = layoutBaseEmail({
    titulo: "Derivación a curso de capacitación",
    cuerpoHtml,
    botonTexto: "Ir al portal de empleo",
    botonUrl: urlBase,
    pieAdicional: "Las capacitaciones son coordinadas por la Municipalidad de Funes.",
  });

  return { asunto, html };
}
