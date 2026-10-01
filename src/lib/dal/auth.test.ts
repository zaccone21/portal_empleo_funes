import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("react", () => ({ cache: <T>(fn: T) => fn }));

const { createClient } = vi.hoisted(() => ({ createClient: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createClient }));

import { getCurrentUser } from "@/lib/dal/auth";

function mockSupabase({
  sub,
  perfil,
  error = null,
}: {
  sub?: string;
  perfil: { rol: string; email?: string } | null;
  error?: { message: string } | null;
}) {
  const maybeSingle = vi.fn().mockResolvedValue({ data: perfil, error });
  const eq = vi.fn().mockReturnValue({ maybeSingle });
  const select = vi.fn().mockReturnValue({ eq });
  const from = vi.fn().mockReturnValue({ select });

  createClient.mockResolvedValue({
    auth: {
      getClaims: vi
        .fn()
        .mockResolvedValue({ data: sub ? { claims: { sub } } : null }),
    },
    from,
  });

  return { from, select, eq };
}

describe("getCurrentUser", () => {
  beforeEach(() => {
    createClient.mockReset();
  });

  it("returns null when there is no session", async () => {
    const { from } = mockSupabase({ perfil: null });

    await expect(getCurrentUser()).resolves.toBeNull();
    expect(from).not.toHaveBeenCalled();
  });

  it("returns the id, role and email of the signed-in user, read from perfiles", async () => {
    const { from, select, eq } = mockSupabase({
      sub: "user-1",
      perfil: { rol: "empresa", email: "empresa@ejemplo.com" },
    });

    await expect(getCurrentUser()).resolves.toEqual({
      id: "user-1",
      rol: "empresa",
      email: "empresa@ejemplo.com",
    });
    expect(from).toHaveBeenCalledWith("perfiles");
    expect(select).toHaveBeenCalledWith("rol, email");
    expect(eq).toHaveBeenCalledWith("id", "user-1");
  });

  it("returns null when the user has no profile", async () => {
    mockSupabase({ sub: "user-1", perfil: null });

    await expect(getCurrentUser()).resolves.toBeNull();
  });

  it("throws when the profile query fails", async () => {
    mockSupabase({ sub: "user-1", perfil: null, error: { message: "boom" } });

    await expect(getCurrentUser()).rejects.toThrow("Could not load");
  });

  it("throws when the stored role is not a known role", async () => {
    mockSupabase({ sub: "user-1", perfil: { rol: "superuser", email: "x@ejemplo.com" } });

    await expect(getCurrentUser()).rejects.toThrow();
  });
});
