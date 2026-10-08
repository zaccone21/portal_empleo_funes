"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  trigger: React.ReactElement;
  titulo: string;
  descripcion: string;
  textoConfirmar?: string;
  varianteConfirmar?: "default" | "destructive" | "outline";
  requiereMotivo?: boolean;
  etiquetaMotivo?: string;
  onConfirmar: (motivo?: string) => Promise<void>;
};

/**
 * Diálogo de confirmación para acciones críticas, opcionalmente requiere un motivo
 * (ej. para rechazar o descartar). Maneja estado de carga durante la promesa.
 */
export function ConfirmDialog({
  trigger,
  titulo,
  descripcion,
  textoConfirmar = "Confirmar",
  varianteConfirmar = "default",
  requiereMotivo = false,
  etiquetaMotivo = "Motivo",
  onConfirmar,
}: Props) {
  const [abierto, setAbierto] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [motivo, setMotivo] = useState("");

  const handleConfirmar = async () => {
    setCargando(true);
    try {
      await onConfirmar(requiereMotivo ? motivo : undefined);
      setAbierto(false);
      setMotivo("");
    } finally {
      setCargando(false);
    }
  };

  const valido = requiereMotivo ? motivo.trim().length > 0 : true;

  return (
    <AlertDialog open={abierto} onOpenChange={setAbierto}>
      <AlertDialogTrigger render={trigger} />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{titulo}</AlertDialogTitle>
          <AlertDialogDescription>{descripcion}</AlertDialogDescription>
        </AlertDialogHeader>

        {requiereMotivo && (
          <div className="my-4 grid gap-2">
            <Label htmlFor="motivo">{etiquetaMotivo}</Label>
            <Textarea
              id="motivo"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Explicá el motivo de esta decisión..."
              disabled={cargando}
              className="resize-none"
            />
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={cargando}>Cancelar</AlertDialogCancel>
          <Button
            variant={varianteConfirmar}
            disabled={!valido || cargando}
            onClick={handleConfirmar}
          >
            {cargando && <Loader2 className="mr-2 size-4 animate-spin" />}
            {textoConfirmar}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
