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
| `DATABASE_URL_UNPOOLED` | Optional direct connection for future migration tooling |

### Local setup

1. Copy `.env.example` to `.env.local`
2. Set a valid `DATABASE_URL` from the Neon project
3. Add `DATABASE_URL_UNPOOLED` only when direct migration access is required

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

- No ORM is configured
- No tables or migrations exist
- No application database client exists
- No production database environment exists yet

## Future workflow

The next database task will:

1. Choose and configure **Drizzle** or **Prisma**
2. Add a server-only database client
3. Establish migration practices
4. Introduce the first approved schema

Do not assume an ORM has already been selected.
