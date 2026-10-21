import "server-only";

import type { CurrentUser } from "@/lib/dal/auth";
import { guardarDecisionEmpresa, leerCandidato, listarCandidatosDerivados, type Candidato } from "@/lib/dal/candidatos";
import { crearUrlFirmadaCvParaEmpresa } from "@/lib/dal/cv";
import { guardarPerfilEmpresa, leerPerfilEmpresa } from "@/lib/dal/empresas";
import { crearOferta, leerOferta, listarOfertasDeEmpresa, marcarCierreSolicitado } from "@/lib/dal/ofertas";
import type { CandidatoDerivado, DatosDecisionCandidato } from "@/lib/validation/candidatos";
import type { PerfilEmpresa } from "@/lib/validation/empresa";
import type { DatosNuevaOferta, OfertaEmpresa } from "@/lib/validation/ofertas";

import { aOfertaEmpresa } from "./dto-ofertas";
import { exito, falla, sinPermiso, type Resultado } from "./resultado";

/*
 * The company area (P09-P12; RF1.3.1-RF1.3.6; D-027). Every action is for the
 * company role, and a company only ever touches its own data and offers (RLS
 * checks the same again, RNF2).
 */

export async function verPerfilEmpresa(usuario: CurrentUser): Promise<Resultado<{ perfil: PerfilEmpresa | null; cuit: string | null }>> {
  const negado = sinPermiso(usuario, "empresa");
  if (negado) return negado;

  const resultado = await leerPerfilEmpresa(usuario.id);
  return exito(resultado);
}

export async function guardarPerfil(
  usuario: CurrentUser,
  datos: PerfilEmpresa,
): Promise<Resultado<{ perfil: PerfilEmpresa }>> {
  const negado = sinPermiso(usuario, "empresa");
  if (negado) return negado;

  const resultado = await guardarPerfilEmpresa(usuario.id, datos);
  if (!resultado.ok) {
    return falla("conflict", "Ese CUIT ya está cargado en otra cuenta. Si es de tu empresa, escribile a la Oficina de Empleo.");
  }
  return exito({ perfil: resultado.perfil });
}

/** The company's offers in every status, newest first (P09, P12). Never applicant data. */
export async function verMisOfertas(usuario: CurrentUser): Promise<Resultado<OfertaEmpresa[]>> {
  const negado = sinPermiso(usuario, "empresa");
  if (negado) return negado;

  const ofertas = await listarOfertasDeEmpresa(usuario.id);
  return exito(ofertas.map(aOfertaEmpresa));
}

/**
 * Sends a new offer (P11, RF1.3.3). It is created "pendiente": there are no
 * drafts (D-007) and the Office reviews it before it is published. An empty
 * pay field means the offer shows no pay.
 */
export async function publicarOferta(
  usuario: CurrentUser,
  datos: DatosNuevaOferta,
): Promise<Resultado<{ oferta: OfertaEmpresa }>> {
  const negado = sinPermiso(usuario, "empresa");
  if (negado) return negado;

  const { perfil } = await leerPerfilEmpresa(usuario.id);
  if (!perfil) {
    return falla("conflict", "Tenés que completar los datos de tu empresa antes de publicar una oferta.");
  }

  const id = await crearOferta({ ...datos, sueldo: datos.sueldo || null });
  const oferta = await leerOferta(id);
  if (!oferta) throw new Error("The new offer cannot be read back.");
  return exito({ oferta: aOfertaEmpresa(oferta) });
}

/**
 * The close request (RF1.3.6): a flag, not a status; the offer stays published
 * until the Office closes it (D-008). Another company's offer gets the same
 * "not found" as one that does not exist, so nothing leaks. Asking twice is
 * not an error.
 *
 * While a referred applicant has no "Contrata / No contrata" yet, the request
 * is refused (D-055): closing is when the company already knows what happened
 * with each person, so it answers first.
 */
export async function pedirCierre(usuario: CurrentUser, ofertaId: string): Promise<Resultado<{ oferta: OfertaEmpresa }>> {
  const negado = sinPermiso(usuario, "empresa");
  if (negado) return negado;

  const oferta = await leerOferta(ofertaId);
  if (!oferta || oferta.empresaId !== usuario.id) {
    return falla("not_found", "No encontramos esa oferta.");
  }
  if (oferta.estado !== "publicada") {
    return falla("conflict", "Solo se puede pedir el cierre de una oferta publicada.");
  }
  if (!oferta.cierreSolicitado) {
    const candidatos = await listarCandidatosDerivados(usuario.id, oferta.id);
    const sinRespuesta = candidatos.filter((c) => c.decision === null).length;
    if (sinRespuesta > 0) {
      const personas = sinRespuesta === 1 ? "1 persona" : `${sinRespuesta} personas`;
      return falla(
        "conflict",
        `Antes de pedir el cierre, contanos si contrataste a ${personas} que te propuso la Oficina. Respondé en "Candidatos que te propuso la Oficina", en esta misma oferta.`,
      );
    }
    await marcarCierreSolicitado(oferta.id);
  }
  return exito({ oferta: aOfertaEmpresa({ ...oferta, cierreSolicitado: true }) });
}

