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
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Ofertas Pendientes */}
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle className="text-xl">Ofertas pendientes</CardTitle>
          <CardDescription>Para revisar y publicar</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col gap-4">
          {resumen.ofertasPendientes.length === 0 ? (
            <p className="text-muted-foreground text-sm flex-1">No hay ofertas pendientes.</p>
          ) : (
            <div className="flex flex-col gap-3 flex-1">
              {resumen.ofertasPendientes.map((oferta) => (
                <div key={oferta.id} className="flex flex-col border-b pb-3 last:border-0 last:pb-0">
                  <span className="font-medium text-sm">{oferta.titulo}</span>
                  <span className="text-sm text-muted-foreground">{oferta.empresa}</span>
                  {oferta.creadaEl && (
                    <span className="text-xs text-muted-foreground mt-1">
                      {format(new Date(oferta.creadaEl), "d 'de' MMM, HH:mm", { locale: es })}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
          <Button variant="outline" className="w-full mt-4 justify-between" nativeButton={false} render={<Link href="/admin/ofertas?estado=pendiente" />}>
            Ver todas <ArrowRightIcon className="size-4 opacity-50" />
          </Button>
        </CardContent>
      </Card>

      {/* Pedidos de Cierre */}
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle className="text-xl">Pedidos de cierre</CardTitle>
          <CardDescription>Empresas solicitando cerrar vacantes</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col gap-4">
          {resumen.pedidosDeCierre.length === 0 ? (
            <p className="text-muted-foreground text-sm flex-1">No hay pedidos de cierre.</p>
          ) : (
            <div className="flex flex-col gap-3 flex-1">
              {resumen.pedidosDeCierre.map((oferta) => (
                <div key={oferta.id} className="flex flex-col border-b pb-3 last:border-0 last:pb-0">
                  <span className="font-medium text-sm">{oferta.titulo}</span>
                  <span className="text-sm text-muted-foreground">{oferta.empresa}</span>
                  {oferta.creadaEl && (
                    <span className="text-xs text-muted-foreground mt-1">
                      Publicada el {format(new Date(oferta.creadaEl), "d 'de' MMM", { locale: es })}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
          <Button variant="outline" className="w-full mt-4 justify-between" nativeButton={false} render={<Link href="/admin/ofertas?estado=publicada" />}>
            Ver publicadas <ArrowRightIcon className="size-4 opacity-50" />
          </Button>
        </CardContent>
      </Card>

      {/* Últimas Postulaciones */}
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle className="text-xl">Últimas postulaciones</CardTitle>
          <CardDescription>Actividad reciente</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col gap-4">
          {resumen.ultimasPostulaciones.length === 0 ? (
            <p className="text-muted-foreground text-sm flex-1">No hay postulaciones recientes.</p>
          ) : (
            <div className="flex flex-col gap-3 flex-1">
              {resumen.ultimasPostulaciones.map((postulacion) => (
                <div key={postulacion.id} className="flex flex-col border-b pb-3 last:border-0 last:pb-0">
                  <span className="font-medium text-sm">{postulacion.postulanteNombre}</span>
                  <span className="text-sm text-muted-foreground">se postuló a {postulacion.ofertaTitulo}</span>
                  {postulacion.creadaEl && (
                    <span className="text-xs text-muted-foreground mt-1">
                      {format(new Date(postulacion.creadaEl), "d 'de' MMM, HH:mm", { locale: es })}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
          <Button variant="outline" className="w-full mt-4 justify-between" nativeButton={false} render={<Link href="/admin/postulantes" />}>
            Buscar postulantes <ArrowRightIcon className="size-4 opacity-50" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}


