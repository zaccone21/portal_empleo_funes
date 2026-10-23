import { z } from "zod";

import { emailSchema } from "./auth";

/*
 * The Office team (P21, D-058): the Office accounts and the form to create a
 * new one. An operator can create accounts but never delete them.
 */

/** What the creation form sends: only the email; the server makes the temporary password. */
export const nuevaCuentaOficinaSchema = z.object({ email: emailSchema });

export type DatosNuevaCuentaOficina = z.infer<typeof nuevaCuentaOficinaSchema>;

/** One Office account, as the team list shows it. */
export type CuentaOficina = {
  id: string;
  email: string;
  creadaEl: string;
};

/** What the creation answers: the new account and the temporary password, shown only once. */
export type CuentaOficinaCreada = {
  email: string;
  contrasenaTemporal: string;
};
