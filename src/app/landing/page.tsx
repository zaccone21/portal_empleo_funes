import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Local-only preview page for UI components (D-009). Returns 404 in production.
export default function landingPage() {

  return (
    <main className="mx-auto w-full max-w-5xl space-y-8 px-4 py-8">
      <button> Buscar Empleo</button>
    </main>
  );
}
