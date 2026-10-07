# Security Policy

## Reporting a Vulnerability

Report suspected vulnerabilities privately to the maintainer at <alex@flancer64.com>.
Include the package version, affected entry point, reproduction steps, and impact.
Do not send production credentials or customer data, and avoid public disclosure of
exploitable details before the maintainer can assess the report.

## Trust Boundaries

Treat installed TeqFW plugins, DEM declarations, application maps, and import dumps
as trusted application inputs. Validate and limit external input before passing it
to package APIs. Raw SQL access requires caller-owned parameter bindings.

The host owns authorization, database credentials, least-privilege database roles,
and explicit approval for destructive schema operations. Use disposable databases
for opt-in tests. A rebuild requires an explicit preservation or discard decision.

## Dependency and Publication Checks

Run `npm ci`, `npm run verify`, and `npm audit` in a checkout. Dependency audit
results describe known advisories; they do not certify the implementation as secure.
`npm audit signatures` can additionally verify registry signatures and available
attestations. Overrides in this repository apply to its development dependency
graph, not to consumers' application graphs.

The package has no installation lifecycle scripts. The SQLite development driver
has a native installation script; review that script when configuring npm script
approval. Do not approve all dependency scripts indiscriminately.

The agent publishes an inspected artifact from the verified local checkout only
after explicit Human authorization. It uses the configured npm authentication
without reading, printing, exporting, or committing credentials. Account protection
and any required interactive authentication remain with the publisher.

GitHub Actions runs verification and does not publish. The current publication
process does not require a GitHub Trusted Publisher or OIDC setup. Do not claim
provenance unless the published artifact's registry metadata confirms it.
