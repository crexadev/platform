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

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available commands

| Command | Description |
|---|---|
| `pnpm install` | Install dependencies |
| `pnpm dev` | Start the development server |
| `pnpm lint` | Run ESLint |
| `pnpm build` | Create a production build |
| `pnpm start` | Serve the production build |

## External services

- **PostgreSQL (Neon)** — development database connection configured locally via `DATABASE_URL`
- Authentication, storage, payments, and analytics are not configured yet
