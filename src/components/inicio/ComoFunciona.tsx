import Link from "next/link";
import { FileUpIcon, SendIcon, UserPlusIcon, type LucideIcon } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";

const PASOS: { icono: LucideIcon; titulo: string; texto: string }[] = [
  { icono: UserPlusIcon, titulo: "Creá tu cuenta", texto: "Solo necesitás un email y una contraseña." },
  { icono: FileUpIcon, titulo: "Subí tu CV", texto: "Un archivo PDF, desde el celular o la computadora." },
  {
    icono: SendIcon,
    titulo: "Postulate",
    texto: "La Oficina de Empleo revisa cada postulación y te contacta si tu perfil encaja.",
  },
];

/**
 * "Cómo postularte" on the home page (P01): the three steps, numbered because
 * they are a real sequence, so a first-time visitor knows what to expect
 * before starting. Ends with the way to start: creating the account.
 */
export function ComoFunciona() {
  return (
    <section aria-labelledby="como-funciona" className="flex flex-col gap-4">
      <h2 id="como-funciona" className="text-2xl font-semibold">
        Cómo postularte
      </h2>
      <ol className="grid gap-3 md:grid-cols-3">
        {PASOS.map(({ icono: Icono, titulo, texto }, i) => (
          <li
            key={titulo}
            className="flex gap-4 rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md bg-card p-5 ring-1 ring-foreground/5"
          >
            <span
              aria-hidden="true"
              className="flex size-12 shrink-0 items-center justify-center rounded-tl-xl rounded-br-xl rounded-tr-sm rounded-bl-sm bg-secondary text-primary"
            >
              <Icono className="size-6" />
            </span>
            <div className="flex flex-col gap-1">
              <p className="font-heading text-lg font-semibold">
                <span className="text-muted-foreground">{i + 1}. </span>
                {titulo}
              </p>
              <p className="text-base text-muted-foreground">{texto}</p>
            </div>
          </li>
        ))}
      </ol>
      <Link href="/postulante/registrarse" className={buttonVariants({ size: "lg", className: "self-start" })}>
        Crear mi cuenta
      </Link>
    </section>
  );
}
