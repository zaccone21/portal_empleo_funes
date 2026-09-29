import type { Role } from "@/lib/validation/role";

/*
 * Where each role lives in the portal (D-020, D-028). Used by the navigation
 * (the "Inicio" of each role, where "Salir" leads) and by the simulated login.
 * The real server decides `destino` from the role stored in `profiles`, with
 * these same paths.
 */

/** Home of each role after logging in. */
export const INICIO_POR_ROL: Record<Role, string> = {
  applicant: "/ofertas",
  company: "/empresa",
  admin: "/admin",
};

/** Login screen of each role; "Salir" leads there. */
export const INGRESO_POR_ROL: Record<Role, string> = {
  applicant: "/postulante/ingresar",
  company: "/empresa/ingresar",
  admin: "/admin/ingresar",
};

/**
 * True for a path inside this site ("/…" but not "//…", which browsers read
 * as another site). Used before navigating to a path that came in the URL,
 * such as ?volver=, so a crafted link cannot send anyone elsewhere.
 */
export function esRutaInterna(ruta: string | undefined): ruta is string {
  return typeof ruta === "string" && /^\/(?!\/)/.test(ruta);
}
