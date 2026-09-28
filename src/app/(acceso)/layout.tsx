import type { ReactNode } from "react";

import { MarcoAcceso } from "@/components/auth/MarcoAcceso";

/**
 * Frame of all access screens: green background, trade mosaic and portal
 * lockup (D-022). Each portal folder adds its own slogan in its layout.
 */
export default function AccesoLayout({ children }: { children: ReactNode }) {
  return <MarcoAcceso>{children}</MarcoAcceso>;
}
