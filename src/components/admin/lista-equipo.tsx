import { fechaLarga } from "@/lib/admin/fechas";
import type { CuentaOficina } from "@/lib/validation/equipo";

/**
 * The Office accounts (P21, D-058), oldest first, with "Vos" on the logged-in
 * one. There is no delete button on purpose: accounts are created from the
 * portal but never removed from it.
 */
export function ListaEquipo({ cuentas, idActual }: { cuentas: CuentaOficina[]; idActual: string }) {
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
        {cuentas.map((cuenta) => (
          <li key={cuenta.id} className="flex items-center justify-between gap-3 py-2.5">
            <div className="flex min-w-0 items-center gap-2.5">
              <span
                aria-hidden="true"
                className="flex size-8 shrink-0 items-center justify-center rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-accent text-[13px] font-bold text-accent-foreground uppercase"
              >
                {cuenta.email.charAt(0)}
              </span>
              <span className="truncate text-[13px] font-semibold text-foreground">{cuenta.email}</span>
              {cuenta.id === idActual && (
                <span className="shrink-0 rounded-full bg-success-soft px-2 py-0.5 text-[11px] font-semibold text-success-soft-foreground">
                  Vos
                </span>
              )}
            </div>
            <span className="shrink-0 text-[12px] text-muted-foreground tabular-nums">
              Desde el {fechaLarga(cuenta.creadaEl)}
            </span>
          </li>
        ))}
      </ul>
      <p className="border-t border-border pt-2.5 text-[12px] text-muted-foreground">
        Las cuentas no se borran desde el portal. Si hay que dar de baja a alguien, pedíselo a quien administra
        Supabase.
      </p>
    </section>
  );
}
