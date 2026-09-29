import type { ReactNode } from "react";

import { MarcoArea } from "@/components/marca/MarcoArea";

/**
 * Shell of the company's screens (P09–P12; D-028). Every screen asks to log
 * in as a company when there is no session; "Publicar" stands out in the
 * phone menu.
 */
export default function EmpresaLayout({ children }: { children: ReactNode }) {
  return <MarcoArea area="company">{children}</MarcoArea>;
}
