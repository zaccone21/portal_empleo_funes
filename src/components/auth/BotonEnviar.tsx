import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

type Props = {
  loading: boolean;
  texto: string;
  /** Label while the request runs, for example "Ingresando…". */
  textoCargando: string;
};

/**
 * Primary button of the access forms: full width and 48px tall (size "lg").
 * While the request runs it is disabled, so a second tap on a slow connection
 * does not send the form twice, and its label says what is happening. The
 * spinner is decorative (aria-hidden); the label is what screen readers read.
 */
export function BotonEnviar({ loading, texto, textoCargando }: Props) {
  return (
    <Button type="submit" size="lg" className="w-full" disabled={loading}>
      {loading && <Spinner data-icon="inline-start" aria-hidden="true" />}
      {loading ? textoCargando : texto}
    </Button>
  );
}
