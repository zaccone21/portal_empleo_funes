import type { ReactNode } from "react";

import { MarcoArea } from "@/components/marca/MarcoArea";

/**
 * Shell of the applicant's screens (D-028). /ofertas is public (RF1.4.1); the
 * private screens ask to log in when there is no session.
 */
export default function PostulanteLayout({ children }: { children: ReactNode }) {
  return <MarcoArea area="postulante">{children}</MarcoArea>;
}
