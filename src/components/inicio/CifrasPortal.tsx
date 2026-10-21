"use client";

import { useEffect, useRef, useState } from "react";
import {
  BriefcaseBusinessIcon,
  Building2Icon,
  HandshakeIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { useEstadisticas } from "@/hooks/useEstadisticas";
import type { EstadisticasPublicas } from "@/lib/validation/estadisticas";

const FORMATO = new Intl.NumberFormat("es-AR");
const DURACION_MS = 1200;

const CIFRAS: {
  clave: keyof EstadisticasPublicas;
  etiqueta: string;
  icono: LucideIcon;
}[] = [
  {
    clave: "ofertasPublicadas",
    etiqueta: "ofertas abiertas ahora",
    icono: BriefcaseBusinessIcon,
  },
  { clave: "empresas", etiqueta: "empresas registradas", icono: Building2Icon },
  {
    clave: "postulantes",
    etiqueta: "personas buscando trabajo",
    icono: UsersIcon,
  },
  {
    clave: "contrataciones",
    etiqueta: "contrataciones logradas",
    icono: HandshakeIcon,
  },
];

/**
 * A number that counts up from 0 the first time it scrolls into view (D-059).
 * With "reduce motion" on, it shows the final value at once. Screen readers
 * get the final value only (the moving digits are hidden from them).
 */
function Contador({ valor }: { valor: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [mostrado, setMostrado] = useState(0);

  useEffect(() => {
    const elemento = ref.current;
    if (!elemento) return;
    let cuadro = 0;

    const observador = new IntersectionObserver(([entrada]) => {
      if (!entrada?.isIntersecting) return;
      observador.disconnect();
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setMostrado(valor);
        return;
      }
      const inicio = performance.now();
      const paso = (ahora: number) => {
        const avance = Math.min(1, (ahora - inicio) / DURACION_MS);
        // Ease-out: fast at first, settling on the real value.
        setMostrado(Math.round(valor * (1 - (1 - avance) ** 3)));
        if (avance < 1) cuadro = requestAnimationFrame(paso);
      };
      cuadro = requestAnimationFrame(paso);
    });
    observador.observe(elemento);

    return () => {
      observador.disconnect();
      cancelAnimationFrame(cuadro);
    };
  }, [valor]);

  return (
    <>
      <span ref={ref} aria-hidden="true">
        {FORMATO.format(mostrado)}
      </span>
      <span className="sr-only">{FORMATO.format(valor)}</span>
    </>
  );
}

/**
 * "El portal en números" on the home page (P01, D-059): four real totals from
 * the database, so a visitor sees that the portal is alive and used in Funes.
 * While they load, skeletons keep the place. If they cannot be counted (for
 * example before the migration is applied), the band is left out: the home
 * page works the same without it, and a red error on the landing would only
 * scare a first-time visitor.
 */
export function CifrasPortal() {
  const { estadisticas, loading, error } = useEstadisticas();
  if (error) return null;

  return (
    <section
      aria-labelledby="cifras-titulo"
      className="flex flex-col gap-4 rounded-tl-[1.75rem] rounded-tr-lg rounded-br-[1.75rem] rounded-bl-lg bg-card p-5 ring-1 ring-foreground/5 sm:p-6"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 id="cifras-titulo" className="text-xl font-semibold">
          El portal en números
        </h2>
        <p className="text-sm text-muted-foreground">
          Datos reales, contados al momento.
        </p>
      </div>
      <ul className="grid grid-cols-2 gap-x-4 gap-y-5 lg:grid-cols-4">
        {CIFRAS.map(({ clave, etiqueta, icono: Icono }) => (
          <li
            key={clave}
            className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3"
          >
            <span
              aria-hidden="true"
              className="flex size-11 shrink-0 items-center justify-center rounded-tl-xl rounded-tr-sm rounded-br-xl rounded-bl-sm bg-secondary text-primary"
            >
              <Icono className="size-5" />
            </span>
            <div className="flex flex-col">
              <div className="font-heading text-3xl leading-none font-semibold tracking-tight tabular-nums sm:text-4xl">
                {loading || !estadisticas ? (
                  <Skeleton className="h-9 w-16 bg-muted" />
                ) : (
                  <Contador valor={estadisticas[clave]} />
                )}
              </div>
              <span className="mt-1 text-sm text-muted-foreground">
                {etiqueta}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
