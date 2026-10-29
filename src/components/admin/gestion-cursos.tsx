"use client";

import { useRef, useState, useTransition, type FormEvent } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { z } from "zod";

import { BotonAdmin } from "@/components/admin/boton-admin";
import { nombreCompleto } from "@/components/admin/celdas";
import { EnlaceAccion } from "@/components/admin/enlace-accion";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { AnimarColapsable } from "@/components/marca/animaciones";
import { SelectorNativo } from "@/components/formularios/SelectorNativo";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  alternarCursoAccion,
  crearCursoAccion,
  registrarDerivacionCursoAccion,
} from "@/lib/actions/oficina";
import { fechaCorta, haceCuanto, hoyArgentino } from "@/lib/admin/fechas";
import { conDesde } from "@/lib/admin/url";
import {
  cursoCatalogoSchema,
  type CursoOficina,
  type DatosCursoCatalogo,
  type PostulanteConRechazos,
} from "@/lib/validation/oficina";

type Props = {
  cursos: CursoOficina[];
  postulantesConRechazos: PostulanteConRechazos[];
};

type ErroresCurso = Partial<Record<keyof DatosCursoCatalogo, string[]>>;

function AsignadorRapidoCurso({
  postulante,
  cursosActivos,
}: {
  postulante: PostulanteConRechazos;
  cursosActivos: CursoOficina[];
}) {
  const [pendiente, iniciar] = useTransition();
  const [cursoElegido, setCursoElegido] = useState<string>("");
  const [nombreManual, setNombreManual] = useState<string>("");
  const [error, setError] = useState<string | undefined>(undefined);

  const usaManual = cursoElegido === "__manual__" || cursosActivos.length === 0;

  function handleAsignar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cursoCatalogo = cursosActivos.find((c) => c.id === cursoElegido);
    const nombreCurso = usaManual ? nombreManual.trim() : (cursoCatalogo?.nombre ?? "");

    if (!nombreCurso) {
      setError("Elegí o escribí un curso");
      return;
    }
    setError(undefined);

    iniciar(async () => {
      const respuesta = await registrarDerivacionCursoAccion(postulante.postulanteId, {
        ...(cursoCatalogo ? { cursoId: cursoCatalogo.id } : {}),
        curso: nombreCurso,
        fecha: hoyArgentino(),
        notas: `Derivación por acumular ${postulante.cantidadRechazos} rechazos de empresas.`,
      });
      if (respuesta.ok) {
        toast.success(respuesta.mensaje);
        setCursoElegido("");
        setNombreManual("");
      } else {
        toast.error(respuesta.mensaje);
      }
    });
  }

  return (
    <form onSubmit={handleAsignar} noValidate className="flex flex-wrap items-start gap-2">
      <div className="flex min-w-52 flex-col gap-1">
        {cursosActivos.length > 0 && (
          <SelectorNativo
            aria-label={`Curso para ${nombreCompleto(postulante) ?? "postulante"}`}
            value={cursoElegido}
            onChange={(e) => setCursoElegido(e.target.value)}
          >
            <option value="">Elegir curso del catálogo…</option>
            {cursosActivos.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
                {c.modalidad ? ` · ${c.modalidad}` : ""}
              </option>
            ))}
            <option value="__manual__">Otro curso (escribir nombre)…</option>
          </SelectorNativo>
        )}
        <AnimarColapsable abierto={usaManual}>
          <Input
            placeholder="Nombre del curso a asignar"
            value={nombreManual}
            onChange={(e) => setNombreManual(e.target.value)}
            maxLength={120}
            aria-label="Nombre del curso"
            className="mt-1"
          />
        </AnimarColapsable>
        {error && <span className="text-[11.5px] font-medium text-destructive">{error}</span>}
      </div>
      <BotonAdmin type="submit" variante="primario" disabled={pendiente}>
        {pendiente ? "Asignando…" : "Asignar y enviar mail"}
      </BotonAdmin>
    </form>
  );
}

/**
 * Office screen `/admin/cursos`:
 * 1. Top queue of applicants with 3 or more company rejections so the operator
 *    can assign them a special training course in one step (notifying by email).
 * 2. Course catalog management: load new courses and activate/pause existing ones.
 */
