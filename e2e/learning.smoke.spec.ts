import { test, expect } from "@playwright/test";

test("signup → SQL exercise → Python exercise → saved progress", async ({
  page,
  context,
}) => {
  const email = `smoke-${Date.now()}@example.test`;
  const runtimeRequests: string[] = [];
  context.on("request", request => {
    if (request.url().includes("python-runtime"))
      runtimeRequests.push(request.url());
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await dialog
    .getByRole("button", { name: "New here? Create an account" })
    .click();
  await dialog.getByLabel("Name", { exact: true }).fill("Smoke Learner");
  await dialog.getByLabel("Email", { exact: true }).fill(email);
  await dialog
    .getByLabel(/^Password/)
    .fill("Disposable-smoke-password-123");
  await dialog
    .getByRole("button", { name: "Create account", exact: true })
    .click();
  await expect(dialog).toBeHidden();
  expect((await context.cookies()).some(cookie => cookie.httpOnly)).toBe(true);
  await page.getByRole("button", { name: "Find my path", exact: true }).click();
  await page.getByRole("button", { name: /^Data Scientist/ }).click();
  await page.getByRole("button", { name: "Use this path", exact: true }).click();
  await page.getByLabel("Target business sector").selectOption("banking");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page
    .getByRole("button", { name: "Build my learning path", exact: true })
    .click();
  await page.getByRole("button", { name: "Practice lab", exact: true }).click();
  const independentPractice = page.getByRole("button", { name: "I’m ready to explore independent exercises" });
  if (await independentPractice.isVisible()) await independentPractice.click();
  const picker = page.getByRole("button", { name: /Find your next challenge/ });
  if ((await picker.getAttribute("aria-expanded")) === "false")
    await picker.click();
  await page.getByRole("button", { name: /SQL workbench/ }).click();
  await page
    .getByLabel("SQL query editor")
    .fill(
      "SELECT transaction_id, amount FROM transactions WHERE status = 'completed' AND amount >= 500 ORDER BY amount DESC"
    );
  await page.getByRole("button", { name: "Run query", exact: true }).click();
  await expect(page.getByText("Query passed", { exact: true })).toBeVisible();
  await expect(page.getByText("Server verification passed.", { exact: true })).toBeVisible();
  expect(runtimeRequests).toEqual([]); // Python assets must remain lazy until used.
  if ((await picker.getAttribute("aria-expanded")) === "false")
    await picker.click();
  await page
    .getByRole("button", { name: /Summarise completed work in Python/ })
    .click();
  await page
    .getByLabel("Python code: define solve(rows)")
    .fill(
      "def solve(rows):\n    return sum(r['value'] for r in rows if r['status'] == 'completed' and r['value'] is not None)"
    );
  await page
    .getByRole("button", { name: "Check my work", exact: true })
    .click();
  await expect(
    page
      .getByRole("status")
      .getByRole("heading", { name: "Passed", exact: true })
  ).toBeVisible({ timeout: 60000 });
  expect(runtimeRequests.length).toBeGreaterThan(0);
  // All Python runtime downloads must stay on this app origin.
  expect(
    runtimeRequests.every(
      url => new URL(url).origin === "http://127.0.0.1:3111"
    )
  ).toBe(true);
  const save = page.getByRole("button", { name: "Save progress", exact: true });
  if (await save.isVisible()) await save.click();
  await expect(
    page.getByRole("button", { name: "Saved", exact: true })
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Practice lab", exact: true })
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Sign in", exact: true })
  ).toHaveCount(0);

  await page.getByRole("button", { name: "Settings & profile", exact: true }).click();
  const proofSettings = page.locator(".proof-settings-card");
  const handle = `smoke-proof-${Date.now()}`;
  await proofSettings.getByLabel("Public handle", { exact: true }).fill(handle);
  await proofSettings.getByRole("button", { name: "Enable proof page", exact: true }).click();
  await expect(proofSettings.getByRole("link", { name: /View public page/ })).toBeVisible();
  const visitor = await context.browser()!.newContext();
  const publicPage = await visitor.newPage();
  try {
    const response = await publicPage.goto(`http://127.0.0.1:3111/p/${handle}`);
    expect(response?.status()).toBe(200);
    expect(response?.headers()["cache-control"]).toBe("no-store");
    await expect(publicPage.locator(".credential")).toHaveCount(1);
    await expect(publicPage.locator(".credential")).toContainText("Verified SQL lab");
    await expect(publicPage.locator("body")).not.toContainText(email);
    const credential = proofSettings.locator(".checkline").filter({ hasNotText: "Show my target role and industry" }).getByRole("checkbox");
    await expect(credential).toBeChecked();
    await credential.click();
    await expect(credential).not.toBeChecked();
    await publicPage.reload();
    await expect(publicPage.locator(".credential")).toHaveCount(0);
    await credential.click();
    await expect(credential).toBeChecked();
    await publicPage.reload();
    await expect(publicPage.locator(".credential")).toHaveCount(1);
    await proofSettings.getByRole("button", { name: "Disable public page", exact: true }).click();
    await expect(proofSettings.getByRole("button", { name: "Enable proof page", exact: true })).toBeVisible();
    expect((await publicPage.reload())?.status()).toBe(404);
    await expect(publicPage.getByRole("heading", { name: "Proof page not found" })).toBeVisible();
  } finally {
    await visitor.close();
  }
});
