import type { ReactNode } from "react";

import { MarcoArea } from "@/components/marca/MarcoArea";

/**
 * Shell of the Employment Office's screens (P14, P15; D-030). Every screen asks
 * to log in with an Office account when there is no session.
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return <MarcoArea area="admin">{children}</MarcoArea>;
}