export function GestionCursos({ cursos, postulantesConRechazos }: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const [pendienteCrear, iniciarCrear] = useTransition();
  const [pendienteEstadoId, setPendienteEstadoId] = useState<string | null>(null);
  const [, iniciarEstado] = useTransition();
  const [errores, setErrores] = useState<ErroresCurso>({});

  const cursosActivos = cursos.filter((c) => c.activo);

  function handleCrearCurso(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const resultado = cursoCatalogoSchema.safeParse({
      nombre: formData.get("curso-nombre") ?? "",
      modalidad: formData.get("curso-modalidad") ?? "",
      horario: formData.get("curso-horario") ?? "",
      descripcion: formData.get("curso-descripcion") ?? "",
    });

    if (!resultado.success) {
      setErrores(z.flattenError(resultado.error).fieldErrors);
      return;
    }
    setErrores({});

    iniciarCrear(async () => {
      const respuesta = await crearCursoAccion(resultado.data);
      if (respuesta.ok) {
        toast.success(respuesta.mensaje);
        formRef.current?.reset();
      } else {
        toast.error(respuesta.mensaje);
      }
    });
  }

  function handleAlternarCurso(curso: CursoOficina) {
    setPendienteEstadoId(curso.id);
    iniciarEstado(async () => {
      const respuesta = await alternarCursoAccion(curso.id, !curso.activo);
      setPendienteEstadoId(null);
      if (respuesta.ok) toast.success(respuesta.mensaje);
      else toast.error(respuesta.mensaje);
    });
  }

  return (
    <div className="flex flex-1 flex-col gap-5">
      <PageHeader
        migas={["Gestión", "Cursos"]}
        titulo="Cursos y Capacitaciones"
        aside={`${cursosActivos.length} cursos activos · ${postulantesConRechazos.length} postulantes con 3+ rechazos`}
      />

      {/* Section 1: Applicants with 3 or more company rejections */}
      <section className="flex flex-col gap-3 rounded-[10px] border border-border bg-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
          <div className="flex flex-col gap-0.5">
            <h2 className="text-[15px] font-bold text-foreground">
              Postulantes con 3 o más rechazos de empresas ({postulantesConRechazos.length})
            </h2>
            <p className="text-[12.5px] text-muted-foreground">
              Al acumular 3 rechazos en ofertas derivadas, la Oficina puede asignarles una capacitación especial que les llega por correo electrónico.
            </p>
          </div>
        </div>

        {postulantesConRechazos.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-1 rounded-[8px] border border-dashed border-border py-8 text-center text-muted-foreground">
            <p className="text-[13.5px] font-semibold text-foreground">No hay postulantes con 3 o más rechazos</p>
            <p className="text-[12.5px]">Cuando una persona acumule 3 decisiones de no contratación aparecerá en esta lista.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-[13px]">
              <thead>
                <tr className="border-b border-border text-[11px] tracking-wider text-muted-foreground uppercase">
                  <th className="py-2.5 pr-3 font-semibold">Postulante</th>
                  <th className="py-2.5 pr-3 font-semibold">Rechazos</th>
                  <th className="py-2.5 pr-3 font-semibold">Último rechazo</th>
                  <th className="py-2.5 pr-3 font-semibold">Cursos ya asignados</th>
                  <th className="py-2.5 pr-3 font-semibold">Asignar curso ahora</th>
                  <th className="py-2.5 pl-3 text-right font-semibold">Ficha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {postulantesConRechazos.map((p) => {
                  const nombre = nombreCompleto(p) ?? "Sin nombre";
                  return (
                    <tr key={p.postulanteId} className="hover:bg-row-hover">
                      <td className="py-3 pr-3 align-top">
                        <div className="flex flex-col leading-tight">
                          <Link
                            href={conDesde(`/admin/postulantes/${p.postulanteId}`, "/admin/cursos")}
                            className="font-bold text-foreground hover:text-primary hover:underline"
                          >
                            {nombre}
                          </Link>
                          <span className="text-[12px] text-muted-foreground">
                            {p.dni ? `DNI ${p.dni}` : "Sin DNI"}
                            {p.email ? ` · ${p.email}` : " · Sin email"}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 pr-3 align-top">
                        <StatusBadge etiqueta={`${p.cantidadRechazos} rechazos`} tono="attention" />
                      </td>
                      <td className="py-3 pr-3 align-top text-[12.5px] text-muted-foreground">
                        {fechaCorta(p.ultimoRechazoEl)} · {haceCuanto(p.ultimoRechazoEl)}
                      </td>
                      <td className="py-3 pr-3 align-top">
                        {p.cursosAsignados.length === 0 ? (
                          <span className="text-[12.5px] text-muted-foreground">Ninguno todavía</span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {p.cursosAsignados.map((c, idx) => (
                              <StatusBadge key={`${c}-${idx}`} etiqueta={c} tono="success" />
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="py-3 pr-3 align-top">
                        <AsignadorRapidoCurso postulante={p} cursosActivos={cursosActivos} />
                      </td>
                      <td className="py-3 pl-3 text-right align-top">
                        <EnlaceAccion href={conDesde(`/admin/postulantes/${p.postulanteId}#cursos`, "/admin/cursos")}>
                          Ver ficha
                        </EnlaceAccion>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Section 2: Course catalog & New course form */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:items-start">
        <section className="flex flex-col gap-3 rounded-[10px] border border-border bg-card p-4">
          <div className="flex items-center justify-between border-b border-border pb-2.5">
            <h2 className="text-[15px] font-bold text-foreground">Catálogo de cursos ({cursos.length})</h2>
          </div>

          {cursos.length === 0 ? (
            <p className="py-6 text-[13px] text-muted-foreground">
              Todavía no cargaste cursos en el catálogo. Usá el formulario de la derecha para cargar el primero.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-[13px]">
                <thead>
                  <tr className="border-b border-border text-[11px] tracking-wider text-muted-foreground uppercase">
                    <th className="py-2 pr-3 font-semibold">Curso</th>
                    <th className="py-2 pr-3 font-semibold">Modalidad / Horario</th>
                    <th className="py-2 pr-3 font-semibold">Estado</th>
                    <th className="py-2 pl-3 text-right font-semibold">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {cursos.map((c) => (
                    <tr key={c.id} className="hover:bg-row-hover">
                      <td className="py-3 pr-3 align-top">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-foreground">{c.nombre}</span>
                          {c.descripcion && (
                            <span className="text-[12px] text-muted-foreground">{c.descripcion}</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 pr-3 align-top text-[12.5px] text-muted-foreground">
                        {[c.modalidad, c.horario].filter(Boolean).join(" · ") || "Sin especificar"}
                      </td>
                      <td className="py-3 pr-3 align-top">
                        <StatusBadge
                          etiqueta={c.activo ? "Activo" : "Pausado"}
                          tono={c.activo ? "success" : "neutral"}
                        />
                      </td>
                      <td className="py-3 pl-3 text-right align-top">
                        <BotonAdmin
                          type="button"
                          disabled={pendienteEstadoId === c.id}
                          onClick={() => handleAlternarCurso(c)}
                        >
                          {c.activo ? "Pausar" : "Activar"}
                        </BotonAdmin>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="flex flex-col gap-3 rounded-[10px] border border-border bg-card p-4">
          <h2 className="text-[15px] font-bold text-foreground">Cargar nuevo curso</h2>
          <p className="text-[12.5px] text-muted-foreground">
            Los cursos activos quedan disponibles para asignarlos desde esta pantalla o desde la ficha de cualquier postulante.
          </p>
          <form ref={formRef} onSubmit={handleCrearCurso} noValidate className="flex flex-col gap-3">
            <FieldGroup className="gap-3">
              <Field data-invalid={errores.nombre ? true : undefined}>
                <FieldLabel htmlFor="curso-nombre">Nombre del curso</FieldLabel>
                <Input
                  id="curso-nombre"
                  name="curso-nombre"
                  maxLength={120}
                  placeholder="Ej. Atención al cliente y ventas"
                  aria-invalid={errores.nombre ? true : undefined}
                  aria-describedby={errores.nombre ? "curso-nombre-error" : undefined}
                />
                <FieldError id="curso-nombre-error">{errores.nombre?.[0]}</FieldError>
              </Field>
              <Field data-invalid={errores.modalidad ? true : undefined}>
                <FieldLabel htmlFor="curso-modalidad">Modalidad / Lugar (opcional)</FieldLabel>
                <Input
                  id="curso-modalidad"
                  name="curso-modalidad"
                  maxLength={100}
                  placeholder="Ej. Presencial · CIT Funes"
                />
                <FieldError>{errores.modalidad?.[0]}</FieldError>
              </Field>
              <Field data-invalid={errores.horario ? true : undefined}>
                <FieldLabel htmlFor="curso-horario">Días y horario (opcional)</FieldLabel>
                <Input
                  id="curso-horario"
                  name="curso-horario"
                  maxLength={120}
                  placeholder="Ej. Martes y jueves de 9 a 11 hs"
                />
                <FieldError>{errores.horario?.[0]}</FieldError>
              </Field>
              <Field data-invalid={errores.descripcion ? true : undefined}>
                <FieldLabel htmlFor="curso-descripcion">Descripción breve (opcional)</FieldLabel>
                <Textarea
                  id="curso-descripcion"
                  name="curso-descripcion"
                  maxLength={1000}
                  className="min-h-20"
                  placeholder="Qué temas cubre o qué requisitos tiene…"
                />
                <FieldError>{errores.descripcion?.[0]}</FieldError>
              </Field>
            </FieldGroup>
            <BotonAdmin type="submit" variante="primario" disabled={pendienteCrear} className="self-start">
              {pendienteCrear ? "Guardando curso…" : "Guardar curso en catálogo"}
            </BotonAdmin>
          </form>
        </section>
      </div>
    </div>
  );
}
