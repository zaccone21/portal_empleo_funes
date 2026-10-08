import {
  BriefcaseBusiness,
  Building2,
  CheckSquare,
  FileText,
  LayoutDashboard,
  Users,
  AlertCircle,
  Inbox
} from "lucide-react";

export type NavItem = {
  titulo: string;
  url: string;
  icono: React.ElementType;
  /** ID para mapear el conteo que viene del backend */
  idConteo?: "ofertasPendientes" | "postulacionesNuevas" | "cierresSolicitados" | "porDerivar";
};

export type NavGroup = {
  titulo: string;
  items: NavItem[];
};

/**
 * Configuración de navegación para la vista de Administración de la Oficina de Empleo.
 */
export const MENU_ADMIN: NavGroup[] = [
  {
    titulo: "Resumen",
    items: [
      {
        titulo: "Dashboard",
        url: "/admin",
        icono: LayoutDashboard,
      },
    ],
  },
  {
    titulo: "Tareas pendientes",
    items: [
      {
        titulo: "Ofertas por revisar",
        url: "/admin/ofertas?estado=pendiente",
        icono: CheckSquare,
        idConteo: "ofertasPendientes",
      },
      {
        titulo: "Postulaciones nuevas",
        url: "/admin/ofertas?vista=nuevas",
        icono: Inbox,
        idConteo: "postulacionesNuevas",
      },
      {
        titulo: "Cierres solicitados",
        url: "/admin/ofertas?estado=publicada",
        icono: AlertCircle,
        idConteo: "cierresSolicitados",
      },
      {
        titulo: "Por comunicar / derivar",
        url: "/admin/ofertas?vista=por-comunicar",
        icono: FileText,
        idConteo: "porDerivar",
      },
    ],
  },
  {
    titulo: "Gestión",
    items: [
      {
        titulo: "Ofertas",
        url: "/admin/ofertas",
        icono: BriefcaseBusiness,
      },
      {
        titulo: "Postulantes",
        url: "/admin/postulantes",
        icono: Users,
      },
      {
        titulo: "Empresas",
        url: "/admin/empresas",
        icono: Building2,
      },
    ],
  },
];
