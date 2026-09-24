import "server-only";

import { cache } from "react";

import { createClient } from "@/lib/supabase/server";
import { roleSchema, type Role } from "@/lib/validation/role";

export type CurrentUser = {
  id: string;
  role: Role;
};

export type RoleCheck =
  | { ok: true; user: CurrentUser }
  | { ok: false; error: "unauthenticated" | "forbidden" };

export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const supabase = await createClient();

  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims.sub;
  if (!userId) return null;

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw new Error("Could not load the user profile.");
  if (!profile) return null;

  return { id: userId, role: roleSchema.parse(profile.role) };
});

export async function requireRole(
  ...allowedRoles: Role[]
): Promise<RoleCheck> {
  const user = await getCurrentUser();

  if (!user) return { ok: false, error: "unauthenticated" };
  if (!allowedRoles.includes(user.role)) return { ok: false, error: "forbidden" };

  return { ok: true, user };
}