const NO_ENCONTRADA = "No encontramos esa oferta.";
const CANDIDATO_NO_ENCONTRADO = "No encontramos a esa persona entre tus candidatos.";

/**
 * One of the company's own offers, for "Duplicar" to fill in the form (P11,
 * P12; D-048). Published offers of other companies are readable by RLS, so the
 * owner is checked here.
 */
export async function verMiOferta(usuario: CurrentUser, ofertaId: string): Promise<Resultado<{ oferta: OfertaEmpresa }>> {
  const negado = sinPermiso(usuario, "empresa");
  if (negado) return negado;

  const oferta = await leerOferta(ofertaId);
  if (!oferta || oferta.empresaId !== usuario.id) return falla("not_found", NO_ENCONTRADA);
  return exito({ oferta: aOfertaEmpresa(oferta) });
}

/** What the company may see of a referred applicant (D-044): no ids of its own, no status. */
function aCandidatoDerivado(candidato: Candidato): CandidatoDerivado {
  return {
    postulacionId: candidato.postulacionId,
    oferta: candidato.oferta,
    derivadoEl: candidato.derivadoEl,
    nombre: candidato.nombre,
    apellido: candidato.apellido,
    telefono: candidato.telefono,
    email: candidato.email,
    rubros: candidato.rubros,
    tieneCv: candidato.tieneCv,
    decision: candidato.decision,
    motivoNoContratacion: candidato.motivoNoContratacion,
  };
}

/**
 * A referred applicant of this company, or null. Another company's applicant,
 * or one the Office did not refer, answers the same as one that does not exist.
 */
async function leerCandidatoPropio(usuario: CurrentUser, postulacionId: string): Promise<Candidato | null> {
  const candidato = await leerCandidato(postulacionId);
  if (!candidato || candidato.empresaId !== usuario.id || candidato.estado !== "derivado") return null;
  return candidato;
}

/**
 * The applicants the Office referred to the company's offers (P09, P17;
 * RF1.6.3, D-044), or to one of them. Only referred ones: never other
 * applications nor the pool.
 */
export async function verCandidatosDerivados(
  usuario: CurrentUser,
  ofertaId?: string,
): Promise<Resultado<CandidatoDerivado[]>> {
  const negado = sinPermiso(usuario, "empresa");
  if (negado) return negado;

  if (ofertaId) {
    const oferta = await leerOferta(ofertaId);
    if (!oferta || oferta.empresaId !== usuario.id) return falla("not_found", NO_ENCONTRADA);
  }

  const candidatos = await listarCandidatosDerivados(usuario.id, ofertaId);
  return exito(candidatos.map(aCandidatoDerivado));
}

/**
 * "Contrata" / "No contrata" (RF1.6.4, D-044). Not hiring needs the reason;
 * when hiring, a reason is not kept. It is answered once: to correct it, the
 * company asks the Office.
 */
export async function decidirCandidato(
  usuario: CurrentUser,
  postulacionId: string,
  datos: DatosDecisionCandidato,
): Promise<Resultado<{ candidato: CandidatoDerivado }>> {
  const negado = sinPermiso(usuario, "empresa");
  if (negado) return negado;

  const candidato = await leerCandidatoPropio(usuario, postulacionId);
  if (!candidato) return falla("not_found", CANDIDATO_NO_ENCONTRADO);

  const yaDecidida = falla(
    "conflict",
    "Ya informaste tu decisión sobre esta persona. Si hay que corregirla, escribile a la Oficina de Empleo.",
  );
  if (candidato.decision) return yaDecidida;

  const motivo = datos.decision === "no_contratado" ? datos.motivo || null : null;
  if (datos.decision === "no_contratado" && !motivo) {
    return falla("invalid", "Contanos por qué no contratás a esta persona");
  }

  const guardada = await guardarDecisionEmpresa(postulacionId, datos.decision, motivo);
  if (!guardada) return yaDecidida;

  return exito({
    candidato: aCandidatoDerivado({ ...candidato, decision: datos.decision, motivoNoContratacion: motivo }),
  });
}

/** A short-lived signed link to the CV of an applicant referred to the company (RF1.6.3, RNF1, D-044). */
export async function abrirCvCandidato(usuario: CurrentUser, postulacionId: string): Promise<Resultado<{ url: string }>> {
  const negado = sinPermiso(usuario, "empresa");
  if (negado) return negado;

  const candidato = await leerCandidatoPropio(usuario, postulacionId);
  if (!candidato) return falla("not_found", CANDIDATO_NO_ENCONTRADO);
  if (!candidato.tieneCv) return falla("not_found", "Esta persona todavía no subió su CV.");

  return exito({ url: await crearUrlFirmadaCvParaEmpresa(candidato.postulanteId) });
}
