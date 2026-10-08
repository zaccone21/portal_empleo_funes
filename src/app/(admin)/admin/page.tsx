import type { Metadata } from "next";

import { ResumenOficina } from "@/components/oficina/ResumenOficina";

export const metadata: Metadata = { title: "Panel de la Oficina" };

/** P14: the Office's panel, what needs attention today (RF1.5.1). */
export default function AdminPanelPage() {
  return (
    <>
      <div className="flex flex-col gap-1 mb-4">
        <h1 className="text-2xl font-bold tracking-tight">Panel de la Oficina</h1>
        <p className="text-muted-foreground">Resumen de tareas y novedades del portal.</p>
      </div>
      <ResumenOficina />
    </>
  );
}
