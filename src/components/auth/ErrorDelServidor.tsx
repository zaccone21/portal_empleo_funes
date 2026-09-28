import { CircleAlertIcon } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";

/**
 * Message returned by the server (wrong credentials, expired link, no
 * connection), shown above the submit button. Field errors do not come here:
 * they are shown under each field. Alert has role="alert", so the message is
 * announced as soon as it appears. Renders nothing when there is no error.
 */
export function ErrorDelServidor({ error }: { error: string | null }) {
  if (!error) {
    return null;
  }

  return (
    <Alert variant="destructive">
      <CircleAlertIcon aria-hidden="true" />
      <AlertDescription className="text-base">{error}</AlertDescription>
    </Alert>
  );
}
