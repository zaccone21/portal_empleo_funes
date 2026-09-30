import { z } from "zod";

/** Dates come as Postgres writes them (microseconds, +00:00); they leave the DAL as standard ISO 8601. */
export const fechaSchema = z.string().transform((valor) => new Date(valor).toISOString());
