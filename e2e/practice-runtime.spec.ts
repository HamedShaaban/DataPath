import { test, expect } from "@playwright/test";
import { newState } from "../shared/learning";

for (const kind of ["SQL", "Python"] as const) {
  test(`${kind} engine failure preserves answer and does not grade an attempt`, async ({ page, context }) => {
    const state = newState(); state.onboarded = true; state.profile.sector = "banking";
    await page.addInitScript(state => localStorage.setItem("datapath.guest.v1", JSON.stringify(state)), state);
    const blocked = kind === "SQL" ? "**/sql-runtime/**" : "**/python-worker.js";
    await context.route(blocked, route => route.abort());
    await page.goto("/");
    await page.getByRole("button", { name: "Practice lab", exact: true }).click();
    await page.getByRole("button", { name: "I’m ready to explore independent exercises" }).click();
    const picker = page.getByRole("button", { name: /Find your next challenge/ });
    if ((await picker.getAttribute("aria-expanded")) === "false") await picker.click();
    await page.getByRole("button", { name: kind === "SQL" ? /SQL workbench/ : /Summarise completed work in Python/ }).click();
    const editor = page.getByRole("textbox", { name: kind === "SQL" ? "SQL query editor" : "Python code: define solve(rows)" });
    const answer = kind === "SQL" ? "SELECT transaction_id, amount FROM transactions WHERE status = 'completed' AND amount >= 500 ORDER BY amount DESC" : "def solve(rows):\n    return sum(r['value'] for r in rows if r['status'] == 'completed' and r['value'] is not None)";
    await editor.fill(answer);
    const run = page.getByRole("button", { name: kind === "SQL" ? "Run query" : "Check my work", exact: true });
    await run.click();
    await expect(page.getByText("Practice engine unavailable", { exact: true })).toBeVisible();
    await expect(editor).toHaveValue(answer);
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("datapath.guest.v1")!));
    expect(saved.labAttempts).toHaveLength(0);
    expect(saved.practiceAttempts).toHaveLength(0);
    await page.screenshot({ path: `output/student-review/${kind.toLowerCase()}-unavailable-fixed.png` });
    await context.unroute(blocked);
    await run.click();
    await expect(page.getByText(kind === "SQL" ? "Query passed" : "Passed", { exact: true })).toBeVisible({ timeout: 60000 });
  });
}
