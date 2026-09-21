import { readFileSync } from "node:fs";
import postcss from "postcss";
import { describe, it, expect } from "vitest";
const root = postcss.parse(
  readFileSync(new URL("../client/src/index.css", import.meta.url), "utf8")
);
const property = (selector: string, prop: string) => {
  let value = "";
  root.walkRules(rule => {
    if (rule.selectors.includes(selector))
      rule.walkDecls(prop, d => {
        value = d.value;
      });
  });
  return value;
};
const token = (value: string): string =>
  value.startsWith("var(")
    ? property('[data-theme="dark"]', value.slice(4, -1))
    : value;
function luminance(hex: string) {
  const rgb = hex
    .replace("#", "")
    .match(/../g)!
    .map(v => parseInt(v, 16) / 255)
    .map(v => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
}
function contrast(a: string, b: string) {
  const x = luminance(token(a)),
    y = luminance(token(b));
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}
describe("Dark-mode onboarding contrast regression", () => {
  it("pairs the period summary surface with readable heading and body text", () => {
    const bg = property('[data-theme="dark"] .plan-preview', "background");
    expect(bg).toBe("var(--surface-soft)");
    expect(
      contrast(property('[data-theme="dark"] .plan-preview h3', "color"), bg)
    ).toBeGreaterThanOrEqual(4.5);
    expect(
      contrast(property('[data-theme="dark"] .plan-preview p', "color"), bg)
    ).toBeGreaterThanOrEqual(4.5);
  });
  it("keeps career headings readable on both selected and normal cards", () => {
    for (const selector of [
      '[data-theme="dark"] .role-card',
      '[data-theme="dark"] .role-card.selected',
    ]) {
      const bg = property(selector, "background");
      expect(
        contrast(property('[data-theme="dark"] .role-card strong', "color"), bg)
      ).toBeGreaterThanOrEqual(4.5);
      expect(
        contrast(property('[data-theme="dark"] .role-card small', "color"), bg)
      ).toBeGreaterThanOrEqual(4.5);
    }
  });
  it("keeps input hints and dropdown options readable", () => {
    expect(
      contrast(
        property('[data-theme="dark"] textarea::placeholder', "color"),
        property('[data-theme="dark"] textarea', "background")
      )
    ).toBeGreaterThanOrEqual(4.5);
    expect(
      contrast(
        property('[data-theme="dark"] select option', "color"),
        property('[data-theme="dark"] select option', "background")
      )
    ).toBeGreaterThanOrEqual(4.5);
  });
});

describe("Shared workspace palette", () => {
  for (const theme of [":root", '[data-theme="dark"]']) {
    it(`keeps body, muted and accent text readable on both ${theme} surfaces`, () => {
      for (const foreground of ["--text", "--muted", "--green"]) {
        for (const background of ["--surface", "--surface-soft", "--page"]) {
          expect(
            contrast(property(theme, foreground), property(theme, background))
          ).toBeGreaterThanOrEqual(4.5);
        }
      }
    });
  }
});
