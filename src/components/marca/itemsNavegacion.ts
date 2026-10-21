import {
  BriefcaseBusinessIcon,
  Building2Icon,
  CircleHelpIcon,
  HouseIcon,
  LayoutDashboardIcon,
  ListChecksIcon,
  LogInIcon,
  PlusIcon,
  UserIcon,
  UserPlusIcon,
  type LucideIcon,
} from "lucide-react";

import { INGRESO_POR_ROL } from "@/lib/rutas";
import type { UsuarioSesion } from "@/lib/validation/auth";
import type { Role } from "@/lib/validation/role";

export type ItemNavegacion = {
  href: string;
  texto: string;
  icono: LucideIcon;
  /** The role's main action: painted solid in both bars (for example "Publicar"). */
  destacado?: boolean;
};

/** The guides and frequent questions (P20): for applicants and companies, never the Office. */
export const ITEM_AYUDA: ItemNavegacion = { href: "/ayuda", texto: "Ayuda", icono: CircleHelpIcon };

/**
 * Main menu of each role (D-028). Short words, so four items fit on a 360px
 * phone. The profile is the last item of the role's own menu.
 */
export const ITEM_PERFIL_POR_ROL: Record<Role, ItemNavegacion> = {
  postulante: { href: "/postulante/perfil", texto: "Mi perfil", icono: UserIcon },
  empresa: { href: "/empresa/perfil", texto: "Mi empresa", icono: Building2Icon },
  admin: { href: "/admin", texto: "Panel", icono: LayoutDashboardIcon },
};

const INICIO_POSTULANTE: ItemNavegacion = { href: "/", texto: "Inicio", icono: HouseIcon };
const OFERTAS: ItemNavegacion = { href: "/ofertas", texto: "Ofertas", icono: BriefcaseBusinessIcon };

export const ITEMS_POR_ROL: Record<Role, ItemNavegacion[]> = {
  postulante: [
    INICIO_POSTULANTE,
    OFERTAS,
    { href: "/postulante/postulaciones", texto: "Postulaciones", icono: ListChecksIcon },
  ],
  empresa: [
    { href: "/empresa", texto: "Inicio", icono: HouseIcon },
    { href: "/empresa/ofertas", texto: "Mis ofertas", icono: ListChecksIcon },
    { href: "/empresa/ofertas/nueva", texto: "Publicar", icono: PlusIcon, destacado: true },
  ],
  admin: [],
};

/** What anyone can open without an account in each area. */
const ITEMS_PUBLICOS: Record<Role, ItemNavegacion[]> = {
  postulante: [
    INICIO_POSTULANTE,
    OFERTAS,
    { href: "/empresa/ingresar", texto: "Para empresas", icono: Building2Icon },
  ],
  empresa: [OFERTAS],
  admin: [],
};

/** Registration of each area; the Office has none (RF1.1.4). */
export const REGISTRO_POR_AREA: Partial<Record<Role, ItemNavegacion>> = {
  postulante: { href: "/postulante/registrarse", texto: "Crear cuenta", icono: UserPlusIcon },
  empresa: { href: "/empresa/registrarse", texto: "Registrarse", icono: UserPlusIcon },
};

/** Help is for applicants and companies; the Office is left out (it does not need the guides). */
function conAyuda(items: ItemNavegacion[], rol: Role): ItemNavegacion[] {
  return rol === "admin" ? items : [...items, ITEM_AYUDA];
}

/**
 * Items of the menu for who is looking (`usuario` from useSesion) in an area
 * (the layout's role), on desktop (top bar) or on the phone (`celular`,
 * bottom bar, 3 or 4 items):
 * - logged in: that person's role menu, wherever they are, with the profile
 *   and "Ayuda". On the phone the applicant drops "Inicio" (the logo already
 *   leads there) and the company drops "Ayuda" (it is on its home), so the bar
 *   keeps four items;
 * - nobody: the public items of the area and "Ayuda"; on the phone, "Ingresar"
 *   and the registration instead of the desktop links, because the bottom bar
 *   is the only menu there (on desktop they are buttons on the right);
 * - still loading: nothing, so no wrong menu flashes for a moment.
 */
export function itemsNavegacion(
  usuario: UsuarioSesion | null | undefined,
  area: Role,
  celular: boolean,
): ItemNavegacion[] {
  if (usuario === undefined) return [];

  if (usuario) {
    const { rol } = usuario;
    const completo = conAyuda([...ITEMS_POR_ROL[rol], ITEM_PERFIL_POR_ROL[rol]], rol);
    if (!celular || rol === "admin") return completo;
    if (rol === "postulante") return completo.filter((item) => item !== INICIO_POSTULANTE);
    return completo.filter((item) => item !== ITEM_AYUDA);
  }

  if (!celular) return conAyuda(ITEMS_PUBLICOS[area], area);

  const ingresar: ItemNavegacion = { href: INGRESO_POR_ROL[area], texto: "Ingresar", icono: LogInIcon };
  const registro = REGISTRO_POR_AREA[area];
  const publicos = area === "postulante" ? [OFERTAS] : [];
  return conAyuda([...publicos, ingresar, ...(registro ? [registro] : [])], area);
}
