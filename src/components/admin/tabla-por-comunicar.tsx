"use client";

import { BotonDerivar } from "@/components/admin/acciones-postulacion";
import { AdminTable, type ColumnaAdmin } from "@/components/admin/admin-table";
import { BotonAdmin } from "@/components/admin/boton-admin";
import { Ausente, CeldaDoble, nombreCompleto } from "@/components/admin/celdas";
import { EnlaceAccion } from "@/components/admin/enlace-accion";
import { fechaCorta } from "@/lib/admin/fechas";
import { enlaceLlamada, enlaceWhatsApp, formatearTelefonoAR } from "@/lib/telefonos";
import type { PostulacionAdmin } from "@/lib/validation/oficina";

type Props = {
  postulaciones: PostulacionAdmin[];
  pager: { desde: number; hasta: number; total: number; pagina: number; paginas: number };
  hayFiltros: boolean;
};

/** Screen 07 table: pre-selected applications waiting to be communicated to the company. */
export function TablaPorComunicar({ postulaciones, pager, hayFiltros }: Props) {
  const columnas: ColumnaAdmin<PostulacionAdmin>[] = [
    {
      id: "postulante",
      cabecera: "Postulante",
      celda: (p) => {
        const nombre = nombreCompleto(p.postulante);
        return (
          <CeldaDoble
            titulo={nombre || "Sin nombre cargado"}
            detalle={p.postulante.dni ? `DNI ${p.postulante.dni}` : <Ausente />}
          />
        );
      },
    },
    {
      id: "puesto",
      cabecera: "Puesto y empresa",
      celda: (p) => (
        <CeldaDoble
          titulo={p.oferta.titulo}
          detalle={p.oferta.empresa?.razonSocial ?? "Empresa"}
        />
      ),
    },
    {
      id: "contactoEmpresa",
      cabecera: "Contacto empresa",
      celda: (p) => {
        const emp = p.oferta.empresa;
        if (!emp) return <Ausente />;
        const wsp = enlaceWhatsApp(emp.contactoTelefono);

        return (
          <div className="flex items-center gap-1.5">
            {wsp && (
              <BotonAdmin
                render={<a href={wsp} target="_blank" rel="noopener noreferrer" />}
              >
                WhatsApp
              </BotonAdmin>
            )}
            {emp.contactoTelefono && (
              <BotonAdmin
                render={<a href={enlaceLlamada(emp.contactoTelefono)} />}
              >
                {formatearTelefonoAR(emp.contactoTelefono)}
              </BotonAdmin>
            )}
            {emp.contactoEmail && (
              <BotonAdmin render={<a href={`mailto:${emp.contactoEmail}`} />}>
                Email
              </BotonAdmin>
            )}
          </div>
        );
      },
    },
    {
      id: "fecha",
      cabecera: "Fecha",
      alinear: "derecha",
      celda: (p) => fechaCorta(p.postuladoEl),
    },
    {
      id: "acciones",
      cabecera: "",
      alinear: "derecha",
      celda: (p) => (
        <div className="flex items-center justify-end gap-2">
          <BotonDerivar id={p.id} />
          <EnlaceAccion href={`/admin/postulaciones/${p.id}`}>Ver</EnlaceAccion>
        </div>
      ),
    },
  ];

  return (
    <div className="overflow-hidden rounded-[10px] border border-border">
      <AdminTable
        columnas={columnas}
        filas={postulaciones}
        idDe={(p) => p.id}
        conPanel={false}
        pager={pager}
        etiquetaFila={(p) =>
          `${nombreCompleto(p.postulante) ?? "Postulante"} para ${p.oferta.titulo}`
        }
        vacio={
          hayFiltros
            ? {
                titulo: "No hay derivaciones pendientes con esos filtros",
                descripcion: "Probá con otra búsqueda o usá “Limpiar”.",
              }
            : {
                titulo: "No hay personas para derivar",
                descripcion: "Todas las postulaciones preseleccionadas fueron derivadas a las empresas.",
              }
        }
      />
    </div>
  );
}
