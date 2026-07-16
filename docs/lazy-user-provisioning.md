# Lazy User Provisioning

CREXA lazily maps an authenticated Clerk user to a permanent internal CREXA UUID.

## Trigger

Provisioning runs only after authenticated access to an approved protected CREXA resource. The initial trigger is `/account`.

It does not run from public routes, the root layout, ClerkProvider, `proxy.ts`, sign-in, sign-up, client components, or static builds.

## Algorithm

1. Read the Clerk user ID only from server-side `await auth()`.
2. Look up `(provider, provider_user_id)` using the stable provider identifier `clerk`.
3. Return the mapped CREXA user when it exists.
4. If absent, atomically insert one `users` row and one `external_identities` row with the Neon HTTP transactional batch API.
5. If a concurrent request wins the unique-constraint race, re-read and return its mapping.

The database unique constraint on `(provider, provider_user_id)` is the final correctness boundary. A failed batch rolls back both inserts, so it cannot leave an orphaned CREXA user.

## Data stored

- Internal CREXA user UUID and timestamps
- CREXA account status
- Provider identifier
- Provider user ID

CREXA does not store passwords, session tokens, verification codes, email addresses, or Clerk profile data for this flow.

## Status behavior

- `active`: access is permitted.
- `suspended`: access is denied with a controlled application response.
- `deleted`: access is denied with a controlled application response.

## Current boundary

- No webhook lifecycle synchronization
- No profile provisioning
- No role or creator assignment
- No account deletion workflow

Product tables continue to reference only CREXA internal UUIDs. Clerk user IDs remain isolated in `external_identities`.
