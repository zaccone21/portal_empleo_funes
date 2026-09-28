import { ClockIcon, MapPinIcon } from "lucide-react";

type Props = {
  lugar: string;
  jornada: string;
};

/**
 * Where and when: the two facts a person checks first to decide whether an
 * offer is for them. Shown on the card and in the detail. The icons are
 * decorative; a visually hidden label ("Lugar:", "Horario:") gives screen
 * readers the same context the icon gives sighted users.
 */
export function DatosOferta({ lugar, jornada }: Props) {
  return (
    <ul className="flex flex-col gap-1.5 text-base">
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
