"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import { BotonAdmin } from "@/components/admin/boton-admin";
import { resolverPostulacionAccion } from "@/lib/actions/oficina";

type Props = {
  id: string;
  /**
   * Opcional: si se pasa, se puede usar para navegación explícita,
   * pero por defecto permanece en la misma pantalla (flujo continuo individual).
   */
  destinoSiguiente?: string;
};

/**
 * Runs a status change, shows the toast and refreshes in-place so the operator
 * stays in the same candidate's flow (pre-interview, referral, feedback)
 * without an unwanted forced jump.
 */
function useResolver(id: string) {
  const router = useRouter();
  const [pendiente, iniciar] = useTransition();

  function resolver(estado: "preseleccionado" | "derivado" | "no_apto") {
    iniciar(async () => {
      const respuesta = await resolverPostulacionAccion(id, estado);
      if (respuesta.ok) {
        toast.success(respuesta.mensaje);
      } else {
        toast.error(respuesta.mensaje);
      }
      router.refresh();
    });
  }

  return { resolver, pendiente };
}

/** Footer buttons of the evaluation screen (06): "Marcar no apto" and "Preseleccionar" (RF1.5.6). */
export function BotonesEvaluacion({ id }: Props) {
  const { resolver, pendiente } = useResolver(id);
  return (
    <div className="flex items-center gap-2">
      <BotonAdmin variante="destructivo" disabled={pendiente} onClick={() => resolver("no_apto")}>
        Marcar no apto
      </BotonAdmin>
      <BotonAdmin variante="primario" disabled={pendiente} onClick={() => resolver("preseleccionado")}>
        Preseleccionar
      </BotonAdmin>
    </div>
  );
}

/** "Marcar como derivado" of the "Por comunicar / derivar" queue (07). */
export function BotonDerivar({ id }: { id: string }) {
  const { resolver, pendiente } = useResolver(id);
  return (
    <BotonAdmin variante="primario" disabled={pendiente} onClick={() => resolver("derivado")}>
      Marcar como derivado
    </BotonAdmin>
  );
}
