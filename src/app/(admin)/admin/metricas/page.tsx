import type { Metadata } from "next";

import { PanelMetricas } from "@/components/admin/panel-metricas";
import { datosMetricas } from "@/lib/admin/datos";

export const metadata: Metadata = {
  title: "Métricas y Reportes",
};

/**
 * Office Metrics & Reports page (`/admin/metricas`).
 * Displays interactive KPIs, daily/category/funnel charts, raw data matrices,
 * global period filtering (Day, Week, Month, Custom range, All-time), and PDF export.
 */
export default async function AdminMetricasPage() {
  const datos = await datosMetricas();

  return <PanelMetricas datos={datos} />;
}
