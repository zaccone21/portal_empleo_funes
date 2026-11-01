import { BriefcaseIcon, CheckCircle2Icon, TrendingUpIcon } from "lucide-react";

export function MetricasSeccion() {
  const metricas = [
    {
      titulo: "Efectividad de inserción",
      valor: "68%",
      icono: TrendingUpIcon,
    },
    {
      titulo: "Puestos cubiertos",
      valor: "+450",
      icono: CheckCircle2Icon,
    },
    {
      titulo: "Empresas sumadas",
      valor: "+120",
      icono: BriefcaseIcon,
    },
  ];

  return (
    <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 py-3 px-4 rounded-2xl bg-card/80 border border-border/50 shadow-xs backdrop-blur-xs">
      {metricas.map((item, index) => {
        const Icono = item.icono;
        return (
          <div key={index} className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <Icono className="size-4" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-bold text-foreground">
                {item.valor}
              </span>
              <span className="text-xs text-muted-foreground font-medium">
                {item.titulo}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}