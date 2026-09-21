# Task 4 — shadcn/ui integration

The repository already contained components.json (new-york, React TSX, Vite aliases) and generated Radix-backed components under client/src/components/ui. All direct Radix imports are confined to that component layer; there were no page-level Radix primitives to replace. Reinitializing would overwrite existing customizations.

Completed the Tailwind 4 setup with semantic theme tokens, the existing data-theme dark selector, and tw-animate-css (already installed), following https://ui.shadcn.com/docs/tailwind-v4. Declared Lucide in components.json; no dependencies added.

Migrated the live account dialog to shared Dialog, then Button, then Input. Radix owns modal focus trapping, background interaction and Escape behavior; explicit return focus preserves the external sign-in trigger. The form uses an accessible title, description and error alert, constrained viewport height and scrolling, plus light/dark surface tokens. Existing IME composition support is retained. Existing unrelated native page controls remain native.

Validation: TypeScript, 202 tests, production build. Browser inspection was attempted but denied because the administrator policy could not be verified. Visual checks at narrow widths, focus return/Tab trapping, Escape, Arabic and both themes must still be accepted in a permitted browser. No screenshot or browser acceptance is claimed.
