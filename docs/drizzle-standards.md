# Drizzle Standards

CREXA uses Drizzle ORM with Neon PostgreSQL for server-side database access and SQL migrations.

## Selected architecture

- **Drizzle ORM** is accepted by [ADR 005](decisions/005-orm-selection.md).
- **Neon PostgreSQL** is the managed provider.
- **Runtime** uses the Neon HTTP driver via `drizzle-orm/neon-http`.
- **Runtime** reads `DATABASE_URL` (pooled connection).
- **Drizzle Kit** prefers `DATABASE_URL_UNPOOLED` (direct connection) and falls back to `DATABASE_URL` when the unpooled variable is absent.

## File structure

| Path | Purpose |
| --- | --- |
| `drizzle.config.ts` | Drizzle Kit configuration for migrations and Studio |
| `src/db/index.ts` | Server-only runtime Drizzle client |
| `src/db/schema/index.ts` | Schema entry point for approved tables |
| `src/db/schema/users.ts` | Internal CREXA user identity table |
| `src/db/schema/external-identities.ts` | Provider-independent auth identity mappings |
| `src/db/schema/relations.ts` | Drizzle relationship definitions |
| `drizzle/` | Generated SQL migration output directory |

## Schema rules

- Every table requires separate approval before it is added.
- Use PostgreSQL-native constraints and types where appropriate.
- Prefer database-enforced integrity over application-only checks.
- Define primary keys deliberately.
- Add foreign keys deliberately.
- Define unique constraints deliberately.
- Add indexes from verified query requirements.
- Avoid speculative indexes.
- Keep table and column naming consistent across the platform.
- Do not introduce authentication tables before the authentication provider is selected.

## Migration rules

- Generate SQL migrations with `pnpm db:generate`.
- Review generated SQL before application.
- Apply migrations with `pnpm db:migrate` only after approval.
- Never edit migration history after it has been applied to shared environments.
- Never run `drizzle-kit push` against shared, staging, or production databases.
- Never run migrations automatically during application startup.
- Use direct or unpooled credentials for migration tooling.
- Keep migration files committed to Git.

## Query rules

- Database imports are server-only.
- Never import `db` into client components.
- Validate external input before queries.
- Select only required columns where practical.
- Use transactions when atomicity is required.
- Use raw SQL only when Drizzle APIs are insufficient or SQL is clearer.
- Parameterize all dynamic values.
- Do not log secrets or sensitive records.

## Neon driver guidance

- **Neon HTTP** is the default for ordinary serverless queries.
- Interactive or session-based transactions may require a separately approved WebSocket driver strategy.
- Do not introduce another database driver without an architecture review.

## Current boundary

- Identity schema (`users`, `external_identities`) is defined in TypeScript.
- Migration `0000_identity_foundation` is generated but **not applied**.
- Database tables do not yet exist in Neon.
- No CREXA user has been provisioned.
- See [identity-schema.md](identity-schema.md) for identity table rules.
