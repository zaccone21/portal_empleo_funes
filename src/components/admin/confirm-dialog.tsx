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
import { Field, FieldLabel } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { MAXIMO_OBSERVACION, type OpcionMotivo } from "@/lib/validation/motivos-rechazo";

/** What the operator chose in a rejection: one of the fixed reasons and an optional note (D-069). */
export type MotivoElegido = { codigo: string; observacion: string };

type Props = {
  trigger: React.ReactElement;
  titulo: string;
  descripcion: string;
  textoConfirmar?: string;
  varianteConfirmar?: "default" | "destructive" | "outline";
  /** When given, the operator must pick one of these reasons before confirming (D-069). */
  motivos?: readonly OpcionMotivo[];
  onConfirmar: (motivo?: MotivoElegido) => Promise<void>;
};

/**
 * Diálogo de confirmación para acciones críticas. Con `motivos` pide elegir un
 * motivo fijo y deja una observación opcional (por ejemplo, para rechazar una
 * oferta o una empresa). Maneja el estado de carga durante la promesa.
 */
export function ConfirmDialog({
  trigger,
  titulo,
  descripcion,
  textoConfirmar = "Confirmar",
  varianteConfirmar = "default",
  motivos,
  onConfirmar,
}: Props) {
  const [abierto, setAbierto] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [codigo, setCodigo] = useState("");
  const [observacion, setObservacion] = useState("");

  const handleConfirmar = async () => {
    setCargando(true);
    try {
      await onConfirmar(motivos ? { codigo, observacion } : undefined);
      setAbierto(false);
      setCodigo("");
      setObservacion("");
    } finally {
      setCargando(false);
    }
  };

  const valido = motivos ? codigo !== "" : true;

  return (
    <AlertDialog open={abierto} onOpenChange={setAbierto}>
      <AlertDialogTrigger render={trigger} />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{titulo}</AlertDialogTitle>
          <AlertDialogDescription>{descripcion}</AlertDialogDescription>
        </AlertDialogHeader>

        {motivos && (
          <div className="my-4 grid gap-4">
            <RadioGroup
              aria-label="Motivo"
              value={codigo}
              onValueChange={(valor) => setCodigo(String(valor))}
              disabled={cargando}
            >
              {motivos.map((m) => (
                <Field key={m.codigo} orientation="horizontal" className="min-h-11 items-center">
                  <RadioGroupItem value={m.codigo} id={`motivo-${m.codigo}`} />
                  <FieldLabel htmlFor={`motivo-${m.codigo}`} className="min-h-11 flex-1 items-center font-normal">
                    {m.etiqueta}
                  </FieldLabel>
                </Field>
              ))}
            </RadioGroup>

            <div className="grid gap-2">
              <Label htmlFor="observacion">Observación (opcional)</Label>
              <Textarea
                id="observacion"
                value={observacion}
                onChange={(e) => setObservacion(e.target.value)}
                maxLength={MAXIMO_OBSERVACION}
                placeholder="Sumá un detalle si ayuda a corregirlo..."
                disabled={cargando}
                className="resize-none"
              />
            </div>
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
