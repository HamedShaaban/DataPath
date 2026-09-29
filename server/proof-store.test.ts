import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { readFile } from "node:fs/promises";
import { users } from "../drizzle/schema";

vi.mock("./db", () => ({ getDb: vi.fn() }));
import { getDb } from "./db";
import { enableProofPage, disableProofPage, getPublicProof, saveVerifiedCredential, setCredentialVisibility, getProofSettings } from "./proof-store";
const pg = new PGlite();
const db = drizzle(pg);

beforeAll(async () => {
  const journal = JSON.parse(await readFile("drizzle/postgres/meta/_journal.json", "utf8"));
  for (const entry of journal.entries)
    await pg.exec(await readFile(`drizzle/postgres/${entry.tag}.sql`, "utf8"));
  vi.mocked(getDb).mockResolvedValue(db as any);
  await db.insert(users).values([{ id: 501, openId: "proof-test-one", name: "One" }, { id: 502, openId: "proof-test-two", name: "Two" }]);
});
afterAll(() => pg.close());

describe("proof storage on disposable PostgreSQL engine", () => {
  it("starts private, exposes only visible credentials, and disables immediately", async () => {
    const credential = await saveVerifiedCredential(501, "skill_cert", "sql", { passed: true, targetLevel: 1 });
    expect(await getPublicProof("learner-one")).toBeNull();
    await enableProofPage(501, "learner-one");
    expect((await getPublicProof("learner-one"))?.credentials[0].title).toBe("SQL · Beginner");
    await expect(setCredentialVisibility(502, credential.id, false)).rejects.toMatchObject({ code: "NOT_FOUND" });
    expect((await getPublicProof("learner-one"))?.credentials).toHaveLength(1);
    await setCredentialVisibility(501, credential.id, false);
    expect((await getPublicProof("learner-one"))?.credentials).toHaveLength(0);
    await saveVerifiedCredential(501, "skill_cert", "sql", { passed: true, targetLevel: 2 });
    expect((await getPublicProof("learner-one"))?.credentials).toHaveLength(0);
    expect((await getProofSettings(501)).credentials).toHaveLength(1);
    await disableProofPage(501);
    expect(await getPublicProof("learner-one")).toBeNull();
  });
  it("does not let a second account claim an existing handle", async () => {
    await expect(enableProofPage(502, "learner-one")).rejects.toMatchObject({ code: "CONFLICT" });
  });
});
