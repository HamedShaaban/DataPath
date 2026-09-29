vi.mock("./proof-store", async importOriginal => ({
  ...await importOriginal<typeof import("./proof-store")>(),
  getPublicProof: vi.fn(async () => null),
}));
import { describe, expect, it, vi } from "vitest";
import { renderPublicProofPage } from "./proof-page";

describe("public proof page SSR", () => {
  it("renders metadata, trust copy and only escaped public data", () => {
    const html = renderPublicProofPage(
      {
        displayName: "Mina <script>alert(1)</script>",
        targetRole: "Data analyst",
        industry: "Banking",
        credentials: [
          {
            id: "550e8400-e29b-41d4-a716-446655440000",
            type: "lab_pass",
            refId: "sql-select-filter",
            title: "Filter <payments>",
            verifiedAt: new Date("2026-09-01T00:00:00Z"),
          },
        ],
      },
      "mina-data",
      "https://example.test/p/mina-data"
    );
    expect(html).toContain("Server-verified evidence");
    expect(html).toContain('property="og:title"');
    expect(html).toContain("https://example.test/p/mina-data");
    expect(html).toContain("Mina &lt;script&gt;alert(1)&lt;/script&gt;");
    expect(html).toContain("Filter &lt;payments&gt;");
    expect(html).not.toContain("<script>alert(1)</script>");
  });
});


it("prevents caching both private and public responses", async () => {
  const { registerProofPage } = await import("./proof-page");
  const { getPublicProof } = await import("./proof-store");
  let handler: any;
  registerProofPage({ get: (_path: string, callback: unknown) => { handler = callback; } } as any);
  for (const published of [false, true]) {
    vi.mocked(getPublicProof).mockResolvedValueOnce(published ? { displayName: "Learner", targetRole: null, industry: null, credentials: [] } : null);
    const res = { set: vi.fn().mockReturnThis(), status: vi.fn().mockReturnThis(), type: vi.fn().mockReturnThis(), send: vi.fn().mockReturnThis() };
    const next = vi.fn();
    await handler({ params: { handle: "learner" }, protocol: "https", get: () => "example.test", ip: "192.0.2.4" }, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.set).toHaveBeenCalledWith("Cache-Control", "no-store");
    expect(res.status).toHaveBeenCalledWith(published ? 200 : 404);
  }
});
