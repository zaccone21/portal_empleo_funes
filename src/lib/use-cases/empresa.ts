import "server-only";

import type { CurrentUser } from "@/lib/dal/auth";
import { guardarPerfilEmpresa, leerPerfilEmpresa } from "@/lib/dal/empresas";
import { crearOferta, leerOferta, listarOfertasDeEmpresa, marcarCierreSolicitado } from "@/lib/dal/ofertas";
import type { PerfilEmpresa } from "@/lib/validation/empresa";
import type { DatosNuevaOferta, OfertaEmpresa } from "@/lib/validation/ofertas";

import { aOfertaEmpresa } from "./dto-ofertas";
import { exito, falla, sinPermiso, type Resultado } from "./resultado";

/*
 * The company area (P09-P12; RF1.3.1-RF1.3.6; D-027). Every action is for the
 * company role, and a company only ever touches its own data and offers (RLS
 * checks the same again, RNF2).
 */

export async function verPerfilEmpresa(usuario: CurrentUser): Promise<Resultado<{ perfil: PerfilEmpresa | null }>> {
  const negado = sinPermiso(usuario, "empresa");
  if (negado) return negado;

  return exito({ perfil: await leerPerfilEmpresa(usuario.id) });
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
    await marcarCierreSolicitado(oferta.id);
  }
  return exito({ oferta: aOfertaEmpresa({ ...oferta, cierreSolicitado: true }) });
}
