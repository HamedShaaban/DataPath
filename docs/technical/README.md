# DataPath technical reference

Prepared 25 September 2026 against implementation commit `88c1d89`.

- `DataPath_Technical_Reference.md`: editable complete reference.
- `diagrams/`: 14 editable vector SVG diagrams.
- The accompanying PDF is the reviewed 35-page edition.

PostgreSQL support and migrations exist and have prior local integration evidence. The inspected project environment has no DATABASE_URL; production Neon connectivity is not verified. Browser PGlite is a separate temporary practice database.

This documents implementation and known limits; it does not certify production readiness. No credentials are included. Existing application files, database schema and earlier guides were not changed.
