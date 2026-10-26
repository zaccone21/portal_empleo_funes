"use client";

import { useSyncExternalStore } from "react";

/**
 * True while the viewport matches a media query. The server (and the first
 * render) answers `valorServidor`, so the markup matches before hydration.
 */
export function useMediaQuery(consulta: string, valorServidor = true): boolean {
  return useSyncExternalStore(
    (aviso) => {
      const mql = window.matchMedia(consulta);
      mql.addEventListener("change", aviso);
      return () => mql.removeEventListener("change", aviso);
    },
    () => window.matchMedia(consulta).matches,
    () => valorServidor,
  );
}
