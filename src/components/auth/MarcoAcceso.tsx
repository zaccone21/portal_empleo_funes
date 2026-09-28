import type { ReactNode } from "react";

import { MarcaPortal } from "@/components/marca/MarcaPortal";
import { MosaicoOficios } from "@/components/marca/MosaicoOficios";

/**
 * Frame shared by every access screen (D-022): deep green background, the
 * trade mosaic and the portal lockup. It lives in the (acceso) layout, so it
 * stays mounted while the user moves between login, registration and
 * recovery (the mosaic animates only once).
 *
 * The mosaic is masked so the top of the screen (mobile) or the left side
 * (desktop) stays plain green: the slogan sits there and must read cleanly.
 */
export function MarcoAcceso({ children }: { children: ReactNode }) {
  return (
    <div className="relative isolate flex min-h-dvh flex-1 flex-col overflow-hidden bg-brand-deep text-primary-foreground">
      <MosaicoOficios className="absolute inset-0 -z-10 [mask-image:linear-gradient(to_bottom,transparent_9rem,black_17rem)] lg:[mask-image:linear-gradient(100deg,transparent_34%,black_60%)]" />
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 pt-4 pb-10 lg:px-10 lg:pt-8">
        <MarcaPortal />
        {children}
      </div>
    </div>
  );
}
