import { z } from "zod";

export const roleSchema = z.enum(["applicant", "company", "admin"]);

export type Role = z.infer<typeof roleSchema>;
