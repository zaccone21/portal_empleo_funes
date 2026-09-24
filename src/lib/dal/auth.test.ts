import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("react", () => ({ cache: <T>(fn: T) => fn }));

const { createClient } = vi.hoisted(() => ({ createClient: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createClient }));

import { getCurrentUser, requireRole } from "@/lib/dal/auth";

function mockSupabase({
  sub,
  profile,
  error = null,
}: {
  sub?: string;
  profile: { role: string } | null;
  error?: { message: string } | null;
}) {
  const maybeSingle = vi.fn().mockResolvedValue({ data: profile, error });
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

  return { from, eq };
}

describe("getCurrentUser", () => {
  beforeEach(() => {
    createClient.mockReset();
  });

  it("returns null when there is no session", async () => {
    const { from } = mockSupabase({ profile: null });

    await expect(getCurrentUser()).resolves.toBeNull();
    expect(from).not.toHaveBeenCalled();
  });

  it("returns the id and role of the signed-in user", async () => {
    const { eq } = mockSupabase({ sub: "user-1", profile: { role: "company" } });

    await expect(getCurrentUser()).resolves.toEqual({
      id: "user-1",
      role: "company",
    });
    expect(eq).toHaveBeenCalledWith("id", "user-1");
  });

  it("returns null when the user has no profile", async () => {
    mockSupabase({ sub: "user-1", profile: null });

    await expect(getCurrentUser()).resolves.toBeNull();
  });

  it("throws when the profile query fails", async () => {
    mockSupabase({ sub: "user-1", profile: null, error: { message: "boom" } });

    await expect(getCurrentUser()).rejects.toThrow("Could not load");
  });

  it("throws when the stored role is not a known role", async () => {
    mockSupabase({ sub: "user-1", profile: { role: "superuser" } });

    await expect(getCurrentUser()).rejects.toThrow();
  });
});

describe("requireRole", () => {
  beforeEach(() => {
    createClient.mockReset();
  });

  it("rejects an unauthenticated caller", async () => {
    mockSupabase({ profile: null });

    await expect(requireRole("admin")).resolves.toEqual({
      ok: false,
      error: "unauthenticated",
    });
  });

  it("rejects a caller whose role is not allowed", async () => {
    mockSupabase({ sub: "user-1", profile: { role: "company" } });

    await expect(requireRole("admin")).resolves.toEqual({
      ok: false,
      error: "forbidden",
    });
  });

  it("accepts a caller whose role is allowed", async () => {
    mockSupabase({ sub: "user-1", profile: { role: "admin" } });

    await expect(requireRole("admin", "company")).resolves.toEqual({
      ok: true,
      user: { id: "user-1", role: "admin" },
    });
  });
});
