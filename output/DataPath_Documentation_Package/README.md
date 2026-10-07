> Historical snapshot: 27 September 2026. UI and schema have since changed. See ../feature-guide/ for the latest feature reference.

# DataPath audience documents

Reviewed 27 September 2026 against application baseline 88c1d89 and documentation checkout 844dee8.

## Deliverables
- DataPath_Technical_Reference_Updated.pdf: 32 pages for engineering readers, with four new source-derived diagrams and all ten database tables. The ERD uses a larger landscape page for readable export/printing.
- DataPath_User_Guide.pdf: 19 pages for learners, with current screenshots and plain-language instructions.
- DataPath_Investor_Deck.pptx: 12 editable slides, with source notes and intentional team/funding placeholders. Created with the Slides artifact tooling. Not inspected in Microsoft PowerPoint itself.
- screenshots/: 12 captures from the current local UI in isolated guest sessions during 25–27 September. These are current screenshots, not reused images from the old PDF. SQL and Python passing states were produced by real execution with synthetic data, not injected scores.
- diagrams/: four newly authored SVG diagrams from current schema, routers and UI flow. The unified ERD includes all ten declared tables, with retained legacy structures distinguished.
- Markdown sources support later editing.

## Verification boundary
282 tests across 40 files passed during this documentation task on 25 September. Representative local SQL and Python runs passed on 27 September. Earlier database integration evidence comes from the preceding quality pass. The inspected project environment has no database URL, AI key/model or OAuth server configured. Production Neon connectivity, deployment, live AI accuracy and provider billing remain unverified.

The app was started locally for capture. No application code, schema, credentials or user browser data were changed. Existing PDF guides remain unchanged. No new dependencies were installed.

The requested /mnt/user-data/outputs location is not available on this macOS host. Screenshots are delivered in the screenshots folder in this package instead.
