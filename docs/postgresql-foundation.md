# PostgreSQL Foundation

CREXA uses managed PostgreSQL through Neon for structured application data.

## Provider decision

- **Neon** is the managed PostgreSQL provider for CREXA development.
- **PostgreSQL** remains the underlying database engine.
- **Neon Auth**, **Neon Storage**, and the **Neon Data API** are not configured.

## Environment variables

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Primary pooled PostgreSQL connection for server-side application use |
| `DATABASE_URL_UNPOOLED` | Direct connection for Drizzle Kit migrations and Studio |

### Local setup

1. Copy `.env.example` to `.env.local`
2. Set a valid `DATABASE_URL` from the Neon project
3. Add `DATABASE_URL_UNPOOLED` for Drizzle Kit migrations and Studio

## Access layer

- **Drizzle ORM** is the accepted database access layer per [ADR 005](decisions/005-orm-selection.md).
- Runtime application code uses `DATABASE_URL` through the server-only client in `src/db/index.ts`.
- Drizzle Kit uses `DATABASE_URL_UNPOOLED` when available for migration tooling.

See [drizzle-standards.md](drizzle-standards.md) for migration and query rules.

### Rules

- Real credentials belong only in `.env.local`
- Placeholder values belong in `.env.example`
- Never commit `.env.local`
- Never expose database secrets with a `NEXT_PUBLIC_` prefix

## Security

- **SSL is required** for database connections (`sslmode=require`)
- **Credentials must never be committed** to Git
- **Rotate credentials immediately** if they are exposed
- **Separate databases** for production, preview, and development should be introduced later
- **Least-privilege database roles** should be added when application architecture requires them

## Current scope

- Drizzle ORM foundation is configured
- No application tables exist
- No migrations have been generated or applied
- A server-only runtime database client exists in `src/db/index.ts`
- No production database environment exists yet

## Future workflow

The next database tasks will:

1. Introduce the first approved schema tables
2. Generate and review SQL migrations
3. Apply migrations after explicit approval
