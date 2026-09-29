"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOutIcon } from "lucide-react";
import { toast } from "sonner";

import { Button, buttonVariants } from "@/components/ui/button";
import { useSalir } from "@/hooks/useSalir";
import { useSesion } from "@/hooks/useSesion";
import { INGRESO_POR_ROL } from "@/lib/rutas";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/validation/role";

/** Registration screen of each area, where one exists (the Office has none, RF1.1.4). */
const REGISTRO: Partial<Record<Role, string>> = {
  applicant: "/postulante/registrarse",
  company: "/empresa/registrarse",
};

/**
 * The account corner of the top bar (D-028).
 *
 * - Logged in: the email (desktop only) and a visible "Salir" button, also on
 *   phones. It is a plain button and not a hidden menu, because an icon menu
 *   is easy to miss for people with little digital experience. After logging
 *   out it goes to the login of the role that left, with a toast.
 * - Nobody logged in (desktop only; on phones the bottom bar has it):
 *   "Ingresar", which brings the person back to this same screen afterwards
 *   (?volver=), and the registration of the area.
 * - While the session loads it keeps the space, so the bar does not jump.
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
      <div className="flex items-center gap-3">
        <span className="hidden max-w-56 truncate text-sm text-primary-foreground/75 lg:block">{usuario.email}</span>
        <Button
          variant="ghost"
          onClick={handleSalir}
          disabled={loading}
          className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
        >
          <LogOutIcon data-icon="inline-start" aria-hidden="true" />
          Salir
        </Button>
      </div>
    );
  }

  const registro = REGISTRO[area];
  return (
    <div className="hidden items-center gap-2 lg:flex">
      {registro && (
        <Link
          href={registro}
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground",
          )}
        >
          Crear cuenta
        </Link>
      )}
      <Link
        href={`${INGRESO_POR_ROL[area]}?volver=${encodeURIComponent(ruta)}`}
        className={cn(buttonVariants(), "bg-brand-mint text-brand-deep hover:bg-brand-mint/90")}
      >
        Ingresar
      </Link>
    </div>
  );
}
