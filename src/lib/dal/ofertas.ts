import "server-only";

import { z } from "zod";

import { COLUMNAS_EMPRESA, aPerfilEmpresa, filaEmpresaSchema } from "@/lib/dal/empresas";
import { fechaSchema } from "@/lib/dal/fecha";
import { createClient } from "@/lib/supabase/server";
import { calcularRango, crearRespuestaPaginada, type ParametrosPaginacion, type RespuestaPaginada } from "@/lib/paginacion";
import type { PerfilEmpresa } from "@/lib/validation/empresa";
import {
  estadoOfertaSchema,
  modalidadLaboralSchema,
  tipoJornadaSchema,
  type EstadoOferta,
  type ModalidadLaboral,
  type TipoJornada,
} from "@/lib/validation/ofertas";
import { rubroSchema, type Rubro } from "@/lib/validation/rubros";
import { limpiarFiltroPostgrest } from "@/lib/validation/texto";

/*
 * Offers in the database (`ofertas` + `oferta_rubros`). Every query uses the
 * session client, so RLS decides which rows each role sees (D-032): the public
 * and applicants see published offers, a company its own, the Office all.
 */

export type Oferta = {
  id: string;
  empresaId: string;
  titulo: string;
  descripcion: string;
  requisitos: string;
  lugar: string;
  jornada: string;
  modalidad: ModalidadLaboral;
  tipoJornada: TipoJornada;
  sueldo: string | null;
  rubros: Rubro[];
  estado: EstadoOferta;
  motivoRechazo: string | null;
  cierreSolicitado: boolean;
  creadaEl: string;
  publicadaEl: string | null;
};

/** An offer as the Office sees it: plus the company's account email, its data (null until P10) and how many applied. */
export type OfertaConEmpresa = Oferta & {
  emailEmpresa: string;
  empresa: PerfilEmpresa | null;
  cantidadPostulaciones: number;
};

const COLUMNAS_OFERTA =
  "id, empresa_id, titulo, descripcion, requisitos, lugar, jornada, modalidad, tipo_jornada, sueldo, estado, motivo_rechazo, cierre_solicitado, creada_el, publicada_el, oferta_rubros(rubros(slug))";

const COLUMNAS_OFICINA = `${COLUMNAS_OFERTA}, empresas(${COLUMNAS_EMPRESA}, perfiles(email)), postulaciones(count)`;

const filaOfertaSchema = z.object({
  id: z.string(),
  empresa_id: z.string(),
  titulo: z.string(),
  descripcion: z.string(),
  requisitos: z.string(),
  lugar: z.string(),
  jornada: z.string(),
  modalidad: modalidadLaboralSchema.default("presencial"),
  tipo_jornada: tipoJornadaSchema.default("completa"),
  sueldo: z.string().nullable(),
  estado: estadoOfertaSchema,
  motivo_rechazo: z.string().nullable(),
  cierre_solicitado: z.boolean(),
  creada_el: fechaSchema,
  publicada_el: fechaSchema.nullable(),
  oferta_rubros: z.array(z.object({ rubros: z.object({ slug: rubroSchema }) })),
});

const filaOficinaSchema = filaOfertaSchema.extend({
  empresas: filaEmpresaSchema.extend({ perfiles: z.object({ email: z.string() }) }),
  postulaciones: z.array(z.object({ count: z.number() })),
});

function aOferta(fila: z.infer<typeof filaOfertaSchema>): Oferta {
  return {
    id: fila.id,
    empresaId: fila.empresa_id,
    titulo: fila.titulo,
    descripcion: fila.descripcion,
    requisitos: fila.requisitos,
    lugar: fila.lugar,
    jornada: fila.jornada,
    modalidad: fila.modalidad,
    tipoJornada: fila.tipo_jornada,
    sueldo: fila.sueldo,
    rubros: fila.oferta_rubros.map((r) => r.rubros.slug),
    estado: fila.estado,
    motivoRechazo: fila.motivo_rechazo,
    cierreSolicitado: fila.cierre_solicitado,
    creadaEl: fila.creada_el,
    publicadaEl: fila.publicada_el,
  };
}

