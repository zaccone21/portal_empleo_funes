import Image from "next/image";
import { GraduationCapIcon, HandshakeIcon, LockKeyholeIcon, ShieldCheckIcon, type LucideIcon } from "lucide-react";

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
 * "Un servicio de la Municipalidad de Funes" on the home page (P01, D-059,
 * D-066): why a visitor can trust the portal, told with what the Office really
 * does. On the left, the municipal seal big on the deep green, so the block
 * reads as an official endorsement at a glance; on the right, the four
 * promises in a grid of equal cells.
 *
 * The seal file is 447 px, so it stays sharp up to about 220 px.
 */
export function Confianza() {
  return (
    <section
      aria-labelledby="confianza-titulo"
      className="grid overflow-hidden rounded-tl-[1.75rem] rounded-tr-lg rounded-br-[1.75rem] rounded-bl-lg bg-card ring-1 ring-foreground/5 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]"
    >
      <div className="flex flex-col items-center justify-center gap-5 bg-brand-deep p-8 text-center text-primary-foreground sm:p-10">
        <Image
          src="/sello-funes-verde.png"
          alt="Sello del Gobierno de la Ciudad de Funes"
          width={447}
          height={447}
          className="size-36 rounded-full ring-4 ring-primary-foreground/15 sm:size-44 lg:size-52"
        />
        <div className="flex flex-col gap-2">
          <h2 id="confianza-titulo" className="text-2xl font-semibold text-balance sm:text-3xl">
            Un servicio de la Municipalidad de Funes
          </h2>
          <p className="mx-auto max-w-sm text-base text-primary-foreground/80">
            Detrás del portal está la Oficina de Empleo, que conoce a las empresas y a la gente de la ciudad.
          </p>
        </div>
      </div>
      <ul className="grid gap-px bg-border sm:grid-cols-2">
        {GARANTIAS.map(({ titulo, texto, icono: Icono }) => (
          <li key={titulo} className="flex flex-col gap-3 bg-card p-6 sm:p-8">
            <span
              aria-hidden="true"
              className="flex size-12 shrink-0 items-center justify-center rounded-tl-xl rounded-tr-sm rounded-br-xl rounded-bl-sm bg-primary text-primary-foreground"
            >
              <Icono className="size-6" />
            </span>
            <h3 className="font-heading text-lg font-semibold">{titulo}</h3>
            <p className="text-base text-muted-foreground">{texto}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
