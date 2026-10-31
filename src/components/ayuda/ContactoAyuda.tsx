import { CONTACTO_AYUDA } from "./contenido";

/**
 * Last block of the help screen (P20): when the guides are not enough, the
 * Office helps in person. Plain text, without a phone or address that the
 * portal does not have confirmed.
 */
export function ContactoAyuda() {
  const { titulo, texto, icono: Icono } = CONTACTO_AYUDA;
  return (
    <aside className="flex items-start gap-4 rounded-tl-2xl rounded-tr-md rounded-br-2xl rounded-bl-md bg-secondary p-5">
      <span
        aria-hidden="true"
        className="flex size-12 shrink-0 items-center justify-center rounded-tl-xl rounded-tr-sm rounded-br-xl rounded-bl-sm bg-card text-primary"
      >
        <Icono className="size-6" />
      </span>
      <div className="flex flex-col gap-1">
        <h2 className="font-heading text-lg font-semibold text-secondary-foreground">{titulo}</h2>
        <p className="max-w-prose text-base text-foreground">{texto}</p>
      </div>
    </aside>
  );
}
