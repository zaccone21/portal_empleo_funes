"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDownIcon, LogInIcon, LogOutIcon } from "lucide-react";
import { toast } from "sonner";

import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSalir } from "@/hooks/useSalir";
import { useSesion } from "@/hooks/useSesion";
import { INGRESO_POR_ROL } from "@/lib/rutas";
import { cn } from "@/lib/utils";
import type { UsuarioSesion } from "@/lib/validation/auth";
import type { Role } from "@/lib/validation/role";

import { REGISTRO_POR_AREA } from "./itemsNavegacion";

const NOMBRE_ROL: Record<Role, string> = {
  postulante: "Postulante",
  empresa: "Empresa",
  admin: "Oficina de Empleo",
};

/** Initial of the account in a mint "leaf" tile, the portal's signature shape. */
function InicialCuenta({ email, className }: { email: string; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-tl-xl rounded-tr-sm rounded-br-xl rounded-bl-sm bg-brand-mint font-heading text-base font-semibold text-brand-deep uppercase",
        className,
      )}
    >
      {email.charAt(0)}
    </span>
  );
}

/**
 * "Mi cuenta" (D-065): one button with the initial that opens who is in (role
 * and email) and "Salir". The screens (profile, help) stay in the menu bar.
 * The same on phones, where it shows only the initial (its name stays for
 * screen readers).
 */
function MenuCuenta({ usuario }: { usuario: UsuarioSesion }) {
  const { salir, loading } = useSalir();
  const router = useRouter();

  async function handleSalir() {
    if (await salir()) {
      toast.success("Saliste de tu cuenta.");
      router.replace(INGRESO_POR_ROL[usuario.rol]);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="group inline-flex h-11 shrink-0 items-center gap-2 rounded-lg px-1 text-primary-foreground outline-none hover:bg-primary-foreground/10 focus-visible:ring-3 focus-visible:ring-brand-mint/70 data-[popup-open]:bg-primary-foreground/10 sm:pr-2.5">
        <InicialCuenta email={usuario.email} />
        <span className="sr-only text-[15px] font-medium sm:not-sr-only">Mi cuenta</span>
        <ChevronDownIcon
          aria-hidden="true"
          className="hidden size-4 opacity-70 transition-transform group-data-[popup-open]:rotate-180 sm:block"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="w-72 p-1.5">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex items-center gap-3 px-2 py-2.5">
            <InicialCuenta email={usuario.email} />
            <span className="flex min-w-0 flex-col leading-tight">
              <span className="text-sm font-semibold text-foreground">{NOMBRE_ROL[usuario.rol]}</span>
              <span className="truncate text-sm font-normal text-muted-foreground">{usuario.email}</span>
            </span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={handleSalir} disabled={loading} className="min-h-11 text-base">
            <LogOutIcon aria-hidden="true" />
            {loading ? "Saliendo…" : "Salir"}
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * Account corner of the top bar (D-028, D-065):
 * - with a session: the "Mi cuenta" menu;
 * - without one (desktop only; on phones the bottom bar has them):
 *   "Ingresar", which comes back to this screen, and the area's registration
 *   as the mint button.
 */
export function BotonCuenta({ area }: { area: Role }) {
  const { usuario } = useSesion();
  const ruta = usePathname();

  if (usuario === undefined) {
    return <div aria-hidden="true" className="h-11 w-11 sm:w-36" />;
  }

  if (usuario) return <MenuCuenta usuario={usuario} />;

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
