import { z } from "zod";

export const roleSchema = z.enum(["postulante", "empresa", "admin"]);

export type Role = z.infer<typeof roleSchema>;
