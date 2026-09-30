"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogInIcon } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { INGRESO_POR_ROL } from "@/lib/rutas";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/validation/role";

/** Self-registration of each role; the Office has none (RF1.1.4). */
const REGISTRO: Partial<Record<Role, { href: string; texto: string }>> = {
  postulante: { href: "/postulante/registrarse", texto: "Crear una cuenta" },
  empresa: { href: "/empresa/registrarse", texto: "Registrar la empresa" },
};

type Props = {
  /** Who this screen is for; decides which login and registration to offer. */
  rol: Role;
  titulo: string;
  descripcion: string;
};

/**
 * Shown by a private screen when the server answered 401 (nobody logged in)
 * or 403 (logged in with another role). It is not an error: it tells the
 * person what the screen is for and gives the way in.
 *
 * "Ingresar" carries ?volver= with this screen's path, so after logging in
 * the person lands back here instead of on the role's home.
 */
export function PedirIngreso({ rol, titulo, descripcion }: Props) {
  const ruta = usePathname();
  const registro = REGISTRO[rol];

  return (
    <Empty className="rounded-tl-2xl rounded-br-2xl bg-card">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <LogInIcon aria-hidden="true" />
        </EmptyMedia>
        <EmptyTitle>{titulo}</EmptyTitle>
        <EmptyDescription className="text-base">{descripcion}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Link
          href={`${INGRESO_POR_ROL[rol]}?volver=${encodeURIComponent(ruta)}`}
          className={cn(buttonVariants({ size: "lg" }), "w-full")}
        >
          Ingresar
        </Link>
        {registro && (
          <Link href={registro.href} className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full")}>
            {registro.texto}
          </Link>
        )}
      </EmptyContent>
    </Empty>
  );
}
