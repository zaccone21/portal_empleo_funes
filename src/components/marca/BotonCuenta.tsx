"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogInIcon, LogOutIcon } from "lucide-react";
import { toast } from "sonner";

import { Button, buttonVariants } from "@/components/ui/button";
import { useSalir } from "@/hooks/useSalir";
import { useSesion } from "@/hooks/useSesion";
import { INGRESO_POR_ROL } from "@/lib/rutas";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/validation/role";

import { REGISTRO_POR_AREA } from "./itemsNavegacion";

const NOMBRE_ROL: Record<Role, string> = {
  postulante: "Postulante",
  empresa: "Empresa",
  admin: "Oficina de Empleo",
};

/**
 * Account corner of the top bar (D-028):
 * - with a session: who is in (initial, role and email, from `2xl`, where the
 *   full menu still leaves room) and
 *   "Salir", always visible with icon and word, on phones too;
 * - without one (desktop only; on phones the bottom bar has them):
 *   "Ingresar", which comes back to this screen, and the area's registration
 *   as the mint button.
 */
export function BotonCuenta({ area }: { area: Role }) {
  const { usuario } = useSesion();
  const { salir, loading } = useSalir();
  const router = useRouter();
  const ruta = usePathname();

  if (usuario === undefined) {
    return <div aria-hidden="true" className="h-11 w-24" />;
  }

  if (usuario) {
    async function handleSalir() {
      if (usuario && (await salir())) {
        toast.success("Saliste de tu cuenta.");
        router.replace(INGRESO_POR_ROL[usuario.rol]);
      }
    }

    return (
      <div className="flex shrink-0 items-center gap-3">
        <div className="hidden items-center gap-2.5 2xl:flex">
          <span
            aria-hidden="true"
            className="flex size-9 shrink-0 items-center justify-center rounded-tl-xl rounded-tr-sm rounded-br-xl rounded-bl-sm bg-brand-mint font-heading text-base font-semibold text-brand-deep uppercase"
          >
            {usuario.email.charAt(0)}
          </span>
          <div className="flex max-w-44 flex-col leading-tight">
            <span className="text-sm font-semibold">{NOMBRE_ROL[usuario.rol]}</span>
            <span className="truncate text-xs text-primary-foreground/70">{usuario.email}</span>
          </div>
        </div>
        <Button
          variant="ghost"
          onClick={handleSalir}
          disabled={loading}
          className="border-primary-foreground/25 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground lg:border"
        >
          <LogOutIcon data-icon="inline-start" aria-hidden="true" />
          {loading ? "Saliendo…" : "Salir"}
        </Button>
      </div>
    );
  }

  const registro = REGISTRO_POR_AREA[area];

  return (
    <div className="hidden shrink-0 items-center gap-2 lg:flex">
      <Link
        href={`${INGRESO_POR_ROL[area]}?volver=${encodeURIComponent(ruta)}`}
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground",
        )}
      >
        <LogInIcon data-icon="inline-start" aria-hidden="true" />
        Ingresar
      </Link>
      {registro && (
        <Link href={registro.href} className={cn(buttonVariants(), "bg-brand-mint text-brand-deep hover:bg-brand-mint/90")}>
          {area === "empresa" ? "Registrar mi empresa" : registro.texto}
        </Link>
      )}
    </div>
  );
}
