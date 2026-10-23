import {
  BadgeCheckIcon,
  Building2Icon,
  ClipboardCheckIcon,
  FileUpIcon,
  ListChecksIcon,
  LifeBuoyIcon,
  PlusIcon,
  SearchIcon,
  UserPlusIcon,
  UserRoundCheckIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react";

/*
 * Content of the help screen (P20): step-by-step guides and frequent
 * questions for applicants and companies. The Office is left out: it is
 * trained in person and has its own screens.
 *
 * Every answer describes what the portal does today, with the same button
 * names the screens show, and cites the rule it comes from, so the text is
 * updated when that rule changes.
 */

export type Publico = "postulante" | "empresa";

export type PasoGuia = {
  titulo: string;
  texto: string;
  icono: LucideIcon;
  /** Where to do it, when the step has its own screen. */
  enlace?: { href: string; texto: string };
};

export type PreguntaFrecuente = { pregunta: string; respuesta: string };

export const GUIAS: Record<Publico, PasoGuia[]> = {
  postulante: [
    {
      titulo: "Creá tu cuenta",
      texto:
        "Tocá “Crear cuenta” y escribí tu email y una contraseña de 8 caracteres o más. Te llega un email: abrilo y tocá el botón para activar la cuenta.",
      icono: UserPlusIcon,
      enlace: { href: "/postulante/registrarse", texto: "Crear cuenta" },
    },
    {
      titulo: "Completá tu perfil",
      texto:
        "En “Mi perfil”, tocá “Editar datos” y cargá tu nombre, apellido, DNI y teléfono. Elegí todos los rubros en los que sabés trabajar y, si querés, contá tu experiencia.",
      icono: UserRoundCheckIcon,
      enlace: { href: "/postulante/perfil", texto: "Ir a Mi perfil" },
    },
    {
      titulo: "Subí tu CV",
      texto:
        "También en “Mi perfil”, elegí tu CV en PDF (hasta 5 MB) y tocá “Subir CV”. Si después subís otro, reemplaza al anterior.",
      icono: FileUpIcon,
      enlace: { href: "/postulante/perfil#cv", texto: "Subir mi CV" },
    },
    {
      titulo: "Buscá y postulate",
      texto:
        "En “Ofertas”, buscá por puesto o barrio, o tocá un rubro. Abrí la oferta que te interesa y tocá “Postularme”.",
      icono: SearchIcon,
      enlace: { href: "/ofertas", texto: "Ver ofertas" },
    },
    {
      titulo: "Esperá el llamado de la Oficina",
      texto:
        "La Oficina de Empleo revisa cada postulación. Si tu perfil encaja, te contacta por teléfono o por email y puede proponerte a la empresa. En “Postulaciones” ves a qué ofertas te postulaste.",
      icono: ListChecksIcon,
      enlace: { href: "/postulante/postulaciones", texto: "Ver mis postulaciones" },
    },
  ],
  empresa: [
    {
      titulo: "Registrá tu empresa",
      texto:
        "Tocá “Registrar mi empresa” y escribí un email y una contraseña de 8 caracteres o más. Te llega un email: abrilo y tocá el botón para activar la cuenta.",
      icono: UserPlusIcon,
      enlace: { href: "/empresa/registrarse", texto: "Registrar mi empresa" },
    },
    {
      titulo: "Completá los datos de la empresa",
      texto:
        "En “Mi empresa”, tocá “Editar datos” y cargá la razón social, el CUIT y quién es el contacto, con su teléfono y email. La Oficina usa ese contacto para hablar con vos.",
      icono: Building2Icon,
      enlace: { href: "/empresa/perfil", texto: "Ir a Mi empresa" },
    },
    {
      titulo: "Esperá la aprobación de la Oficina",
      texto:
        "La Oficina de Empleo revisa tu empresa antes de que puedas publicar. Hasta entonces ves el aviso “Tu empresa está en revisión”. Si no la aprueba, te dice el motivo: corregí los datos y la revisa de nuevo.",
      icono: BadgeCheckIcon,
      enlace: { href: "/empresa", texto: "Ver cómo va mi empresa" },
    },
    {
      titulo: "Publicá una oferta",
      texto:
        "En “Publicar”, completá el puesto, la descripción, los requisitos, la dirección del trabajo, el horario y de 1 a 3 rubros. El sueldo es opcional. Tocá “Enviar oferta”: queda Pendiente.",
      icono: PlusIcon,
      enlace: { href: "/empresa/ofertas/nueva", texto: "Publicar una oferta" },
    },
    {
      titulo: "La Oficina la revisa",
      texto:
        "La Oficina de Empleo aprueba la oferta y se publica en el portal, o la rechaza con un motivo. Las dos cosas las ves en “Mis ofertas”.",
      icono: ClipboardCheckIcon,
      enlace: { href: "/empresa/ofertas", texto: "Ver mis ofertas" },
    },
    {
      titulo: "Conocé a los candidatos",
      texto:
        "La Oficina evalúa a quienes se postulan y te propone a los que encajan. Los ves en el detalle de la oferta, en “Candidatos que te propuso la Oficina”, con su teléfono, email y CV.",
      icono: UsersIcon,
    },
    {
      titulo: "Contanos qué pasó",
      texto:
        "Por cada candidato, tocá “Sí, la contraté” o “No la contraté” (con el motivo). Cuando terminaste de buscar, tocá “Pedir el cierre” y la Oficina cierra la oferta.",
      icono: BadgeCheckIcon,
    },
  ],
};

export const PREGUNTAS: Record<Publico, PreguntaFrecuente[]> = {
  postulante: [
    {
      pregunta: "¿Por qué no veo en qué estado está mi postulación?",
      respuesta:
        "La Oficina de Empleo revisa cada postulación y se comunica con vos cuando hay novedades. El portal te muestra a qué ofertas te postulaste y cuándo, pero no los pasos internos de la revisión.",
    },
    {
      pregunta: "¿Quién ve mis datos y mi CV?",
      respuesta:
        "La Oficina de Empleo. Una empresa ve tu nombre, teléfono, email, rubros y CV solo si la Oficina te propone para una de sus ofertas. Nunca ve tu DNI ni el resto de tus postulaciones.",
    },
    {
      pregunta: "El portal no me deja postularme. ¿Qué hago?",
      respuesta:
        "Para postularte necesitás el perfil completo (nombre, apellido, DNI, teléfono y al menos un rubro) y el CV en PDF. Al tocar “Postularme”, el portal te dice qué te falta y te lleva a completarlo.",
    },
    {
      pregunta: "¿Puedo cambiar mi CV?",
      respuesta: "Sí. En “Mi perfil”, subí el nuevo con “Reemplazar CV”. El anterior se borra.",
    },
    {
      pregunta: "¿Puedo retirar una postulación?",
      respuesta: "Desde el portal no. Si ya no te interesa una oferta, avisale a la Oficina de Empleo.",
    },
    {
      pregunta: "No me llegó el email para activar la cuenta.",
      respuesta:
        "Revisá la carpeta de correo no deseado o spam. Si tampoco está ahí, pedí ayuda en la Oficina de Empleo.",
    },
    {
      pregunta: "Me olvidé la contraseña.",
      respuesta:
        "En “Ingresar”, tocá “Olvidé mi contraseña” y escribí tu email. Te llega un enlace para elegir una nueva, que podés abrir en la computadora o en el celular.",
    },
  ],
  empresa: [
    {
      pregunta: "¿Por qué no puedo publicar una oferta?",
      respuesta:
        "Porque la Oficina de Empleo todavía no aprobó tu empresa. Mientras tanto ves “Tu empresa está en revisión”. Si la rechazó, en “Mi empresa” ves el motivo: corregí los datos y la Oficina la revisa de nuevo. Si cambiás el CUIT o la razón social, la revisa otra vez.",
    },
    {
      pregunta: "¿Puedo buscar postulantes por mi cuenta?",
      respuesta:
        "No. La Oficina de Empleo es la que evalúa a quienes se postulan y te propone a los que encajan con tu oferta. Así cada persona llega revisada.",
    },
    {
      pregunta: "¿Qué datos veo de cada candidato?",
      respuesta:
        "Nombre, teléfono, email, rubros y su CV en PDF. Ves solo a las personas que la Oficina te propuso para tus ofertas.",
    },
    {
      pregunta: "¿Puedo cambiar una oferta que ya envié?",
      respuesta:
        "Una oferta enviada no se edita. Si la rechazaron, tocá “Modificar y volver a enviar”. Si está cerrada, “Duplicar para buscar de nuevo”. Si está publicada, pedí el cierre y después duplicala.",
    },
    {
      pregunta: "¿Por qué no puedo pedir el cierre de una oferta?",
      respuesta:
        "Porque falta que respondas por algún candidato que te propuso la Oficina. Contanos si lo contrataste o no en el detalle de la oferta y después pedí el cierre.",
    },
    {
      pregunta: "Me equivoqué al responder por un candidato.",
      respuesta: "La respuesta se da una sola vez. Avisale a la Oficina de Empleo y ella la corrige.",
    },
    {
      pregunta: "¿Puedo borrar una oferta?",
      respuesta:
        "No: ninguna oferta se borra, así queda el historial. Cuando ya no buscás a nadie, pedí el cierre y deja de verse en el portal.",
    },
  ],
};

/** The tile that picks who the help is for. */
export const PUBLICOS: Record<Publico, { titulo: string; texto: string; icono: LucideIcon }> = {
  postulante: {
    titulo: "Busco trabajo",
    texto: "Crear tu cuenta, subir el CV y postularte.",
    icono: SearchIcon,
  },
  empresa: {
    titulo: "Tengo una empresa",
    texto: "Publicar ofertas y responder por los candidatos.",
    icono: Building2Icon,
  },
};

/** Shown at the end: what to do when the guides are not enough. */
export const CONTACTO_AYUDA = {
  titulo: "¿Te quedó alguna duda?",
  texto:
    "La Oficina de Empleo de la Municipalidad de Funes te ayuda en persona: con la cuenta, el CV o una oferta.",
  icono: LifeBuoyIcon,
};
