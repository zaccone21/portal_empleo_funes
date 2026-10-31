"use client";

import { useRef, useState, useTransition, type FormEvent } from "react";
import { CalendarIcon } from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import { z } from "zod";

import { BotonAdmin } from "@/components/admin/boton-admin";
import { AnimarColapsable } from "@/components/marca/animaciones";
import { SelectorNativo } from "@/components/formularios/SelectorNativo";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { registrarDerivacionCursoAccion } from "@/lib/actions/oficina";
import { fechaDia, hoyArgentino } from "@/lib/admin/fechas";
import {
  derivacionCursoSchema,
  type CursoOficina,
  type DatosDerivacionCurso,
} from "@/lib/validation/oficina";

type Errores = Partial<Record<keyof DatosDerivacionCurso, string[]>>;

type Props = {
  postulanteId: string;
  cursosDisponibles?: CursoOficina[];
};

/**
 * Registers that the Office referred the applicant to a training course (P19,
 * RF1.6.6, D-047): allows picking an active course from the catalog (`cursos`)
 * or typing a custom course name, plus the day (today by default) and notes.
 * Sends an email notification to the applicant automatically.
 */
export function FormularioDerivacionCurso({ postulanteId, cursosDisponibles = [] }: Props) {
  const formulario = useRef<HTMLFormElement>(null);
  const [pendiente, iniciar] = useTransition();
  const [errores, setErrores] = useState<Errores>({});
  const cursosActivos = cursosDisponibles.filter((c) => c.activo);
  const [cursoElegidoId, setCursoElegidoId] = useState<string>(cursosActivos.length > 0 ? "" : "__manual__");
  const [fecha, setFecha] = useState<string>(hoyArgentino());

  const usaManual = cursoElegidoId === "__manual__" || cursosActivos.length === 0;
  const cursoSeleccionado = cursosActivos.find((c) => c.id === cursoElegidoId);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const nombreCurso = usaManual
      ? String(formData.get("curso") ?? "")
      : (cursoSeleccionado?.nombre ?? "");

    const resultado = derivacionCursoSchema.safeParse({
      ...(cursoSeleccionado ? { cursoId: cursoSeleccionado.id } : {}),
      curso: nombreCurso,
      fecha: fecha || hoyArgentino(),
      notas: formData.get("curso-notas") ?? "",
    });
    if (!resultado.success) {
      setErrores(z.flattenError(resultado.error).fieldErrors);
      return;
    }
    setErrores({});

    iniciar(async () => {
      const respuesta = await registrarDerivacionCursoAccion(postulanteId, resultado.data);
      if (respuesta.ok) {
        toast.success(respuesta.mensaje);
        formulario.current?.reset();
        setCursoElegidoId(cursosActivos.length > 0 ? "" : "__manual__");
        setFecha(hoyArgentino());
      } else {
        toast.error(respuesta.mensaje);
      }
    });
  }

  return (
    <form
      ref={formulario}
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-col gap-3 rounded-[10px] border border-border bg-surface p-3"
    >
      <span className="text-[11px] font-medium text-muted-foreground uppercase">Derivar a un curso</span>
      <FieldGroup className="gap-3">
        {cursosActivos.length > 0 && (
          <Field data-invalid={!usaManual && errores.curso ? true : undefined}>
            <FieldLabel htmlFor="curso-catalogo">Elegir curso del catálogo</FieldLabel>
            <SelectorNativo
              id="curso-catalogo"
              value={cursoElegidoId}
              onChange={(e) => setCursoElegidoId(e.target.value)}
              aria-invalid={!usaManual && errores.curso ? true : undefined}
            >
              <option value="">Seleccioná un curso…</option>
              {cursosActivos.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                  {c.modalidad ? ` · ${c.modalidad}` : ""}
                </option>
              ))}
              <option value="__manual__">Otro curso (escribir nombre manualmente)…</option>
            </SelectorNativo>
            {!usaManual && <FieldError>{errores.curso?.[0]}</FieldError>}
          </Field>
        )}

        <AnimarColapsable abierto={usaManual}>
          <Field data-invalid={errores.curso ? true : undefined} className="pt-1">
            <FieldLabel htmlFor="curso">Nombre del curso</FieldLabel>
            <Input
              id="curso"
              name="curso"
              maxLength={120}
              aria-invalid={errores.curso ? true : undefined}
              aria-describedby={errores.curso ? "curso-error" : undefined}
            />
            <FieldError id="curso-error">{errores.curso?.[0]}</FieldError>
          </Field>
        </AnimarColapsable>

        <Field data-invalid={errores.fecha ? true : undefined}>
          <FieldLabel htmlFor="curso-fecha">Fecha</FieldLabel>
          <Popover>
            <PopoverTrigger
              render={
                <Button
                  id="curso-fecha"
                  type="button"
                  variant="outline"
                  aria-invalid={errores.fecha ? true : undefined}
                  aria-describedby={errores.fecha ? "curso-fecha-error" : undefined}
                  className="h-10 w-full justify-start gap-2 bg-background text-left text-sm font-normal"
                >
                  <CalendarIcon className="size-4 text-primary" aria-hidden="true" />
                  <span>{fecha ? fechaDia(fecha) : "Elegir fecha"}</span>
                </Button>
              }
            />
            <PopoverContent align="start" className="w-auto p-3">
              <Calendar
                mode="single"
                selected={fecha ? parseISO(fecha) : undefined}
                onSelect={(d) => d && setFecha(format(d, "yyyy-MM-dd"))}
                locale={es}
              />
            </PopoverContent>
          </Popover>
          <input type="hidden" name="curso-fecha" value={fecha} />
          <FieldError id="curso-fecha-error">{errores.fecha?.[0]}</FieldError>
        </Field>
        <Field data-invalid={errores.notas ? true : undefined}>
          <FieldLabel htmlFor="curso-notas">Notas (opcional)</FieldLabel>
          <Textarea id="curso-notas" name="curso-notas" maxLength={1000} className="min-h-20" />
          <FieldError>{errores.notas?.[0]}</FieldError>
        </Field>
      </FieldGroup>
      <BotonAdmin type="submit" variante="primario" disabled={pendiente} className="self-start">
        {pendiente ? "Registrando…" : "Asignar curso y enviar por mail"}
      </BotonAdmin>
    </form>
  );
}
