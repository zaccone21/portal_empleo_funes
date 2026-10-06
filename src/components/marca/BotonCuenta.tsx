"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOutIcon } from "lucide-react";
import { toast } from "sonner";

import { Button, buttonVariants } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useSalir } from "@/hooks/useSalir";
import { useSesion } from "@/hooks/useSesion";
import { INGRESO_POR_ROL } from "@/lib/rutas";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/validation/role";

import { ITEM_PERFIL_POR_ROL } from "./itemsNavegacion";

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

    const itemPerfil = ITEM_PERFIL_POR_ROL[usuario.rol];
    const Icono = itemPerfil.icono;

    return (
      <div className="flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                className="gap-2 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
              />
            }
          >
            <span className="text-sm font-medium">{itemPerfil.texto}</span>
            <Icono className="size-5" aria-hidden="true" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="border-b px-3 py-2 text-xs text-muted-foreground">
              <p className="font-medium text-foreground">{itemPerfil.texto}</p>
              <p className="truncate text-muted-foreground">{usuario.email}</p>
            </div>
            <DropdownMenuItem render={<Link href={itemPerfil.href} className="w-full cursor-pointer" />}>
              <Icono className="mr-2 size-4" />
              <span>{itemPerfil.texto}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSalir} disabled={loading} className="cursor-pointer text-destructive focus:text-destructive">
              <LogOutIcon className="mr-2 size-4" />
              <span>Salir</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  return (
    <div className="hidden items-center gap-2 lg:flex">
      <Link
        href={`${INGRESO_POR_ROL[area]}?volver=${encodeURIComponent(ruta)}`}
        className={cn(buttonVariants(), "bg-brand-mint text-brand-deep hover:bg-brand-mint/90")}
      >
        Ingresar
      </Link>
    </div>
  );
}
