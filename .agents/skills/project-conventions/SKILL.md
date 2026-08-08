---
name: project-conventions
description: Project-specific conventions. Use for every task in this repository.
---

# Project Conventions

`AGENTS.md` overrides this skill when instructions conflict.

## Repositories

- The product and `ctx/` cognitive context are maintained in one Git repository.
- `ctx/` is the authoritative ADSM cognitive context; keep product code and context consistent.

## Workflow

- Work in the repository's `main` branch. This project rule overrides any GitHub-skill instruction to use a separate branch.
- At the start of work, check upstream in the repository and fast-forward local `main` when safe.
- Before changes, inspect every affected working tree and preserve unrelated changes.
- Do not commit or push unless the user explicitly requests it.

## Communication

- Communicate with the user in Russian unless requested otherwise.
- Write source code, comments, documentation, commit messages, and identifiers in English.
- Report changes, verification, and remaining risks.

## Project boundaries

- Keep `@teqfw/db` as a pure JavaScript ESM relational persistence library for TeqFW applications.
- Preserve its boundaries: DEM composition, relational schema access, transaction-aware CRUD, and rebuild-oriented data transfer belong here; application entities, authorization, business rules, full incremental migration planning, and application cutover remain external.
- Treat `ctx/` as authoritative project knowledge, `src/` as implementation, `test/` as verification, and `doc/` as retained legacy public documentation.

## Validation

- Run `npm test` for source and integration changes; `npm run test:manual` is opt-in for manual scenarios.
- Every source file must parse with `node --check`; run `teqfw-esm-validator src --profile base` for `src/` changes and release validation.
- Preserve the documented DI 2.x, DEM, transaction, CRUD, database, and rebuild verification requirements in `ctx/docs/code/testing.md`.
- Run `git diff --check` before handoff.

## GitHub

- In all multiline text sent to GitHub, including issues and comments, use actual line breaks; never send literal `\n`, which GitHub displays as text.

## Shared memory

- `flancer32/ai-memo` is the shared cross-project issue tracker and memory.
- Issue source identity: `teqfw/db`; every issue must name the project or projects expected to resolve it.
- When referring to a commit in another repository, use its full GitHub URL: `https://github.com/vendor/name/commit/<sha>`.
- Notes: `project/teqfw/db/`.
