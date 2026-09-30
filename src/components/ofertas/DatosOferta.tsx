import { BanknoteIcon, ClockIcon, MapPinIcon } from "lucide-react";

import { NOMBRE_RUBRO, type Rubro } from "@/lib/validation/rubros";

import { IconoRubro } from "./IconoRubro";

type Props = {
  lugar: string;
  jornada: string;
  /** The offer's trades (1 to 3); shown first when given (D-029, D-032). */
  rubros?: Rubro[];
  /** Pay as the company wrote it; the line is left out when there is none (D-032). */
  sueldo?: string | null;
};

/**
 * What, where and when: the facts a person checks first to decide whether an
 * offer is for them. Shown on the cards and in the details. The icons are
 * decorative; a visually hidden label ("Rubro:", "Lugar:", "Horario:", "Sueldo:") gives
 * screen readers the same context the icon gives sighted users.
 *
 * Several trades go on one line, joined with "·" and with the first trade's
 * icon, so a card does not grow on a phone.
 */
export function DatosOferta({ lugar, jornada, rubros, sueldo }: Props) {
  return (
    <ul className="flex flex-col gap-1.5 text-base">
      {rubros && rubros.length > 0 && (
        <li className="flex items-start gap-2">
          <IconoRubro rubro={rubros[0]} className="mt-0.5 size-5 shrink-0 text-primary" />
          <span>
            <span className="sr-only">{rubros.length === 1 ? "Rubro: " : "Rubros: "}</span>
            {rubros.map((rubro) => NOMBRE_RUBRO[rubro]).join(" · ")}
          </span>
        </li>
      )}
      <li className="flex items-start gap-2">
        <MapPinIcon aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" />
        <span>
          <span className="sr-only">Lugar: </span>
          {lugar}
        </span>
      </li>
      <li className="flex items-start gap-2">
        <ClockIcon aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" />
        <span>
          <span className="sr-only">Horario: </span>
          {jornada}
        </span>
      </li>
      {sueldo && (
        <li className="flex items-start gap-2">
          <BanknoteIcon aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" />
          <span>
            <span className="sr-only">Sueldo: </span>
            {sueldo}
          </span>
        </li>
      )}
    </ul>
  );
}