function aOfertaConEmpresa(fila: z.infer<typeof filaOficinaSchema>): OfertaConEmpresa {
  return {
    ...aOferta(fila),
    emailEmpresa: fila.empresas.perfiles.email,
    empresa: aPerfilEmpresa(fila.empresas),
    cantidadPostulaciones: fila.postulaciones[0]?.count ?? 0,
  };
}

/** Published offers, newest first (P01, P05). */
export async function listarOfertasPublicadas(): Promise<Oferta[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ofertas")
    .select(COLUMNAS_OFERTA)
    .eq("estado", "publicada")
    .order("publicada_el", { ascending: false })
    .limit(200);

  if (error) throw new Error("Could not load the published offers.");
  return z.array(filaOfertaSchema).parse(data).map(aOferta);
}

/** One company's offers in every status, newest first (P09, P12). */
export async function listarOfertasDeEmpresa(empresaId: string): Promise<Oferta[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ofertas")
    .select(COLUMNAS_OFERTA)
    .eq("empresa_id", empresaId)
    .order("creada_el", { ascending: false });

  if (error) throw new Error("Could not load the company's offers.");
  return z.array(filaOfertaSchema).parse(data).map(aOferta);
}

/** One offer, or null if it does not exist or RLS hides it from this user. */
export async function leerOferta(id: string): Promise<Oferta | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("ofertas").select(COLUMNAS_OFERTA).eq("id", id).maybeSingle();

  if (error) {
    if (error.code === "22P02") return null;
    throw new Error("Could not load the offer.");
  }
  return data ? aOferta(filaOfertaSchema.parse(data)) : null;
}

export type DatosOfertaNueva = {
  titulo: string;
  descripcion: string;
  requisitos: string;
  lugar: string;
  jornada: string;
  modalidad?: ModalidadLaboral;
  tipoJornada?: TipoJornada;
  sueldo: string | null;
  rubros: Rubro[];
};

/**
 * Creates an offer with its trades in one transaction, through the database
 * function crear_oferta (D-032). The company comes from the session inside
 * the function, never from here. Returns the new offer's id.
 */
export async function crearOferta(datos: DatosOfertaNueva): Promise<string> {
  const supabase = await createClient();

  const slugs = [...new Set(datos.rubros)];
  const { data: rubros, error: errorRubros } = await supabase.from("rubros").select("id").in("slug", slugs);
  if (errorRubros) throw new Error("Could not load the trades.");
  const idsRubros = z.array(z.object({ id: z.number() })).parse(rubros).map((r) => r.id);
  if (idsRubros.length !== slugs.length) throw new Error("Some trade is not in the database.");

  const { data, error } = await supabase.rpc("crear_oferta", {
    titulo: datos.titulo,
    descripcion: datos.descripcion,
    requisitos: datos.requisitos,
    lugar: datos.lugar,
    jornada: datos.jornada,
    sueldo: datos.sueldo,
    rubros: idsRubros,
    modalidad: datos.modalidad ?? "presencial",
    tipo_jornada: datos.tipoJornada ?? "completa",
  });

  if (error) throw new Error("Could not create the offer.");
  return z.string().parse(data);
}

/** The company's close request (RF1.3.6). RLS and the database trigger allow it only on its own published offer. */
export async function marcarCierreSolicitado(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("ofertas").update({ cierre_solicitado: true }).eq("id", id);
  if (error) throw new Error("Could not request the closing.");
}

/** Every offer with its company and application count, newest first (P15). */
export async function listarOfertasParaOficina(): Promise<OfertaConEmpresa[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ofertas")
    .select(COLUMNAS_OFICINA)
    .order("creada_el", { ascending: false });

  if (error) {

    throw new Error("Could not load the offers.");
  }
  return z.array(filaOficinaSchema).parse(data).map(aOfertaConEmpresa);
}

export async function leerOfertaParaOficina(id: string): Promise<OfertaConEmpresa | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("ofertas").select(COLUMNAS_OFICINA).eq("id", id).maybeSingle();

  if (error) {
    if (error.code === "22P02") return null;

    throw new Error("Could not load the offer.");
  }
  return data ? aOfertaConEmpresa(filaOficinaSchema.parse(data)) : null;
}

