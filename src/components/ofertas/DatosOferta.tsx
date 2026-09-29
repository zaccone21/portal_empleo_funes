import { ClockIcon, MapPinIcon } from "lucide-react";

import { NOMBRE_RUBRO, type Rubro } from "@/lib/validation/rubros";

import { IconoRubro } from "./IconoRubro";

type Props = {
  lugar: string;
  jornada: string;
  /** The offer's trade; shown first when given (D-029). */
  rubro?: Rubro;
};

/**
 * What, where and when: the facts a person checks first to decide whether an
 * offer is for them. Shown on the cards and in the details. The icons are
 * decorative; a visually hidden label ("Rubro:", "Lugar:", "Horario:") gives
 * screen readers the same context the icon gives sighted users.
 */
export function DatosOferta({ lugar, jornada, rubro }: Props) {
  return (
    <ul className="flex flex-col gap-1.5 text-base">
      {rubro && (
        <li className="flex items-start gap-2">
          <IconoRubro rubro={rubro} className="mt-0.5 size-5 shrink-0 text-primary" />
          <span>
            <span className="sr-only">Rubro: </span>
            {NOMBRE_RUBRO[rubro]}
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
    </ul>
  );
}
