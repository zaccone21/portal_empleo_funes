import Link from "next/link";

import { MosaicoOficios } from "@/components/marca/MosaicoOficios";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * The companies' way in from the home page (P01, RF1.1.1): who it is for,
 * what the Office does for them, and the two buttons (register, or log in if
 * they already have an account). On the brand green with a strip of the
 * mosaic, so it reads as a different audience than the rest of the page.
 */
export function ParaEmpresas() {
  return (
    <section
      aria-labelledby="para-empresas"
      className="relative isolate flex flex-col items-start gap-4 overflow-hidden rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md bg-brand-deep p-6 text-primary-foreground sm:p-8"
    >
      <MosaicoOficios
        cantidad={24}
        className="absolute inset-y-0 right-0 -z-10 w-1/2 [mask-image:linear-gradient(to_right,transparent,black)] max-sm:hidden"
      />
      <h2 id="para-empresas" className="max-w-md text-2xl leading-tight font-semibold">
        ¿Tenés una empresa o un comercio en Funes?
      </h2>
      <p className="max-w-md text-base text-primary-foreground/80">
        Publicá tus búsquedas y la Oficina de Empleo te acerca candidatos de la ciudad.
      </p>
      <div className="flex flex-wrap gap-2">
        <Link
          href="/empresa/registrarse"
          className={cn(buttonVariants({ size: "lg" }), "bg-brand-mint text-brand-deep hover:bg-brand-mint/90")}
        >
          Registrar mi empresa
        </Link>
        <Link
          href="/empresa/ingresar"
          className={cn(
            buttonVariants({ variant: "ghost", size: "lg" }),
            "text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground",
          )}
        >
          Ya tengo cuenta
        </Link>
      </div>
    </section>
  );
}