/**
 * The Office's decision on an offer. Publishing stamps publicada_el in the
 * database (trigger antes_de_actualizar_oferta).
 */
export async function actualizarEstadoOferta(
  id: string,
  cambios: { estado: EstadoOferta; motivoRechazo?: string },
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("ofertas")
    .update({ estado: cambios.estado, ...(cambios.motivoRechazo ? { motivo_rechazo: cambios.motivoRechazo } : {}) })
    .eq("id", id);
  if (error) throw new Error("Could not update the offer.");
}

/** How many offers are in a status, optionally only those with a close request (P14). */
export async function contarOfertas(estado: EstadoOferta, soloConPedidoDeCierre = false): Promise<number> {
  const supabase = await createClient();
  let consulta = supabase.from("ofertas").select("id", { count: "exact", head: true }).eq("estado", estado);
  if (soloConPedidoDeCierre) consulta = consulta.eq("cierre_solicitado", true);

  const { count, error } = await consulta;
  if (error) throw new Error("Could not count the offers.");
  return count ?? 0;
}

export type FiltrosConsultaOfertas = {
  q?: string;
  rubro?: Rubro | null;
  modalidad?: ModalidadLaboral | "";
  tipoJornada?: TipoJornada | "";
  pago?: "con_sueldo" | "a_convenir" | "todos";
  orden?: "recientes" | "antiguas";
};

/**
 * Paged published offers using native Supabase .range() with complete server-side filters.
 */
export async function listarOfertasPublicadasPaginadas(
  paginacion: ParametrosPaginacion = { pagina: 1, porPagina: 12 },
  filtros: FiltrosConsultaOfertas = {},
): Promise<RespuestaPaginada<Oferta>> {
  const supabase = await createClient();
  const { desde, hasta } = calcularRango(paginacion.pagina, paginacion.porPagina);

  let query = supabase
    .from("ofertas")
    .select(COLUMNAS_OFERTA, { count: "exact" })
    .eq("estado", "publicada");

  if (filtros.rubro) {
    const { data: relaciones, error: errRelaciones } = await supabase
      .from("oferta_rubros")
      .select("oferta_id, rubros!inner(slug)")
      .eq("rubros.slug", filtros.rubro);

    if (errRelaciones) throw new Error("Could not filter by trade: " + errRelaciones.message);
    const idsConRubro = relaciones?.map((r) => r.oferta_id) ?? [];
    if (idsConRubro.length === 0) {
      return crearRespuestaPaginada([], 0, paginacion.pagina, paginacion.porPagina);
    }
    query = query.in("id", idsConRubro);
  }

  if (filtros.modalidad) {
    query = query.eq("modalidad", filtros.modalidad);
  }

  if (filtros.tipoJornada) {
    query = query.eq("tipo_jornada", filtros.tipoJornada);
  }

  if (filtros.pago === "con_sueldo") {
    query = query
      .not("sueldo", "is", null)
      .neq("sueldo", "")
      .not("sueldo", "ilike", "%convenir%");
  } else if (filtros.pago === "a_convenir") {
    query = query.or("sueldo.is.null,sueldo.eq.'',sueldo.ilike.%convenir%");
  }

  if (filtros.q && filtros.q.trim()) {
    const qLimpio = limpiarFiltroPostgrest(filtros.q);
    if (qLimpio) {
      query = query.or(`titulo.ilike.%${qLimpio}%,descripcion.ilike.%${qLimpio}%,lugar.ilike.%${qLimpio}%`);
    }
  }

  const ascendente = filtros.orden === "antiguas";
  const { data, error, count } = await query
    .order("publicada_el", { ascending: ascendente })
    .range(desde, hasta);

  if (error) throw new Error("Could not load paged published offers: " + error.message);
  const items = z.array(filaOfertaSchema).parse(data).map(aOferta);
  return crearRespuestaPaginada(items, count ?? 0, paginacion.pagina, paginacion.porPagina);
}
