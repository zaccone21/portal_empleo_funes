"use client";

import { useState, useTransition } from "react";
import { UserMinusIcon } from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { darDeBajaCuentaOficinaAccion } from "@/lib/actions/oficina";
import { fechaLarga } from "@/lib/admin/fechas";
import type { CuentaOficina } from "@/lib/validation/equipo";

type Props = {
  cuentas: CuentaOficina[];
  idActual: string;
};

/**
 * The Office accounts (P21, D-058), oldest first, with "Vos" on the logged-in one.
 * Peer Admin guards:
 * - Cannot delete yourself (Guarda 1).
 * - Cannot delete the last remaining admin (Guarda 2).
 */
export function ListaEquipo({ cuentas, idActual }: Props) {
  const [pendiente, startTransition] = useTransition();
  const [seleccionada, setSeleccionada] = useState<CuentaOficina | null>(null);

  const esUnicoAdmin = cuentas.length <= 1;

  function confirmarBaja() {
    if (!seleccionada) return;
    startTransition(async () => {
      const res = await darDeBajaCuentaOficinaAccion(seleccionada.id);
      if (res.ok) {
        toast.success(res.mensaje);
        setSeleccionada(null);
      } else {
        toast.error(res.mensaje);
      }
    });
  }

  return (
    <section aria-labelledby="equipo-titulo" className="flex flex-col gap-2 rounded-[10px] border border-border bg-card p-4">
      <div className="flex items-baseline justify-between gap-2">
        <h2 id="equipo-titulo" className="text-[14px] font-bold text-foreground">
          Cuentas de la Oficina
        </h2>
        <span className="text-[12px] text-muted-foreground tabular-nums">
          {cuentas.length === 1 ? "1 cuenta" : `${cuentas.length} cuentas`}
        </span>
      </div>

      <ul className="flex flex-col divide-y divide-border">
        {cuentas.map((cuenta) => {
          const esPropia = cuenta.id === idActual;

          return (
            <li key={cuenta.id} className="flex items-center justify-between gap-3 py-2.5">
              <div className="flex min-w-0 items-center gap-2.5">
                <span
                  aria-hidden="true"
                  className="flex size-8 shrink-0 items-center justify-center rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-accent text-[13px] font-bold text-accent-foreground uppercase"
                >
                  {cuenta.email.charAt(0)}
                </span>
                <span className="truncate text-[13px] font-semibold text-foreground">{cuenta.email}</span>
                {esPropia && (
                  <span className="shrink-0 rounded-full bg-success-soft px-2 py-0.5 text-[11px] font-semibold text-success-soft-foreground">
                    Vos
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <span className="hidden sm:inline-block shrink-0 text-[12px] text-muted-foreground tabular-nums">
                  Desde el {fechaLarga(cuenta.creadaEl)}
                </span>

                {!esPropia && (
                  <AlertDialog>
                    <AlertDialogTrigger
                      render={
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={esUnicoAdmin || pendiente}
                          onClick={() => setSeleccionada(cuenta)}
                          title={esUnicoAdmin ? "No se puede dar de baja al único administrador" : "Dar de baja cuenta"}
                          className="h-7 px-2 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive gap-1"
                        >
                          <UserMinusIcon className="size-3.5" aria-hidden="true" />
                          <span>Dar de baja</span>
                        </Button>
                      }
                    />
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Dar de baja esta cuenta de administrador?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Estás por revocar el acceso a <strong className="text-foreground">{cuenta.email}</strong>.
                          Esta persona perderá el acceso a la Mesa de Trabajo de la Oficina de Empleo de inmediato.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          variant="destructive"
                          onClick={confirmarBaja}
                          disabled={pendiente}
                        >
                          {pendiente ? "Dando de baja…" : "Sí, dar de baja"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <p className="border-t border-border pt-2.5 text-[12px] text-muted-foreground">
        Las cuentas dadas de baja pierden acceso al sistema de inmediato. Siempre debe haber al menos un administrador activo.
      </p>
    </section>
  );
}
