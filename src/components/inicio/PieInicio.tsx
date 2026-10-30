import Link from "next/link";
import { ClockIcon, MapPinIcon } from "lucide-react";

import { LogoMunicipalidad } from "@/components/marca/LogoMunicipalidad";

const ENLACES_PORTAL = [
  { texto: "Ofertas de trabajo", href: "/ofertas" },
  { texto: "Ingresar como postulante", href: "/postulante/ingresar" },
  { texto: "Acceso para empresas", href: "/empresa/ingresar" },
  { texto: "Ayuda", href: "/ayuda" },
  { texto: "Privacidad y uso de tus datos", href: "/privacidad" },
];

const ENLACES_MUNICIPALIDAD = [
  { texto: "Sitio oficial de Funes", href: "https://www.funes.gob.ar/" },
  { texto: "Instagram @munifunes", href: "https://www.instagram.com/munifunes/" },
  { texto: "Facebook", href: "https://www.facebook.com/MuniFunes/" },
  {
    texto: "Cómo llegar",
    href: "https://www.google.com/maps/search/?api=1&query=Municipalidad+de+Funes+Santa+Fe",
  },
];

/**
 * Plain site footer, full width like the navigation bar (not a card): the
 * Office's identity and hours, the portal's links, the municipal links (new tab)
 * and the privacy notice. Only text links, so it stays quiet below the content.
 */
export function PieInicio() {
  return (
    <footer className="w-full border-t border-border bg-card pb-[var(--alto-barra-inferior,0px)] text-sm">
      <div className="grid w-full gap-8 px-4 py-8 sm:px-8 md:grid-cols-3 lg:px-14">
        <div className="flex flex-col gap-3">
          <LogoMunicipalidad variante="color" className="h-9 w-auto self-start" />
          <p className="font-semibold text-foreground">Oficina de Empleo · Municipalidad de Funes</p>
          <p className="inline-flex items-start gap-2 text-muted-foreground">
            <MapPinIcon aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" />
            Av. Santa Fe 1689, Funes, Santa Fe
          </p>
          <p className="inline-flex items-start gap-2 text-muted-foreground">
            <ClockIcon aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" />
            Lunes a viernes de 7:00 a 13:00 hs
          </p>
        </div>

        <nav aria-label="Portal" className="flex flex-col gap-2">
          <h2 className="font-semibold text-foreground">Portal de empleo</h2>
          <ul className="flex flex-col gap-1.5">
            {ENLACES_PORTAL.map(({ texto, href }) => (
              <li key={href}>
                <Link href={href} className="text-muted-foreground hover:text-primary hover:underline">
                  {texto}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Municipalidad" className="flex flex-col gap-2">
          <h2 className="font-semibold text-foreground">Municipalidad</h2>
          <ul className="flex flex-col gap-1.5">
            {ENLACES_MUNICIPALIDAD.map(({ texto, href }) => (
              <li key={href}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary hover:underline"
                >
                  {texto}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="flex w-full flex-col gap-1 border-t border-border px-4 py-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-14">
        <p>© {new Date().getFullYear()} Municipalidad de Funes</p>
        <p>
          Tus datos personales están protegidos por la Ley N.° 25.326.{" "}
          <Link href="/privacidad" className="underline underline-offset-2 hover:text-primary">
            Ver cómo los usamos
          </Link>
        </p>
      </div>
    </footer>
  );
}
