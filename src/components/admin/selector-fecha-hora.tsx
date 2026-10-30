"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, ChevronDownIcon, ClockIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type Props = {
  id?: string;
  name?: string;
  defaultValue?: string; // "yyyy-MM-ddThh:mm"
  value?: string;
  onChange?: (nuevoValor: string) => void;
  disabled?: boolean;
  "aria-invalid"?: boolean | "true" | "false";
  "aria-describedby"?: string;
  placeholder?: string;
  className?: string;
};

const HORARIOS_SUGERIDOS = [
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
  "18:30",
  "19:00",
  "19:30",
  "20:00",
];

function desglosarValor(valor?: string): { fecha?: Date; hora: string } {
  if (!valor || !valor.includes("T")) {
    return { fecha: undefined, hora: "09:00" };
  }
  const [f, h] = valor.split("T");
  const [y, m, d] = f.split("-").map(Number);
  if (!y || !m || !d) {
    return { fecha: undefined, hora: h || "09:00" };
  }
  const fechaObj = new Date(y, m - 1, d, 12, 0, 0);
  return {
    fecha: isNaN(fechaObj.getTime()) ? undefined : fechaObj,
    hora: h ? h.slice(0, 5) : "09:00",
  };
}

function armarValor(fecha?: Date, hora = "09:00"): string {
  if (!fecha || isNaN(fecha.getTime())) return "";
  const f = format(fecha, "yyyy-MM-dd");
  return `${f}T${hora}`;
}

/**
 * Custom date & time selector using shadcn/ui Calendar and Popover.
 * Never uses native browser date/datetime-local pickers.
 * Outputs values in "yyyy-MM-ddThh:mm" compatible with FormData and Argentine offset helpers.
 */
export function SelectorFechaHora({
  id,
  name,
  defaultValue,
  value: valueProp,
  onChange,
  disabled = false,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
  placeholder = "Elegir fecha y horario…",
  className,
}: Props) {
  const [abierto, setAbierto] = useState(false);

  const esControlado = valueProp !== undefined;
  const inicial = useMemo(() => desglosarValor(defaultValue), [defaultValue]);
  const [fechaInterna, setFechaInterna] = useState<Date | undefined>(inicial.fecha);
  const [horaInterna, setHoraInterna] = useState<string>(inicial.hora);

  const desglosadoProp = useMemo(
    () => (esControlado ? desglosarValor(valueProp) : null),
    [esControlado, valueProp],
  );

  const fechaSeleccionada = esControlado ? desglosadoProp?.fecha : fechaInterna;
  const horaSeleccionada = esControlado ? (desglosadoProp?.hora ?? "09:00") : horaInterna;

  const valorCompuesto = armarValor(fechaSeleccionada, horaSeleccionada);

  function handleSeleccionarDia(dia?: Date) {
    if (!dia) return;
    if (!esControlado) {
      setFechaInterna(dia);
    }
    const nuevo = armarValor(dia, horaSeleccionada);
    onChange?.(nuevo);
  }

  function handleCambiarHora(nuevaHora: string) {
    if (!esControlado) {
      setHoraInterna(nuevaHora);
    }
    if (fechaSeleccionada) {
      const nuevo = armarValor(fechaSeleccionada, nuevaHora);
      onChange?.(nuevo);
    }
  }

  const textoLegible = fechaSeleccionada
    ? `${format(fechaSeleccionada, "EEEE d 'de' MMMM", { locale: es })} · ${horaSeleccionada} hs`
    : placeholder;

  return (
    <div className={cn("relative flex w-full flex-col gap-1", className)}>
      {/* Hidden input for FormData compatibility */}
      {name && (
        <input
          type="hidden"
          id={id}
          name={name}
          value={valorCompuesto}
          aria-invalid={ariaInvalid}
          aria-describedby={ariaDescribedBy}
        />
      )}

      <Popover open={abierto} onOpenChange={setAbierto}>
        <PopoverTrigger
          render={
            <Button
              type="button"
              variant="outline"
              disabled={disabled}
              aria-invalid={ariaInvalid}
              aria-describedby={ariaDescribedBy}
              className={cn(
                "h-11 w-full justify-between rounded-lg border-input bg-background px-3 text-left text-sm font-normal shadow-2xs hover:bg-surface focus-visible:ring-2 focus-visible:ring-primary",
                !fechaSeleccionada && "text-muted-foreground",
                ariaInvalid && "border-destructive ring-destructive/20",
              )}
            >
              <span className="flex items-center gap-2 truncate capitalize">
                <CalendarIcon
                  data-icon="inline-start"
                  aria-hidden="true"
                  className="size-4 shrink-0 text-primary"
                />
                <span className="truncate">{textoLegible}</span>
              </span>
              <ChevronDownIcon
                aria-hidden="true"
                className="size-4 shrink-0 opacity-50 transition-transform"
              />
            </Button>
          }
        />

        <PopoverContent align="start" className="w-auto p-4 max-w-sm">
          <PopoverHeader className="pb-2">
            <PopoverTitle className="text-sm font-semibold text-foreground">
              Seleccionar día y horario
            </PopoverTitle>
          </PopoverHeader>

          <div className="flex flex-col gap-3">
            <Calendar
              mode="single"
              selected={fechaSeleccionada}
              onSelect={handleSeleccionarDia}
              locale={es}
              className="rounded-lg border border-border p-2"
            />

            <div className="flex flex-col gap-1.5 rounded-lg border border-border bg-surface p-2.5">
              <label
                htmlFor={`${id || name || "hora"}-selector`}
                className="flex items-center gap-1.5 text-[12px] font-semibold text-foreground"
              >
                <ClockIcon aria-hidden="true" className="size-3.5 text-primary" />
                Horario de la cita:
              </label>

              <select
                id={`${id || name || "hora"}-selector`}
                value={horaSeleccionada}
                onChange={(e) => handleCambiarHora(e.target.value)}
                className="h-9 w-full rounded-md border border-input bg-background px-2.5 text-sm font-medium text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
              >
                {HORARIOS_SUGERIDOS.map((h) => (
                  <option key={h} value={h}>
                    {h} hs
                  </option>
                ))}
              </select>
            </div>

            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={() => setAbierto(false)}
              className="w-full font-semibold"
            >
              Confirmar selección
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
