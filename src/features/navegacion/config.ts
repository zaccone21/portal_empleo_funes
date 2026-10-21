import {
  Briefcase,
  Building2,
  CircleAlert,
  ClipboardCheck,
  ClipboardList,
  FileUser,
  LayoutDashboard,
  Send,
  UserCog,
  Users,
  type LucideIcon,
} from "lucide-react";

export type ConteoMenu = "ofertasPendientes" | "postulacionesNuevas" | "cierresSolicitados" | "porDerivar";

export type NavItem = {
  titulo: string;
  url: string;
  icono: LucideIcon;
  /** Which sidebar counter this item shows (it is hidden when the value is 0). */
  idConteo?: ConteoMenu;
};

export type NavGroup = {
  titulo: string;
  items: NavItem[];
};

/**
 * Navigation of the Employment Office (D-042). Every item has its own route:
 * the queues are routes, not query variants of the registers.
 */
export const MENU_ADMIN: NavGroup[] = [
  {
    titulo: "Resumen",
    items: [{ titulo: "Dashboard", url: "/admin", icono: LayoutDashboard }],
  },
  {
    titulo: "Tareas pendientes",
    items: [
      { titulo: "Ofertas por revisar", url: "/admin/ofertas/por-revisar", icono: ClipboardCheck, idConteo: "ofertasPendientes" },
      { titulo: "Postulaciones nuevas", url: "/admin/postulaciones/por-evaluar", icono: ClipboardList, idConteo: "postulacionesNuevas" },
      { titulo: "Cierres solicitados", url: "/admin/ofertas/cierres-solicitados", icono: CircleAlert, idConteo: "cierresSolicitados" },
      { titulo: "Por comunicar / derivar", url: "/admin/por-comunicar", icono: Send, idConteo: "porDerivar" },
    ],
  },
  {
    titulo: "Gestión",
    items: [
      { titulo: "Ofertas", url: "/admin/ofertas", icono: Briefcase },
      { titulo: "Postulaciones", url: "/admin/postulaciones", icono: FileUser },
      { titulo: "Postulantes", url: "/admin/postulantes", icono: Users },
      { titulo: "Empresas", url: "/admin/empresas", icono: Building2 },
    ],
  },
  {
    titulo: "Oficina",
    items: [{ titulo: "Equipo", url: "/admin/equipo", icono: UserCog }],
  },
];

const TODOS = MENU_ADMIN.flatMap((grupo) => grupo.items);

/** The evaluation screen (/admin/postulaciones/<id>) belongs to the "new applications" queue. */
function rutaEfectiva(pathname: string): string {
  const resto = pathname.match(/^\/admin\/postulaciones\/([^/]+)$/)?.[1];
  return resto && resto !== "por-evaluar" ? "/admin/postulaciones/por-evaluar" : pathname;
}

/** The single active item of the menu: the one with the longest URL that matches the path. */
export function itemActivo(pathname: string): NavItem | undefined {
  const ruta = rutaEfectiva(pathname);
  return TODOS.filter((item) => ruta === item.url || ruta.startsWith(`${item.url}/`)).sort(
    (a, b) => b.url.length - a.url.length,
  )[0];
}

/** Group + item title for the breadcrumb ("Gestión › Ofertas"), or null for unknown paths. */
export function migasDeRuta(pathname: string): string[] | null {
  const item = itemActivo(pathname);
  if (!item) return null;
  const grupo = MENU_ADMIN.find((g) => g.items.includes(item));
  return grupo ? [grupo.titulo, item.titulo] : null;
}

