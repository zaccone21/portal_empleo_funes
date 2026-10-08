import {
  BriefcaseBusinessIcon,
  Building2Icon,
  HouseIcon,
  LayoutDashboardIcon,
  ListChecksIcon,
  LogInIcon,
  PlusIcon,
  UserIcon,
  UserPlusIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react";

import { INGRESO_POR_ROL } from "@/lib/rutas";
import type { UsuarioSesion } from "@/lib/validation/auth";
import type { Role } from "@/lib/validation/role";

export type ItemNavegacion = {
  href: string;
  texto: string;
  icono: LucideIcon;
  /** The role's main action: painted solid in the bottom bar (for example "Publicar"). */
  destacado?: boolean;
};

/**
 * Main menu of each role (D-028), the same on desktop (top bar) and on phones
 * (bottom bar). Short words, so four items fit on a 360px phone.
 */
export const ITEM_PERFIL_POR_ROL: Record<Role, ItemNavegacion> = {
  postulante: { href: "/postulante/perfil", texto: "Mi perfil", icono: UserIcon },
  empresa: { href: "/empresa/perfil", texto: "Mi empresa", icono: Building2Icon },
  admin: { href: "/admin", texto: "Panel", icono: LayoutDashboardIcon },
};

export const ITEMS_POR_ROL: Record<Role, ItemNavegacion[]> = {
  postulante: [
    { href: "/ofertas", texto: "Ofertas", icono: BriefcaseBusinessIcon },
    { href: "/postulante/postulaciones", texto: "Postulaciones", icono: ListChecksIcon },
  ],
  empresa: [
    { href: "/empresa", texto: "Inicio", icono: HouseIcon },
    { href: "/empresa/ofertas", texto: "Mis ofertas", icono: ListChecksIcon },
    { href: "/empresa/ofertas/nueva", texto: "Publicar", icono: PlusIcon, destacado: true },
  ],
  admin: [
    { href: "/admin/ofertas", texto: "Ofertas", icono: BriefcaseBusinessIcon },
    { href: "/admin/postulantes", texto: "Postulantes", icono: UsersIcon },
  ],
};

/** What anyone can open without an account in each area (the public offer list). */
const ITEMS_PUBLICOS: Record<Role, ItemNavegacion[]> = {
  postulante: [{ href: "/ofertas", texto: "Ofertas", icono: BriefcaseBusinessIcon }],
  empresa: [],
  admin: [],
};

const REGISTRO: Partial<Record<Role, ItemNavegacion>> = {
  postulante: { href: "/postulante/registrarse", texto: "Crear cuenta", icono: UserPlusIcon },
  empresa: { href: "/empresa/registrarse", texto: "Registrarse", icono: UserPlusIcon },
};

/**
 * Items of the menu for who is looking (`usuario` from useSesion) in an area
 * (the layout's role):
 * - logged in: that person's role menu, wherever they are;
 * - nobody: the public items of the area; on phones (`conAcceso`) also
 *   "Ingresar" and, where it exists, the registration, because the bottom bar
 *   is the only menu there;
 * - still loading: nothing, so no wrong menu flashes for a moment.
 */
export function itemsNavegacion(
  usuario: UsuarioSesion | null | undefined,
  area: Role,
  conAcceso: boolean,
): ItemNavegacion[] {
  if (usuario === undefined) return [];
  if (usuario) {
    const items = [...ITEMS_POR_ROL[usuario.rol]];
    if (conAcceso) {
      items.push(ITEM_PERFIL_POR_ROL[usuario.rol]);
    }
    return items;
  }

  const publicos = ITEMS_PUBLICOS[area];
  if (!conAcceso) return publicos;

  const ingresar: ItemNavegacion = { href: INGRESO_POR_ROL[area], texto: "Ingresar", icono: LogInIcon };
  const registro = REGISTRO[area];

  return [...publicos, ingresar, ...(registro ? [registro] : [])];
}
