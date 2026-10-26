import type { Metadata } from "next";

import { FormularioCuentaOficina } from "@/components/admin/formulario-cuenta-oficina";
import { ListaEquipo } from "@/components/admin/lista-equipo";
import { PageHeader } from "@/components/admin/page-header";
import { operadorActual } from "@/lib/admin/datos";
import { verEquipoOficina } from "@/lib/use-cases/equipo";

export const metadata: Metadata = { title: "Equipo · Oficina de Empleo" };

/** P21: the Office team. Every operator can add an account; none can delete one (D-058). */
export default async function AdminEquipoPage() {
  const usuario = await operadorActual();
  const resultado = await verEquipoOficina(usuario);
  const cuentas = resultado.ok ? resultado.datos : [];

  return (
    <>
      <PageHeader
        migas={["Oficina", "Equipo"]}
        titulo="Equipo"
        descripcion="Las personas que trabajan en el portal de la Oficina de Empleo."
      />
      <div className="grid min-h-0 grid-cols-1 items-start gap-4 overflow-y-auto lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)]">
        <ListaEquipo cuentas={cuentas} idActual={usuario.id} />
        <FormularioCuentaOficina />
      </div>
    </>
  );
}
