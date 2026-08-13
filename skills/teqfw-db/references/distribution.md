# Distribution

The published package contains the consumer skill, source namespace, type declarations, and usage artifacts. Historical project-only documentation is not part of the npm package; use the repository context for product and architecture decisions.

## Installed Location

The package publishes the version-matched skill at `node_modules/@teqfw/db/skills/teqfw-db/`. Load `SKILL.md` as its entry point. Every required reference is below that directory and describes the installed package version.

## Host-Owned Mounting

The host project decides whether and how to make the skill discoverable. Installation performs no `postinstall` mutation, creates no links, and does not modify host agent configuration.

A host using an `.agents/skills/` catalog can mount the installed skill explicitly:

```sh
mkdir -p .agents/skills
ln -s ../../node_modules/@teqfw/db/skills/teqfw-db .agents/skills/teqfw-db
```

Prefer this local mount when guidance must remain aligned with the installed package version. A global installation through the current Codex skill mechanism is an alternative when version alignment is not required; verify that mechanism's current contract rather than inventing a command.

Preserve host-project instructions and cognitive context as the authority for application intent, persistence policy, destructive-operation authority, and architecture.

## Compiler Wiring

TypeScript and checked-JavaScript consumers discover the package contract from `package.json#types` and the root `exports.types` condition. Include the package declaration in the consumer program when ambient `TeqFw_Db_*` aliases are needed. Do not add `src/**` imports to obtain those aliases: source modules remain DI-resolved implementation files, while `types.d.ts` is the supported compiler entrypoint.
