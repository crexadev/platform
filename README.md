# CREXA

CREXA is a web platform dedicated to AI-generated music.

## Status

Early development. The application foundation is in place; product features are not yet implemented.

## Foundation

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- pnpm

## Prerequisites

- Node.js 20.9 or later
- pnpm
- A Neon PostgreSQL `DATABASE_URL` in `.env.local`
- Clerk development keys in `.env.local`:
  - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
  - `CLERK_SECRET_KEY`

## Local development

All Git and application commands must be run inside the `platform/` directory.

```bash
cd platform
cp .env.example .env.local
pnpm install
pnpm dev
```

On Windows PowerShell:

```powershell
cd platform
Copy-Item .env.example .env.local
pnpm install
pnpm dev
```

Set a valid `DATABASE_URL` in `.env.local` before running server features that require the database. See [docs/postgresql-foundation.md](docs/postgresql-foundation.md) for database setup details.

Add Clerk development keys to `.env.local` before running authentication. See [docs/clerk-standards.md](docs/clerk-standards.md) for Clerk setup rules.

## Authentication routes

| Route | Purpose |
| --- | --- |
| `/sign-in` | Sign in with Clerk |
| `/sign-up` | Create a Clerk account |
| `/account` | Protected account test route (requires authentication) |

The homepage remains public.

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available commands

| Command | Description |
|---|---|
| `pnpm install` | Install dependencies |
| `pnpm dev` | Start the development server |
| `pnpm lint` | Run ESLint |
| `pnpm typecheck` | Run TypeScript without emitting files |
| `pnpm build` | Create a production build |
| `pnpm start` | Serve the production build |
| `pnpm db:generate` | Generate SQL migrations from the Drizzle schema (review before applying) |
| `pnpm db:migrate` | Apply approved SQL migrations |
| `pnpm db:studio` | Open Drizzle Studio (connects to the configured database) |
| `pnpm db:check` | Validate migration consistency |

## Database tooling

CREXA uses **Drizzle ORM** with Neon PostgreSQL. See [docs/drizzle-standards.md](docs/drizzle-standards.md) for schema, migration, and query rules.

- No application schema exists yet.
- Review generated SQL before running `pnpm db:migrate`.
- `pnpm db:studio` connects to the configured database and can modify data; use with care.

## External services

- **PostgreSQL (Neon)** — development database connection configured locally via `DATABASE_URL`
- **Clerk** — development authentication configured locally via Clerk environment variables
- Storage, payments, and analytics are not configured yet
