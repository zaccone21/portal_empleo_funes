"use client";

import Link from "next/link";
import { FileUpIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { useMiCv } from "@/hooks/useMiCv";
import { cn } from "@/lib/utils";

/**
 * Tells a logged-in applicant, above the offer list, that they still have no
 * CV, before they find out by pressing "Postularme" (RF1.4.4), with a direct
 * way to upload it. Render it only for applicants (it asks for their CV).
 *
 * It shows nothing while loading, when the CV exists, or when the question
 * fails: it is a shortcut, and the rule itself is enforced when applying.
 */
export function AvisoCvFaltante() {
  const { cv } = useMiCv();

  if (cv !== null) {
    return null;
  }

  return (
    <Alert>
      <FileUpIcon aria-hidden="true" />
      <AlertTitle className="text-base">Subí tu CV para poder postularte</AlertTitle>
      <AlertDescription className="text-base">Es un PDF y lleva un minuto.</AlertDescription>
      {/* Outside AlertDescription, which underlines every link inside it. */}
      <Link
        href="/postulante/perfil#cv"
        className={cn(buttonVariants({ variant: "outline" }), "col-start-2 mt-2 justify-self-start")}
      >
        Subir mi CV
      </Link>
    </Alert>
  );
}
