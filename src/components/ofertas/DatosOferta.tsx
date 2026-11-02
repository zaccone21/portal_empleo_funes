import { BanknoteIcon, ClockIcon, MapPinIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  NOMBRE_MODALIDAD,
  NOMBRE_TIPO_JORNADA,
  type ModalidadLaboral,
  type TipoJornada,
} from "@/lib/validation/estandarizacion";
import { NOMBRE_RUBRO, type Rubro } from "@/lib/validation/rubros";

import { IconoRubro } from "./IconoRubro";

type Props = {
  lugar: string;
  jornada: string;
  /** Modalidad laboral estandarizada (presencial, híbrido, remoto). */
  modalidad?: ModalidadLaboral;
  /** Tipo de jornada laboral (completa, media jornada, flexible). */
  tipoJornada?: TipoJornada;
  /** The offer's trades (1 to 3); shown first when given (D-029, D-032). */
  rubros?: Rubro[];
  /** Pay as the company wrote it; the line is left out when there is none (D-032). */
  sueldo?: string | null;
  /**
   * For cards: one line per fact (cut with "…") and room for four lines even
   * without pay, so every card of a list is the same height (D-066).
   */
  compacto?: boolean;
};

/**
 * What, where and when: the facts a person checks first to decide whether an
 * offer is for them. Shown on the cards and in the details. The icons are
 * decorative; a visually hidden label ("Rubro:", "Dirección:", "Horario:", "Sueldo:") gives
 * screen readers the same context the icon gives sighted users.
 *
 * Several trades go on one line, joined with "·" and with the first trade's
 * icon, so a card does not grow on a phone.
 */
export function DatosOferta({
  lugar,
  jornada,
  modalidad,
  tipoJornada,
  rubros,
  sueldo,
  compacto = false,
}: Props) {
  const texto = cn(compacto && "min-w-0 truncate");
  return (
    <ul className={cn("flex flex-col gap-1.5 text-base", compacto && "min-h-[calc(4lh+1.125rem)]")}>
      {rubros && rubros.length > 0 && (
        <li className="flex min-w-0 items-start gap-2">
          <IconoRubro rubro={rubros[0]} className="mt-0.5 size-5 shrink-0 text-primary" />
          <span className={texto}>
            <span className="sr-only">{rubros.length === 1 ? "Rubro: " : "Rubros: "}</span>
            {rubros.map((rubro) => NOMBRE_RUBRO[rubro]).join(" · ")}
          </span>
        </li>
      )}
      <li className="flex min-w-0 items-start gap-2">
        <MapPinIcon aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" />
        <span className={texto}>
          <span className="sr-only">Dirección y modalidad: </span>
          {modalidad ? `${NOMBRE_MODALIDAD[modalidad]} · ${lugar}` : lugar}
        </span>
      </li>
      <li className="flex min-w-0 items-start gap-2">
        <ClockIcon aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" />
        <span className={texto}>
          <span className="sr-only">Horario y jornada: </span>
          {tipoJornada ? `${NOMBRE_TIPO_JORNADA[tipoJornada]} · ${jornada}` : jornada}
        </span>
      </li>
      {sueldo && (
        <li className="flex min-w-0 items-start gap-2">
          <BanknoteIcon aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" />
          <span className={texto}>
            <span className="sr-only">Sueldo: </span>
            {sueldo}
          </span>
        </li>
      )}
    </ul>
  );
}
