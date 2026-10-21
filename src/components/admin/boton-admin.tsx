import { isValidElement, type ComponentProps } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Variante = "primario" | "secundario" | "destructivo";

// Each variant sets its own hover text color: the outline base of Button turns
// the text to `foreground` on hover, which left dark text on the green button.
const CLASES: Record<Variante, string> = {
  primario:
    "border-primary bg-primary text-primary-foreground shadow-none hover:bg-primary/90 hover:text-primary-foreground",
  secundario:
    "border-input bg-background text-foreground shadow-none hover:border-primary/40 hover:bg-accent hover:text-accent-foreground",
  destructivo:
    "border-danger-soft-border bg-background text-danger-soft-foreground shadow-none hover:bg-danger-soft hover:text-danger-soft-foreground",
};

type Props = Omit<ComponentProps<typeof Button>, "variant" | "size"> & { variante?: Variante };

/**
 * Button of the Office screens (D-042): radius 8, 12.5 px / 600, padding 7×13.
 * Primary is solid green; the destructive one is an outline with a red text.
 * Compose it with the `render` prop to make a link (Base UI, no asChild).
 */
export function BotonAdmin({
  variante = "secundario",
  className,
  nativeButton,
  render,
  ...props
}: Props) {
  const isNative =
    nativeButton ??
    (render
      ? isValidElement(render)
        ? render.type === "button"
        : false
      : undefined);

  return (
    <Button
      variant="outline"
      size="sm"
      nativeButton={isNative}
      render={render}
      className={cn("h-auto rounded-lg px-[13px] py-[7px] text-[12.5px] font-semibold", CLASES[variante], className)}
      {...props}
    />
  );
}
