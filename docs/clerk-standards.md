# Clerk Standards

CREXA uses Clerk for authentication per [ADR 007](decisions/007-authentication-architecture.md).

## Architecture

- **Clerk** owns authentication credentials, sessions, and verification flows.
- **CREXA** owns product data in Neon PostgreSQL.
- Product tables must **never reference Clerk user IDs directly**.
- CREXA internal users and provider identity mappings are owned in Neon.
- Lazy provisioning resolves an authenticated Clerk user at `/account`.
- Verified webhooks are a later approved task.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key for client-side SDK initialization |
| `CLERK_SECRET_KEY` | Clerk secret key for server-side operations |

Rules:

- Store real values only in `.env.local`.
- Keep placeholders in `.env.example`.
- Never expose `CLERK_SECRET_KEY` in client code or `NEXT_PUBLIC_` variables.
- Never commit `.env.local`.

## Next.js structure

| Path | Purpose |
| --- | --- |
| `src/app/layout.tsx` | `ClerkProvider` wraps application content inside `<body>` |
| `src/proxy.ts` | Next.js 16 Clerk middleware boundary |
| `src/app/sign-in/[[...sign-in]]/page.tsx` | Sign-in route |
| `src/app/sign-up/[[...sign-up]]/page.tsx` | Sign-up route |
| `src/app/account/page.tsx` | Protected account test route |

Public routes remain public by default. Sensitive routes use resource-level server protection with `await auth()`.

Client-side auth visibility uses Clerk v7 `Show` with `when="signed-in"` or `when="signed-out"` (replacing legacy `SignedIn` / `SignedOut`).

## Authorization rules

- Authentication and authorization are different concerns.
- Sign-in alone does not grant product permissions.
- Protect sensitive server resources at the resource level.
- Do not rely on client-only visibility checks for security.
- Do not store roles in Clerk public metadata without an approved design.

## Data rules

- Do not copy unnecessary Clerk profile data into Neon.
- Do not store passwords, session tokens, or refresh tokens in CREXA tables.
- Do not connect product tables directly to Clerk IDs.
- Lazy CREXA-user provisioning runs only after authenticated access to an approved protected resource.
- Verified Clerk webhooks are a later approved lifecycle task.

## Security

- Never log Clerk secrets or session tokens.
- Never commit `.env.local`.
- Rotate keys immediately if exposed.
- Use development keys locally.
- Production keys require a separate deployment task.

## Current boundary

- Clerk foundation is configured in the application.
- CREXA user and external identity tables exist in Neon.
- `/account` is the initial lazy-provisioning trigger.
- No webhook endpoint exists.
- No authorization roles or permissions exist.
