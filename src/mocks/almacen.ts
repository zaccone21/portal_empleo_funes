import type { PerfilEmpresa } from "@/lib/validation/empresa";

import {
  EMPRESAS_DE_EJEMPLO,
  OFERTAS_DE_EJEMPLO,
  POSTULACIONES_DE_EJEMPLO,
  POSTULANTES_DE_EJEMPLO,
  pdfDeEjemplo,
  type CvGuardado,
  type OfertaGuardada,
  type PostulacionGuardada,
} from "./datos-ejemplo";

/*
 * TEMPORARY (DT-003): in-memory state of the simulated API while `npm run dev`
 * runs, shaped like the future tables (offers, companies, CVs, applications),
 * so what one role does is seen by the others. Restarting the server brings
 * back the example data.
 *
 * It lives on globalThis because Next bundles each Route Handler on its own:
 * a plain module variable would give every route its own copy. The key has a
 * version: when the shape changes, a running dev server starts a fresh store
 * instead of reusing an old one.
 */
type AlmacenSimulado = {
  ofertas: OfertaGuardada[];
  /** Company data by account email; null until the company fills it in. */
  empresas: Record<string, PerfilEmpresa | null>;
  /** CV by applicant email. The test applicant starts without one (to show "Falta tu CV"). */
  cvs: Record<string, CvGuardado>;
  postulaciones: PostulacionGuardada[];
};

function crearAlmacen(): AlmacenSimulado {
  const cvs: Record<string, CvGuardado> = {};
  for (const email of POSTULANTES_DE_EJEMPLO) {
    const contenido = pdfDeEjemplo(`CV de ejemplo de ${email}`);
    cvs[email] = {
      nombre: `cv-${email.split("@")[0]}.pdf`,
      tamanoBytes: contenido.byteLength,
      subidoEl: "2026-09-20T12:00:00-03:00",
      contenido,
    };
  }
  return {
    ofertas: structuredClone(OFERTAS_DE_EJEMPLO),
    empresas: structuredClone(EMPRESAS_DE_EJEMPLO),
    cvs,
    postulaciones: structuredClone(POSTULACIONES_DE_EJEMPLO),
  };
}

const global = globalThis as typeof globalThis & { __portalEmpleoSimuladoV3?: AlmacenSimulado };

export const almacen: AlmacenSimulado = (global.__portalEmpleoSimuladoV3 ??= crearAlmacen());
