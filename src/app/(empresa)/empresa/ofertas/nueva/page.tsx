import type { Metadata } from "next";
import { LightbulbIcon } from "lucide-react";

import { FormularioOferta } from "@/components/empresa/FormularioOferta";
import { Seccion } from "@/components/marca/Seccion";

export const metadata: Metadata = { title: "Publicar una oferta" };

/** P11: form to send a new offer (RF1.3.3), with a few tips beside it. */
export default function EmpresaNuevaOfertaPage() {
  return (
    <Seccion
      titulo="Publicar una oferta"
      bajada="Completá los datos del puesto. La Oficina de Empleo la revisa antes de publicarla."
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,4fr)] lg:items-start">
        <FormularioOferta />
        <aside className="flex gap-3 rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md bg-card p-5 ring-1 ring-foreground/5 lg:sticky lg:top-4">
          <LightbulbIcon aria-hidden="true" className="mt-0.5 size-6 shrink-0 text-primary" />
          <div className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold">Para que la entiendan rápido</h2>
            <ul className="flex list-disc flex-col gap-2 pl-5 text-base text-muted-foreground">
              <li>Usá el nombre del puesto como lo buscaría alguien: “Ayudante de cocina”.</li>
              <li>Contá las tareas del día a día y el horario real.</li>
              <li>En los requisitos, poné solo lo imprescindible.</li>
            </ul>
          </div>
        </aside>
      </div>
    </Seccion>
  );
}
