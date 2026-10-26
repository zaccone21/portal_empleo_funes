"use client";

import { useEffect, useRef, useState } from "react";

const FORMATO = new Intl.NumberFormat("es-AR");
const DURACION_MS = 1200;

/**
 * A number that counts up from 0 the first time it scrolls into view (D-059)
 * and, when the value changes later (the home page refreshes it, D-066),
 * counts from what is on screen to the new value. With "reduce motion" on it
 * shows the value at once. Screen readers get the final value only (the
 * moving digits are hidden from them).
 */
export function Contador({ valor }: { valor: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [mostrado, setMostrado] = useState(0);
  // What is on screen right now, to count from it; and whether it was seen once.
  const enPantalla = useRef(0);
  const visto = useRef(false);

  useEffect(() => {
    const elemento = ref.current;
    if (!elemento) return;
    let cuadro = 0;

    function contar() {
      const desde = enPantalla.current;
      if (desde === valor || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        enPantalla.current = valor;
        setMostrado(valor);
        return;
      }
      const inicio = performance.now();
      const paso = (ahora: number) => {
        const avance = Math.min(1, (ahora - inicio) / DURACION_MS);
        // Ease-out: fast at first, settling on the real value.
        const actual = Math.round(desde + (valor - desde) * (1 - (1 - avance) ** 3));
        enPantalla.current = actual;
        setMostrado(actual);
        if (avance < 1) cuadro = requestAnimationFrame(paso);
      };
      cuadro = requestAnimationFrame(paso);
    }

    if (visto.current) {
      contar();
      return () => cancelAnimationFrame(cuadro);
    }

    const observador = new IntersectionObserver(([entrada]) => {
      if (!entrada?.isIntersecting) return;
      observador.disconnect();
      visto.current = true;
      contar();
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
