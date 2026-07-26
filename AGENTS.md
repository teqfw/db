# Root Level

- Path: `AGENTS.md`
- Template Version: `20260605`
- Changed: `20260726`

## Purpose

This file defines the root invariants of ADSM for the entire project.

## Project Model

The project consists of:

- the cognitive context in `ctx/`;
- the software product outside `ctx/`.

The cognitive context is the authoritative project knowledge used when changing the product.
Read `ctx/AGENTS.md` and `ctx/docs/filesystem.md` before deeper work.

## Human And Agent Roles

The Human defines goals, authorizes work, evaluates outcomes, and owns accepted meaning.
The Agent interprets the context, performs authorized work, maintains context-product consistency, and reports decisions that exceed its authority.

## Context And Product Consistency

Implementation and tests must remain consistent with `ctx/docs/`.
When implementation and context diverge, expose the conflict and restore consistency within the authorized task.
Product meaning precedes architecture, architecture precedes environment, and environment precedes code constraints.

## AGENTS.md Hierarchy

The effective instructions are the aggregate of `AGENTS.md` files from the repository root to the target path.
Deeper files refine the rules within their scope but cannot override root invariants.

## Root File Protection

Do not modify, replace, delete, relocate, or reinterpret this file unless the Human explicitly requests it.
