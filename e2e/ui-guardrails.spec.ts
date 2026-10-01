import { test, expect } from "@playwright/test";
import { newState } from "../shared/learning";

const destinations = ["Overview", "My roadmap", "Practice lab", "Proof ledger", "Resource library", "Tools setup", "Interview studio", "My projects", "Career toolkit", "AI coach", "Settings & profile"];
for (const theme of ["light", "dark"] as const) {
  for (const width of [390, 1440]) {
    test(`workspace guardrails: ${theme}, ${width}px`, async ({ page }) => {
      const state = newState();
      state.onboarded = true;
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.addInitScript(({ state, theme }) => {
        localStorage.setItem("datapath.guest.v1", JSON.stringify(state));
        localStorage.setItem("datapath.theme", theme);
      }, { state, theme });
      await page.goto("/");
      if (width > 850) await page.getByRole("button", { name: "Explore all", exact: true }).click();
      for (const name of destinations) {
        if (width <= 850 && name !== "Settings & profile") await page.getByRole("button", { name: "Menu", exact: true }).click();
        await page.getByRole("button", { name, exact: true }).press("Enter");
        await expect(page.locator("main h1")).toBeVisible();
        const findings = await page.evaluate(() => {
          const failures: string[] = [];
          if (document.documentElement.scrollWidth > innerWidth + 1) failures.push("page overflow");
          const rgb = (value: string) => (value.match(/[\d.]+/g) || []).slice(0, 3).map(Number);
          const luminance = (v: number[]) => v.reduce((sum, value, i) => {
            const c = value / 255;
            return sum + (c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4) * [.2126, .7152, .0722][i];
          }, 0);
          for (const el of document.querySelectorAll<HTMLElement>("main *")) {
            if (!el.getClientRects().length || el.closest("[hidden], :disabled, [aria-disabled=true]")) continue;
            const css = getComputedStyle(el);
            if (css.backgroundImage.includes("gradient(")) failures.push(`gradient: ${el.className}`);
            if (![...el.childNodes].some(n => n.nodeType === Node.TEXT_NODE && n.textContent?.trim())) continue;
            const size = parseFloat(css.fontSize);
            if (size === 0) continue; // Hidden mobile button text has an accessible name.
            if (size < 12) failures.push(`small text: ${el.textContent?.slice(0, 40)}`);
            let parent: HTMLElement | null = el;
            while (parent && !getComputedStyle(parent).backgroundColor.startsWith("rgb(")) parent = parent.parentElement;
            const bg = parent ? rgb(getComputedStyle(parent).backgroundColor) : [255,255,255];
            const foreground = luminance(rgb(css.color)), background = luminance(bg);
            const contrast = (Math.max(foreground, background) + .05) / (Math.min(foreground, background) + .05);
            const large = size >= 24 || (size >= 18.66 && parseFloat(css.fontWeight) >= 700);
            if (contrast < (large ? 3 : 4.5)) failures.push(`contrast ${contrast.toFixed(2)}: ${el.textContent?.slice(0, 40)}`);
          }
          return failures;
        });
        expect(findings, name).toEqual([]);
        if (theme === "dark" && ["Overview", "My roadmap", "Practice lab"].includes(name)) {
          await page.screenshot({ path: `output/ui-guardrails/dark-${name.toLowerCase().replaceAll(" ", "-")}-${width}.png` });
        }
      }
      // A keyboard user must see which control will respond to Enter.
      const themeButton = page.getByRole("button", { name: `Enable ${theme === "light" ? "dark" : "light"} mode`, exact: true });
      await themeButton.focus();
      const focus = await themeButton.evaluate(el => ({ style: getComputedStyle(el).outlineStyle, width: getComputedStyle(el).outlineWidth }));
      expect(focus.style).not.toBe("none");
      expect(parseFloat(focus.width)).toBeGreaterThan(0);
    });
  }
}

test("mobile menu preserves screen space and keyboard focus", async ({ page }) => {
  const state = newState();
  state.onboarded = true;
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(state => {
    localStorage.setItem("datapath.guest.v1", JSON.stringify(state));
    localStorage.setItem("datapath.theme", "light");
  }, state);
  await page.goto("/");
  const menu = page.getByRole("button", { name: "Menu", exact: true });
  const navigation = page.getByRole("navigation", { name: "Main navigation" });
  await expect(menu).toHaveAttribute("aria-expanded", "false");
  await expect(navigation).toBeHidden();
  expect(await page.locator(".sidebar").evaluate(el => el.getBoundingClientRect().height)).toBeLessThanOrEqual(72);
  await menu.press("Enter");
  await expect(navigation).toBeVisible();
  await expect(menu).toHaveAttribute("aria-expanded", "true");
  await navigation.getByRole("button", { name: "AI coach", exact: true }).focus();
  await page.keyboard.press("Escape");
  await expect(menu).toBeFocused();
  await expect(navigation).toBeHidden();
  await menu.press("Tab");
  await expect(page.getByRole("button", { name: "Enable dark mode", exact: true })).toBeFocused();
  await menu.click();
  await navigation.getByRole("button", { name: "My roadmap", exact: true }).press("Enter");
  await expect(page.locator("main h1")).toHaveText("My roadmap");
  await expect(navigation).toBeHidden();
  await expect(page.locator("main")).toBeFocused();
  await menu.click();
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(menu).toBeHidden();
  await expect(navigation).toBeVisible();
  await page.setViewportSize({ width: 320, height: 700 });
  await expect(menu).toHaveAttribute("aria-expanded", "false");
  await expect(navigation).toBeHidden();
  await menu.click();
  await page.screenshot({path:"output/ui-guardrails/mobile-menu.png"});
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
});
