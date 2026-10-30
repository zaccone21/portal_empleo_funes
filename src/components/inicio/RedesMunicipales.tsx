import { IconoFacebook, IconoInstagram, IconoYoutube } from "@/components/marca/IconosRedes";

const REDES = [
  { nombre: "Instagram", href: "https://www.instagram.com/munifunes/", Icono: IconoInstagram },
  { nombre: "Facebook", href: "https://www.facebook.com/MuniFunes/", Icono: IconoFacebook },
  { nombre: "YouTube", href: "https://www.youtube.com/results?search_query=Municipalidad+de+Funes", Icono: IconoYoutube },
];

/**
 * Discreet strip with the Municipality's official social networks (`target="_blank"`):
 * one line of text and three small icon buttons, so it never competes with the offers.
 */
export function RedesMunicipales() {
  return (
    <section
      aria-label="Redes sociales de la Municipalidad"
      className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-muted-foreground"
    >
      <p>Seguí a la Municipalidad de Funes en sus redes</p>
      <ul className="flex items-center gap-2">
        {REDES.map(({ nombre, href, Icono }) => (
          <li key={nombre}>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${nombre} de la Municipalidad de Funes (se abre en una pestaña nueva)`}
              title={nombre}
              className="flex size-10 items-center justify-center rounded-full border border-border bg-card text-foreground/70 transition-colors outline-none hover:border-primary hover:text-primary focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <Icono className="size-[18px]" />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
