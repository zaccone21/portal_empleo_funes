import type { CvPropio } from "@/lib/validation/cv";
import type { PostulacionPropia } from "@/lib/validation/postulaciones";

/*
 * TEMPORARY (DT-003): in-memory state of the simulated API while `npm run dev`
 * runs. It plays a single applicant who is always logged in. Restarting the
 * server empties it.
 *
 * It lives on globalThis because Next bundles each Route Handler on its own:
 * a plain module variable would give /api/cv and /api/postulaciones separate
 * copies, and applying would never see the uploaded CV.
 */
type AlmacenSimulado = {
  cv: CvPropio | null;
  postulaciones: PostulacionPropia[];
};

const global = globalThis as typeof globalThis & { __almacenSimulado?: AlmacenSimulado };

export const almacen: AlmacenSimulado = (global.__almacenSimulado ??= {
  cv: null,
  postulaciones: [],
});
