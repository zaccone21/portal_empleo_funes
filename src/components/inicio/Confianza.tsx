import { GraduationCapIcon, HandshakeIcon, LockKeyholeIcon, ShieldCheckIcon, type LucideIcon } from "lucide-react";

import { LogoMunicipalidad } from "@/components/marca/LogoMunicipalidad";

/*
 * Each promise is something the portal already does, with the rule it comes
 * from, so the page never promises more than the system keeps.
 */
const GARANTIAS: { titulo: string; texto: string; icono: LucideIcon }[] = [
  {
    // RF1.5.3: the Office approves or rejects every offer before it is published.
    titulo: "Cada oferta, revisada",
    texto: "La Oficina de Empleo revisa cada oferta antes de publicarla. Nada sale al portal sin ese control.",
    icono: ShieldCheckIcon,
  },
  {
    // RNF1, D-044: private CVs; a company sees only the people the Office refers to it.
    titulo: "Tus datos, cuidados",
    texto: "Tu CV no es público. Lo ve la Oficina y, solo si te propone para una oferta, esa empresa.",
    icono: LockKeyholeIcon,
  },
  {
    // RF1.5.6, RF1.6.1, RF1.6.2: evaluation, optional pre-interview and referral.
    titulo: "Una persona te acompaña",
    texto: "La Oficina lee tu perfil, te llama si encajás y te presenta a la empresa.",
    icono: HandshakeIcon,
  },
  {
    // RF1.6.6, D-047: course referrals.
    titulo: "Si no quedás, seguís sumando",
    texto: "La Oficina puede ofrecerte cursos de capacitación para tu próxima búsqueda.",
    icono: GraduationCapIcon,
  },
];

/**
 * "Un servicio de la Municipalidad de Funes" on the home page (P01, D-059):
 * why a visitor can trust the portal, told with what the Office really does.
 * White card with the municipal logo in color, so it reads as institutional
 * and not as another green brand block.
 */
export function Confianza() {
  return (
    <section
      aria-labelledby="confianza-titulo"
      className="flex flex-col gap-6 rounded-tl-[1.75rem] rounded-tr-lg rounded-br-[1.75rem] rounded-bl-lg bg-card p-6 ring-1 ring-foreground/5 sm:p-8"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h2 id="confianza-titulo" className="text-2xl font-semibold text-balance">
            Un servicio de la Municipalidad de Funes
          </h2>
          <p className="max-w-xl text-base text-muted-foreground">
            Detrás del portal está la Oficina de Empleo, que conoce a las empresas y a la gente de la ciudad.
          </p>
        </div>
        <LogoMunicipalidad variante="color" className="h-8 w-auto shrink-0" />
      </div>
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {GARANTIAS.map(({ titulo, texto, icono: Icono }) => (
          <li key={titulo} className="flex gap-3 lg:flex-col">
            <span
              aria-hidden="true"
              className="flex size-12 shrink-0 items-center justify-center rounded-tl-xl rounded-tr-sm rounded-br-xl rounded-bl-sm bg-secondary text-primary"
            >
              <Icono className="size-6" />
            </span>
            <div className="flex flex-col gap-1">
              <h3 className="font-heading text-lg font-semibold">{titulo}</h3>
              <p className="text-base text-muted-foreground">{texto}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
