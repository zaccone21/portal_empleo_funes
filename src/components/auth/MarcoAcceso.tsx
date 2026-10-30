import type { ReactNode } from "react";

import { MarcaPortal } from "@/components/marca/MarcaPortal";
import { MosaicoOficios } from "@/components/marca/MosaicoOficios";

/**
 * Frame shared by every access screen (D-022): deep green background, the
 * trade mosaic and the portal lockup. It lives in the (acceso) layout, so it
 * stays mounted while the user moves between login, registration and
 * recovery (the mosaic animates only once).
 *
 * The top bar spans the whole width like the portal's navigation bar (logo
 * against the left edge); the content below stays centered.
 *
 * The mosaic is masked so the top of the screen (mobile) or the left side
 * (desktop) stays plain green: the slogan sits there and must read cleanly.
 */
export function MarcoAcceso({ children }: { children: ReactNode }) {
  return (
    <div className="relative isolate flex min-h-dvh flex-1 flex-col overflow-hidden bg-brand-deep text-primary-foreground">
      <MosaicoOficios className="absolute inset-0 -z-10 [mask-image:linear-gradient(to_bottom,transparent_8rem,black_14rem)] lg:[mask-image:linear-gradient(100deg,transparent_34%,black_60%)]" />
      {/* Barra superior con más margin-top y sin línea inferior */}
      <header className="mt-3 sm:mt-5 lg:mt-7 flex h-12 sm:h-14 w-full items-center px-4 sm:px-6 lg:px-10">
        <MarcaPortal />
      </header>
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-4 py-3 sm:px-6 lg:px-10">
        {children}
      </div>
    </div>
  );
}
