"use client";

import Link from "next/link";
import { ClockIcon, MapPinIcon } from "lucide-react";
import { useContext } from "react";

import { LogoMunicipalidad } from "@/components/marca/LogoMunicipalidad";
import { ContextoSesion } from "@/components/sesion/ProveedorSesion";

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
 * Office's identity and hours, the portal's links (hiding login links when a
 * session is already active), the municipal links (new tab) and the privacy
 * notice. Compacted on mobile into a neat 2-column links layout so it never
 * dominates the whole phone screen height.
 */
export function PieInicio() {
  const sesion = useContext(ContextoSesion);
  const usuario = sesion?.usuario;

  const ENLACES_PORTAL = [
    { texto: "Ofertas de trabajo", href: "/ofertas" },
    ...(!usuario
      ? [
          { texto: "Ingresar como postulante", href: "/postulante/ingresar" },
          { texto: "Acceso para empresas", href: "/empresa/ingresar" },
        ]
      : []),
    { texto: "Ayuda", href: "/ayuda" },
    { texto: "Privacidad y uso de tus datos", href: "/privacidad" },
  ];

  return (
    <footer className="w-full border-t border-border bg-card pb-[var(--alto-barra-inferior,0px)] text-sm">
      <div className="grid w-full gap-5 px-4 py-5 sm:gap-8 sm:px-8 sm:py-8 md:grid-cols-3 lg:px-14">
        {/* Identidad institucional y horarios */}
        <div className="flex flex-col gap-2.5 sm:gap-3">
          <LogoMunicipalidad variante="color" className="h-8 sm:h-9 w-auto self-start" />
          <p className="font-semibold text-foreground text-xs sm:text-sm">Oficina de Empleo · Municipalidad de Funes</p>
          <p className="inline-flex items-start gap-1.5 text-xs text-muted-foreground sm:text-sm">
            <MapPinIcon aria-hidden="true" className="mt-0.5 size-3.5 sm:size-4 shrink-0 text-primary" />
            Av. Santa Fe 1689, Funes, Santa Fe
          </p>
          <p className="inline-flex items-start gap-1.5 text-xs text-muted-foreground sm:text-sm">
            <ClockIcon aria-hidden="true" className="mt-0.5 size-3.5 sm:size-4 shrink-0 text-primary" />
            Lunes a viernes de 7:00 a 13:00 hs
          </p>
        </div>

        {/* Enlaces distribuidos en 2 columnas en mobile para ahorrar espacio */}
        <div className="col-span-1 grid grid-cols-2 gap-4 sm:contents">
          <nav aria-label="Portal" className="flex flex-col gap-1.5 sm:gap-2">
            <h2 className="font-semibold text-foreground text-xs sm:text-sm">Portal de empleo</h2>
            <ul className="flex flex-col gap-1 sm:gap-1.5">
              {ENLACES_PORTAL.map(({ texto, href }) => (
                <li key={href}>
                  <Link href={href} className="text-xs text-muted-foreground hover:text-primary hover:underline sm:text-sm">
                    {texto}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Municipalidad" className="flex flex-col gap-1.5 sm:gap-2">
            <h2 className="font-semibold text-foreground text-xs sm:text-sm">Municipalidad</h2>
            <ul className="flex flex-col gap-1 sm:gap-1.5">
              {ENLACES_MUNICIPALIDAD.map(({ texto, href }) => (
                <li key={href}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-muted-foreground hover:text-primary hover:underline sm:text-sm"
                  >
                    {texto}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      <div className="flex w-full flex-col gap-1 border-t border-border px-4 py-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-4 lg:px-14">
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
