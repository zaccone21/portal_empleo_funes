import { cookies } from "next/headers";

import type { UsuarioSesion } from "@/lib/validation/auth";
import type { Role } from "@/lib/validation/role";

/*
 * TEMPORARY (DT-003, D-028): simulated login while Supabase Auth is not
 * connected. Three test users, one per role, accept any password. The session
 * is a cookie with the role and the email; nothing is secret here, and in
 * production every simulated route answers 404 (respuestas.ts).
 */

export const COOKIE_SESION = "portal_sesion_simulada";

/** Test users (obviously fake, D-009). */
export const USUARIOS_DE_PRUEBA: Record<string, Role> = {
  "postulante@ejemplo.com": "applicant",
  "empresa@ejemplo.com": "company",
  "oficina@ejemplo.com": "admin",
};

const ROLES: Role[] = ["applicant", "company", "admin"];

/** The simulated user of this request, or null. The cookie is "<role>|<email>". */
export async function leerSesion(): Promise<UsuarioSesion | null> {
  const valor = (await cookies()).get(COOKIE_SESION)?.value;
  const [rol, email] = valor?.split("|") ?? [];
  const rolValido = ROLES.find((r) => r === rol);
  return rolValido && email ? { rol: rolValido, email } : null;
}

export async function iniciarSesion(usuario: UsuarioSesion) {
  (await cookies()).set(COOKIE_SESION, `${usuario.rol}|${usuario.email}`, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
}

export async function cerrarSesion() {
  (await cookies()).delete(COOKIE_SESION);
}

const MENSAJE_OTRO_ROL: Record<Role, string> = {
  applicant: "Esta sección es para quienes buscan trabajo. Ingresá con tu cuenta de postulante.",
  company: "Esta sección es para empresas. Ingresá con la cuenta de tu empresa.",
  admin: "Esta sección es para la Oficina de Empleo.",
};

/**
 * What the real Route Handlers and use cases do first: 401 without a session,
 * 403 when the logged-in role is not the one the section is for (AGENTS §7).
 * Returns the logged-in user when the request may go on, or the response to
 * send (check with `instanceof Response`).
 */
export async function exigirRol(rol: Role): Promise<UsuarioSesion | Response> {
  const usuario = await leerSesion();
  if (!usuario) {
    return Response.json({ error: "Ingresá con tu cuenta para ver esto." }, { status: 401 });
  }
  if (usuario.rol !== rol) {
    return Response.json({ error: MENSAJE_OTRO_ROL[rol] }, { status: 403 });
  }
  return usuario;
}
