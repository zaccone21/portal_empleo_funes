import { CircleAlertIcon, RotateCwIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

type Props = {
  /** What failed to load, to complete "No pudimos cargar …" (for example "las ofertas"). */
  que: string;
  /** Message from the hook (D-013). */
  mensaje: string;
  /** Tries the request again. */
  onReintentar: () => void;
};

/**
 * Error state of any screen that loads data: says what failed and offers one
 * way out, "Probar de nuevo". Used by the offer list and "Mis postulaciones".
 */
export function ErrorAlCargar({ que, mensaje, onReintentar }: Props) {
  return (
    <div className="flex flex-col items-start gap-4">
      <Alert variant="destructive">
        <CircleAlertIcon aria-hidden="true" />
        <AlertTitle className="text-base">No pudimos cargar {que}</AlertTitle>
        <AlertDescription className="text-base">{mensaje}</AlertDescription>
      </Alert>
      <Button variant="outline" size="lg" onClick={onReintentar}>
        <RotateCwIcon data-icon="inline-start" aria-hidden="true" />
        Probar de nuevo
      </Button>
    </div>
  );
}
