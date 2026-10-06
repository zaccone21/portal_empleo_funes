import { FileCheckIcon, FileXIcon, MailIcon, PhoneIcon } from "lucide-react";

import { ICONO_RUBRO } from "@/components/ofertas/IconoRubro";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { PostulanteEnBusqueda } from "@/hooks/useBusquedaPostulantes";
import { formatearDia } from "@/lib/fechas";
import { NOMBRE_RUBRO, esRubro } from "@/lib/validation/rubros";
import { cn } from "@/lib/utils";

type Props = {
  postulantes: PostulanteEnBusqueda[];
  /** Sentence that says what the list shows; it also names the list for screen readers. */
  descripcion: string;
};

const HOJA = "rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md bg-card ring-1 ring-foreground/5";

/**
 * The applicants found by the Office's search (P16, RF1.5.7). One list, two
 * layouts, so nothing ever scrolls sideways:
 * - from `lg`, a table: person, contact, trades and CV, one row per person,
 *   dense like an admin screen (docs/DESIGN.md §3);
 * - below, one "leaf" card per person with 44 px contact links, because on a
 *   phone the table would not fit.
 * Email and phone are links (mailto:, tel:) so the Office writes or calls with
 * one tap. The CV is only shown as loaded or not: opening it goes through an
 * application, where the Office already has the link (RF1.5.5).
 */
export function ListaPostulantes({ postulantes, descripcion }: Props) {
  return (
    <>
      <div className={cn(HOJA, "hidden overflow-hidden lg:block")}>
        <Table aria-label={descripcion}>
          <TableHeader>
            <TableRow className="bg-muted/60 hover:bg-muted/60">
              <TableHead scope="col" className="h-12 px-5 text-sm text-muted-foreground">
                Postulante
              </TableHead>
              <TableHead scope="col" className="h-12 px-3 text-sm text-muted-foreground">
                Contacto
              </TableHead>
              <TableHead scope="col" className="h-12 px-3 text-sm text-muted-foreground">
                Rubros
              </TableHead>
              <TableHead scope="col" className="h-12 px-5 text-sm text-muted-foreground">
                CV
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {postulantes.map((postulante) => (
              <TableRow key={postulante.id}>
                <TableCell className="px-5 py-4 align-top whitespace-normal">
                  <Nombre postulante={postulante} />
                </TableCell>
                <TableCell className="px-3 py-4 align-top whitespace-normal">
                  <Contacto postulante={postulante} />
                </TableCell>
                <TableCell className="px-3 py-4 align-top whitespace-normal">
                  <Rubros rubros={postulante.rubros} />
                </TableCell>
                <TableCell className="px-5 py-4 align-top whitespace-normal">
                  <EstadoCv cvSubidoEl={postulante.cvSubidoEl} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ul aria-label={descripcion} className="flex flex-col gap-3 lg:hidden">
        {postulantes.map((postulante) => (
          <li key={postulante.id} className={cn(HOJA, "flex flex-col gap-3 p-4")}>
            <div className="flex items-start justify-between gap-3">
              <Nombre postulante={postulante} titulo />
              <EstadoCv cvSubidoEl={postulante.cvSubidoEl} soloInsignia />
            </div>
            <Contacto postulante={postulante} tactil />
            <Rubros rubros={postulante.rubros} />
          </li>
        ))}
      </ul>
    </>
  );
}

/** Name and DNI. A person who registered but did not fill the profile yet has neither (P03). */
function Nombre({ postulante, titulo = false }: { postulante: PostulanteEnBusqueda; titulo?: boolean }) {
  const nombre = [postulante.nombre, postulante.apellido].filter(Boolean).join(" ");
  const Etiqueta = titulo ? "h2" : "p";

  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <Etiqueta
        className={cn(
          "text-base font-semibold",
          titulo && "font-heading text-lg leading-snug",
          !nombre && "font-normal text-muted-foreground",
        )}
      >
        {nombre || "Todavía no cargó su nombre"}
      </Etiqueta>
      {postulante.dni && <p className="text-sm text-muted-foreground tabular-nums">DNI {postulante.dni}</p>}
    </div>
  );
}

/** Email and phone as links. On phones they are 44 px targets; in the table they are as tall as a line. */
function Contacto({ postulante, tactil = false }: { postulante: PostulanteEnBusqueda; tactil?: boolean }) {
  const { email, telefono } = postulante;
  const enlace = cn(
    "flex items-center gap-2 text-base break-all underline-offset-4 hover:underline [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-primary",
    tactil && "min-h-11",
  );

  if (!email && !telefono) {
    return <p className="text-sm text-muted-foreground">Sin datos de contacto</p>;
  }

  return (
    <div className={cn("flex flex-col", !tactil && "gap-1.5")}>
      {email && (
        <a href={`mailto:${email}`} className={enlace}>
          <MailIcon aria-hidden="true" />
          {email}
        </a>
      )}
      {telefono && (
        <a href={`tel:${telefono.replace(/[^\d+]/g, "")}`} className={enlace}>
          <PhoneIcon aria-hidden="true" />
          {telefono}
        </a>
      )}
    </div>
  );
}

/** The trades the person chose, each with its icon and its name (never the icon alone). */
function Rubros({ rubros }: { rubros: string[] }) {
  if (rubros.length === 0) {
    return <p className="text-sm text-muted-foreground">Todavía no eligió rubros</p>;
  }

  return (
    <ul aria-label="Rubros elegidos" className="flex flex-wrap gap-1.5">
      {rubros.map((rubro) => {
        const Icono = esRubro(rubro) ? ICONO_RUBRO[rubro] : null;
        return (
          <li key={rubro}>
            <Badge variant="outline" className="h-7 gap-1.5 px-2.5 text-sm">
              {Icono && <Icono data-icon="inline-start" aria-hidden="true" />}
              {esRubro(rubro) ? NOMBRE_RUBRO[rubro] : rubro}
            </Badge>
          </li>
        );
      })}
    </ul>
  );
}

/** Whether the person has a CV, with the day it was uploaded. Word and icon, never color alone. */
function EstadoCv({ cvSubidoEl, soloInsignia = false }: { cvSubidoEl: string | null; soloInsignia?: boolean }) {
  if (!cvSubidoEl) {
    return (
      <Badge variant="outline" className="h-7 gap-1.5 border-dashed px-2.5 text-sm text-muted-foreground">
        <FileXIcon data-icon="inline-start" aria-hidden="true" />
        Sin CV
      </Badge>
    );
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <Badge variant="secondary" className="h-7 gap-1.5 px-2.5 text-sm">
        <FileCheckIcon data-icon="inline-start" aria-hidden="true" />
        CV cargado
      </Badge>
      {!soloInsignia && <p className="text-sm text-muted-foreground">Subido el {formatearDia(cvSubidoEl)}</p>}
    </div>
  );
}
