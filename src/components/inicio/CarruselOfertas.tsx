"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon, PauseIcon, PlayIcon } from "lucide-react";

import { AnimarElemento, AnimarGrupo } from "@/components/marca/animaciones";
import { TarjetaOferta } from "@/components/ofertas/TarjetaOferta";
import { Button } from "@/components/ui/button";
import type { OfertaPublica } from "@/lib/validation/ofertas";

type Props = {
  ofertas: OfertaPublica[];
  /** When true, automatically advances the carousel every 4.2s unless hovered or paused. */
  autoPlay?: boolean;
  intervaloMs?: number;
};

/**
 * Offers slider (P01, D-059). Supports both automatic sliding (`autoPlay`) and
 * manual navigation (left/right buttons, touch swipe, trackpad and keyboard).
 */
export function CarruselOfertas({
  ofertas,
  autoPlay = false,
  intervaloMs = 4200,
}: Props) {
  const pista = useRef<HTMLUListElement>(null);
  const [alInicio, setAlInicio] = useState(true);
  const [alFinal, setAlFinal] = useState(true);
  const [pausadoUsuario, setPausadoUsuario] = useState(false);
  const [hoverActivo, setHoverActivo] = useState(false);

  useEffect(() => {
    const lista = pista.current;
    if (!lista) return;
    function medir() {
      if (!lista) return;
      setAlInicio(lista.scrollLeft <= 4);
      setAlFinal(lista.scrollLeft + lista.clientWidth >= lista.scrollWidth - 4);
    }
    medir();
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
    const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const itemAncho = lista.firstElementChild?.clientWidth ?? lista.clientWidth * 0.33;
    const paso = Math.max(itemAncho + 16, lista.clientWidth * 0.5);

    if (sentido === 1 && lista.scrollLeft + lista.clientWidth >= lista.scrollWidth - 8) {
      lista.scrollTo({ left: 0, behavior: reducido ? "auto" : "smooth" });
      return;
    }

    lista.scrollBy({
      left: sentido * paso,
      behavior: reducido ? "auto" : "smooth",
    });
  }

  useEffect(() => {
    if (!autoPlay || pausadoUsuario || hoverActivo || ofertas.length <= 1) return;
    const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducido) return;

    const timer = window.setInterval(() => {
      const lista = pista.current;
      if (!lista) return;
      if (lista.scrollWidth <= lista.clientWidth + 4) return;

      const itemAncho = lista.firstElementChild?.clientWidth ?? 320;
      if (lista.scrollLeft + lista.clientWidth >= lista.scrollWidth - 8) {
        lista.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        lista.scrollBy({ left: itemAncho + 16, behavior: "smooth" });
      }
    }, intervaloMs);

    return () => window.clearInterval(timer);
  }, [autoPlay, hoverActivo, intervaloMs, ofertas.length, pausadoUsuario]);

  return (
    <div
      className="flex flex-col gap-3"
      onMouseEnter={() => setHoverActivo(true)}
      onMouseLeave={() => setHoverActivo(false)}
      onFocusCapture={() => setHoverActivo(true)}
      onBlurCapture={() => setHoverActivo(false)}
    >
      <AnimarGrupo>
        <ul
          ref={pista}
          className="relative -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] lg:mx-0 lg:scroll-px-0 lg:px-0 [&::-webkit-scrollbar]:hidden"
        >
          {ofertas.map((oferta) => (
            <li
              key={oferta.id}
              className="flex shrink-0 basis-[85%] snap-start flex-col sm:basis-[calc(50%-0.5rem)] lg:basis-[calc(33.333%-0.67rem)] xl:basis-[calc(25%-0.75rem)]"
            >
              <AnimarElemento elevarAlPasar className="flex h-full flex-col">
                <TarjetaOferta
                  oferta={oferta}
                  href={`/ofertas?oferta=${encodeURIComponent(oferta.id)}`}
                  seleccionada={false}
                  soloEnEscritorio={false}
                />
              </AnimarElemento>
            </li>
          ))}
        </ul>
      </AnimarGrupo>

      {!(alInicio && alFinal) && (
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-muted-foreground">
            {autoPlay && !pausadoUsuario
              ? "Se desliza solo · usá las flechas para moverlo vos"
              : "Usá las flechas para recorrer las ofertas"}
          </span>
          <div className="flex items-center gap-2">
            {autoPlay && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setPausadoUsuario((p) => !p)}
                aria-label={pausadoUsuario ? "Reanudar carrusel automático" : "Pausar carrusel automático"}
                title={pausadoUsuario ? "Reanudar movimiento automático" : "Pausar movimiento automático"}
              >
                {pausadoUsuario ? (
                  <PlayIcon aria-hidden="true" className="size-4" />
                ) : (
                  <PauseIcon aria-hidden="true" className="size-4" />
                )}
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => mover(-1)}
              disabled={alInicio}
              aria-label="Ofertas anteriores"
            >
              <ChevronLeftIcon aria-hidden="true" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => mover(1)}
              aria-label="Más ofertas"
            >
              <ChevronRightIcon aria-hidden="true" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
