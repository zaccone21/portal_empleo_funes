"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import { BotonAdmin } from "@/components/admin/boton-admin";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { aprobarEmpresaAccion, rechazarEmpresaAccion, type RespuestaAccion } from "@/lib/actions/oficina";
import type { EstadoEmpresa } from "@/lib/validation/empresa";
import { OPCIONES_MOTIVO_EMPRESA } from "@/lib/validation/motivos-rechazo";

type Props = {
  id: string;
  estado: EstadoEmpresa;
  /** The company has not filled in its data yet: there is nothing to approve. */
  perfilIncompleto: boolean;
};

/**
 * Decisions on a company, on its page (D-068, D-069). Approving is one click
 * with a toast; rejecting asks for one of the fixed reasons, which the company
 * reads. The server decides if the move is still valid: when another operator
 * got there first, the toast says so.
 */
export function AccionesEmpresa({ id, estado, perfilIncompleto }: Props) {
  const router = useRouter();
  const [pendiente, iniciar] = useTransition();

  async function ejecutar(accion: () => Promise<RespuestaAccion>) {
    const respuesta = await accion();
    if (respuesta.ok) toast.success(respuesta.mensaje);
    else toast.error(respuesta.mensaje);
    router.refresh();
  }

  if (estado === "aprobada") return null;

  return (
    <>
      <BotonAdmin
        variante="primario"
        disabled={pendiente || perfilIncompleto}
        onClick={() => iniciar(() => ejecutar(() => aprobarEmpresaAccion(id)))}
      >
        Aprobar empresa
      </BotonAdmin>
      {estado === "pendiente" && (
        <ConfirmDialog
          trigger={<BotonAdmin variante="destructivo">Rechazar</BotonAdmin>}
          titulo="¿Rechazar esta empresa?"
          descripcion="Elegí el motivo. La empresa lo va a leer en su panel y puede corregir sus datos."
          textoConfirmar="Rechazar empresa"
          varianteConfirmar="destructive"
          motivos={OPCIONES_MOTIVO_EMPRESA}
          onConfirmar={(motivo) => ejecutar(() => rechazarEmpresaAccion(id, motivo?.codigo ?? "", motivo?.observacion))}
        />
      )}
    </>
  );
}
