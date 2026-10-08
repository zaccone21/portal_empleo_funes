import { cn } from "@/lib/utils";
import type { Rubro } from "@/lib/validation/rubros";
import { IconoRubro } from "@/components/ofertas/IconoRubro";

type Props = {
  rubro?: Rubro | string;
  className?: string;
  size?: "sm" | "md" | "lg";
};

/**
 * Tile cuadrado redondeado con el ícono del rubro.
 * Sigue la identidad visual del portal público (tonos menta/mostaza/verde profundo).
 */
export function RubroTile({ rubro, className, size = "md" }: Props) {
  // Para los colores, podemos alternar según el rubro o usar un color fijo de marca.
  // La instrucción pide: "cuadrado redondeado de 28 px con el ícono, en tonos verde/mostaza/menta como en el hero".
  // Podemos mapear algunos rubros a menta, otros a verde, otros a mostaza para que quede colorido pero sobrio.
  
  const sizeClasses = {
    sm: "size-6 rounded",
    md: "size-8 rounded-md", // 32px para mejor toque, o podemos hacer 28px si es estricto (size-7)
    lg: "size-12 rounded-xl",
  };

  const getTheme = (r?: Rubro | string) => {
    if (!r) return "bg-muted text-muted-foreground";
    
    // Asignar colores fijos por rubro para que sea consistente
    switch (r) {
      case "construccion":
      case "transporte":
      case "industria":
        return "bg-brand-deep text-brand-mint/90";
      case "jardineria":
      case "cuidados":
      case "otros":
        return "bg-brand-mint text-primary";
      case "gastronomia":
      case "comercio":
        return "bg-brand-sun text-brand-deep";
      case "limpieza":
      case "administracion":
      case "tecnologia":
        return "bg-primary text-brand-mint/90";
      default:
        return "bg-primary text-brand-mint/90";
    }
  };

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center",
        sizeClasses[size],
        getTheme(rubro),
        className
      )}
    >
      {rubro ? (
        <IconoRubro rubro={rubro as Rubro} className="size-1/2 stroke-[1.5]" />
      ) : (
        <span className="size-1/2 bg-muted-foreground/30 rounded-full" />
      )}
    </div>
  );
}
