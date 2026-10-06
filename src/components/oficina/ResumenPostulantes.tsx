import { cn } from "@/lib/utils";

type Props = {
  /** How many people the current search found. */
  total: number;
  /** How many of them have a CV. */
  conCv: number;
};

/**
 * Three numbers about the current search (P16): how many people it found, how
 * many have a CV and how many do not. They count the results, not the whole
 * register: they change with the filters, and the sentence under them says
 * which filters. A person without a CV cannot apply, so the Office sees at a
 * glance how many it can refer.
 */
export function ResumenPostulantes({ total, conCv }: Props) {
  const datos = [
    { nombre: "Resultados", valor: total, destacado: false },
    { nombre: "Con CV", valor: conCv, destacado: true },
    { nombre: "Sin CV", valor: total - conCv, destacado: false },
  ];

  return (
    <dl className="grid grid-cols-3 divide-x divide-border rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md bg-card ring-1 ring-foreground/5">
      {datos.map(({ nombre, valor, destacado }) => (
        <div key={nombre} className="flex flex-col gap-0.5 px-4 py-3 sm:px-6 sm:py-4">
          <dt className="text-sm text-muted-foreground">{nombre}</dt>
          <dd className={cn("font-heading text-2xl font-semibold tabular-nums sm:text-3xl", destacado && "text-primary")}>
            {valor}
          </dd>
        </div>
      ))}
    </dl>
  );
}
