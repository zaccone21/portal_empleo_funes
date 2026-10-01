import Link from "next/link";

import { LogoMunicipalidad } from "@/components/marca/LogoMunicipalidad";

/**
 * Footer of the home page: the municipal logo in its original color (on
 * white), who runs the portal, and the discreet entrance for the Office staff
 * (P13), which only they need.
 */
export function PieInicio() {
  return (
    <footer className="flex flex-col gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <LogoMunicipalidad variante="color" className="h-[26px] w-[92px] shrink-0" />
        <p className="text-sm text-muted-foreground">Oficina de Empleo de la Municipalidad de Funes</p>
      </div>
      <Link
        href="/admin/ingresar"
        className="inline-flex min-h-11 items-center text-sm text-muted-foreground underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        Ingreso para la Oficina de Empleo
      </Link>
    </footer>
  );
}
