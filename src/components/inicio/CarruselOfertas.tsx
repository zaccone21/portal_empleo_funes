"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { TarjetaOferta } from "@/components/ofertas/TarjetaOferta";
import { Button } from "@/components/ui/button";
import type { OfertaPublica } from "@/lib/validation/ofertas";

/**
 * The newest offers as a slider (P01, D-059). It is a plain list that scrolls
 * sideways with snap points, so it works with the thumb, the trackpad and the
 * keyboard (Tab moves through the cards); the arrow buttons move one screen
 * at a time and switch off at each end. One card and a bit of the next on a
 * phone (the peek says "there is more"), two from `sm`, four from `lg`.
 */
export function CarruselOfertas({ ofertas }: { ofertas: OfertaPublica[] }) {
  const pista = useRef<HTMLUListElement>(null);
  const [alInicio, setAlInicio] = useState(true);
  const [alFinal, setAlFinal] = useState(true);

  useEffect(() => {
    const lista = pista.current;
    if (!lista) return;
    function medir() {
      if (!lista) return;
      setAlInicio(lista.scrollLeft <= 4);
      setAlFinal(lista.scrollLeft + lista.clientWidth >= lista.scrollWidth - 4);
    }
    const observador = new ResizeObserver(medir);
    observador.observe(lista);
    lista.addEventListener("scroll", medir, { passive: true });
    return () => {
      observador.disconnect();
      lista.removeEventListener("scroll", medir);
    };
  }, [ofertas]);

  function mover(sentido: 1 | -1) {
    const lista = pista.current;
    if (!lista) return;
    const reducido = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    lista.scrollBy({
      left: sentido * lista.clientWidth * 0.9,
      behavior: reducido ? "auto" : "smooth",
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <ul
        ref={pista}
        // `relative` makes the list the containing block of the screen-reader-only
        // labels inside the cards (absolutely positioned), so it clips them too and
        // they do not widen the page on phones.
        className="relative -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 lg:mx-0 lg:scroll-px-0 lg:px-0"
      >
        {ofertas.map((oferta) => (
          <li
            key={oferta.id}
            className="flex shrink-0 basis-[85%] snap-start flex-col sm:basis-[calc(50%-0.375rem)] lg:basis-[calc(25%-0.5625rem)]"
          >
            <TarjetaOferta
              oferta={oferta}
              href={`/ofertas?oferta=${encodeURIComponent(oferta.id)}`}
              seleccionada={false}
              soloEnEscritorio={false}
            />
          </li>
        ))}
      </ul>
      {!(alInicio && alFinal) && (
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => mover(-1)}
            disabled={alInicio}
            aria-label="Ofertas anteriores"
          >
            <ChevronLeftIcon aria-hidden="true" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => mover(1)}
            disabled={alFinal}
            aria-label="Más ofertas"
          >
            <ChevronRightIcon aria-hidden="true" />
          </Button>
        </div>
      )}
    </div>
  );
}
