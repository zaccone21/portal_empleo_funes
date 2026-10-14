"use client";

import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ArrowRightIcon } from "lucide-react";

import { ErrorAlCargar } from "@/components/estados/ErrorAlCargar";
import { PedirIngreso } from "@/components/estados/PedirIngreso";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useResumenOficina } from "@/hooks/useOficina";
import { MENSAJE_ERROR_GENERICO } from "@/lib/http";

/**
 * The Office's panel (P14, RF1.5.1). Shows lists of items that need the
 * Office's attention: pending offers, close requests, and recent applications.
 */
export function ResumenOficina() {
  const { resumen, loading, error, sinAcceso, recargar } = useResumenOficina();

  if (loading) {
    return (
      <div aria-busy="true" className="grid gap-6 lg:grid-cols-3">
        <span className="sr-only" role="status">Cargando el panel...</span>
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} className="h-80 rounded-xl bg-card" />
        ))}
      </div>
    );
  }

  if (sinAcceso) {
    return <PedirIngreso rol="admin" titulo="Ingresá a tu cuenta" descripcion="Necesitás ingresar para ver el panel." />;
  }

  if (error || !resumen) {
    return <ErrorAlCargar que="el resumen" mensaje={error || MENSAJE_ERROR_GENERICO} onReintentar={recargar} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Tarjeta 1: Ofertas Pendientes */}
        <Link href="/admin/ofertas?estado=pendiente" className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl group">
          <Card className="flex flex-col h-full hover:shadow-md transition-all border-l-4 border-l-warning bg-warning/5 hover:bg-warning/10">
            <CardHeader className="pb-2">
              <CardDescription className="font-semibold text-warning uppercase tracking-wider text-xs">Ofertas por revisar</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold tracking-tighter text-warning group-hover:scale-105 transition-transform origin-left">
                {resumen.conteos.ofertasPendientes}
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Tarjeta 2: Cierres solicitados */}
        <Link href="/admin/ofertas?estado=publicada" className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl group">
          <Card className="flex flex-col h-full hover:shadow-md transition-all border-l-4 border-l-destructive bg-destructive/5 hover:bg-destructive/10">
            <CardHeader className="pb-2">
              <CardDescription className="font-semibold text-destructive uppercase tracking-wider text-xs">Cierres solicitados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold tracking-tighter text-destructive group-hover:scale-105 transition-transform origin-left">
                {resumen.conteos.cierresSolicitados}
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Tarjeta 3: Postulaciones nuevas */}
        <Link href="/admin/ofertas?vista=nuevas" className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl group">
          <Card className="flex flex-col h-full hover:shadow-md transition-all border-l-4 border-l-primary bg-primary/5 hover:bg-primary/10">
            <CardHeader className="pb-2">
              <CardDescription className="font-semibold text-primary uppercase tracking-wider text-xs">Postulaciones nuevas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold tracking-tighter text-primary group-hover:scale-105 transition-transform origin-left">
                {resumen.conteos.postulacionesNuevas}
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Tarjeta 4: Por derivar */}
        <Link href="/admin/ofertas?vista=por-comunicar" className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl group">
          <Card className="flex flex-col h-full hover:shadow-md transition-all border-l-4 border-l-brand-sun bg-brand-sun/10 hover:bg-brand-sun/20">
            <CardHeader className="pb-2">
              <CardDescription className="font-semibold text-brand-deep uppercase tracking-wider text-xs">Por derivar</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold tracking-tighter text-brand-deep group-hover:scale-105 transition-transform origin-left">
                {resumen.conteos.porDerivar}
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Últimas Postulaciones */}
      <Card className="flex flex-col w-full">
        <CardHeader>
          <CardTitle className="text-xl">Últimas postulaciones</CardTitle>
          <CardDescription>Actividad reciente</CardDescription>
        </CardHeader>
        <CardContent>
          {resumen.ultimasPostulaciones.length === 0 ? (
            <p className="text-muted-foreground text-sm">No hay postulaciones recientes.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {resumen.ultimasPostulaciones.map((postulacion) => (
                <div key={postulacion.id} className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">{postulacion.postulanteNombre}</span>
                    <span className="text-sm text-muted-foreground">se postuló a {postulacion.ofertaTitulo}</span>
                  </div>
                  {postulacion.creadaEl && (
                    <span className="text-xs text-muted-foreground mt-1 sm:mt-0 whitespace-nowrap">
                      {format(new Date(postulacion.creadaEl), "d 'de' MMM, HH:mm", { locale: es })}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
          <div className="mt-6 flex justify-end">
            <Button variant="outline" className="w-full sm:w-auto justify-between" nativeButton={false} render={<Link href="/admin/postulantes" />}>
              Ver registro completo <ArrowRightIcon className="ml-2 size-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


