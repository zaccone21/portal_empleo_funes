import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/dal/auth";
import { verOferta } from "@/lib/use-cases/oficina";
import { OfertaDetalleWrapper } from "@/features/ofertas/ui/OfertaDetalleWrapper";

export const metadata: Metadata = { title: "Detalle de oferta" };

type Params = {
  params: Promise<{ id: string }>;
};

export default async function AdminOfertaDetallePage(props: Params) {
  const params = await props.params;
  const usuario = await getCurrentUser();
  if (!usuario) return null; // El layout ya redirige

  const resultado = await verOferta(usuario, params.id);
  if (!resultado.ok) return notFound();

  return <OfertaDetalleWrapper oferta={resultado.datos} />;
}
