# ADR 007: Authentication Architecture

## Status

Accepted

## Decision

**Clerk**

## Approval

This decision was accepted because CREXA currently prioritizes:

- Managed authentication security
- Low operational burden
- Strong Next.js App Router support
- Fast MVP implementation
- Reliable use through Cursor Agent
- Separation between authentication data and CREXA product data

## Context

CREXA is an AI-generated music platform that will support listeners, creators, artist identities, profiles, uploads, social features, analytics, licensing records, and monetization.

The approved application stack is:

- Next.js 16 App Router
- TypeScript
- Tailwind CSS v4
- Neon PostgreSQL 17
- Drizzle ORM with Neon HTTP runtime driver
- Reviewable SQL migration workflow

Current database state:

- Application tables: 0
- Authentication tables: 0
- Migrations generated: 0
- Migrations applied: 0

CREXA needs managed authentication without making the authentication provider the permanent owner of product data. Tracks, playlists, likes, follows, comments, analytics, rights records, and subscription relationships must remain under CREXA control in Neon, keyed by an internal CREXA user identity that can survive provider changes.

This ADR evaluates Clerk, Better Auth, and Supabase Auth, recommends one provider, and defines data ownership, synchronization, and migration-away boundaries. No authentication package is installed as part of this decision record.

## Options considered

- **Clerk** — Managed authentication platform with `@clerk/nextjs` for Next.js App Router, hosted or prebuilt sign-in experiences, and external user identifiers
- **Better Auth** — Self-hosted TypeScript authentication framework with Drizzle adapter, storing users, sessions, accounts, and verification data in CREXA’s Neon database
- **Supabase Auth** — Managed authentication from Supabase, typically used with `@supabase/ssr` and `@supabase/supabase-js`, with auth users stored in Supabase’s auth system

## Decision criteria

| Criterion | Weight |
| --- | --- |
| Lowest security and maintenance burden | 20% |
| Next.js App Router integration | 15% |
| Beginner and Cursor reliability | 15% |
| Compatibility with Neon and Drizzle | 10% |
| Fast MVP implementation | 10% |
| Provider-switching flexibility | 10% |
| Product-data ownership | 10% |
| Long-term scalability | 5% |
| Cost predictability | 5% |

## Evaluation

### Clerk

| Area | Assessment |
| --- | --- |
| **Next.js App Router** | First-class `@clerk/nextjs` support; `clerkMiddleware()` for App and Pages routers; Next.js 16 uses `proxy.ts` network boundary; async `auth()` in Server Components, Route Handlers, and Server Actions |
| **Sessions** | Managed by Clerk; session validation via Clerk SDK; CREXA does not store session tokens |
| **Sign-up / sign-in** | Hosted components, Account Portal, or custom UI using Clerk elements |
| **Password reset / verification** | Managed by Clerk |
| **Social login** | Built-in OAuth providers |
| **Prebuilt UI** | Strong — hosted pages and prebuilt React components |
| **Custom UI** | Supported with Clerk Elements and lower-level APIs |
| **Security responsibility** | Low for CREXA — Clerk manages credentials, hashing, MFA infrastructure, and auth security operations |
| **Database ownership** | Auth data external to Neon; CREXA stores only product data and external identity mappings |
| **Neon / Drizzle fit** | Auth is separate; product schema remains in Neon with Drizzle; synchronization required between Clerk users and CREXA users |
| **Services introduced** | One additional managed auth service |
| **Setup complexity** | Low — Clerk CLI can install SDK, wire provider, and scaffold routes |
| **Maintenance** | Low ongoing auth operations burden |
| **Beginner / Cursor** | Excellent official docs, CLI, and AI-oriented setup prompts |
| **Vendor lock-in** | Moderate — auth users and sessions live in Clerk; mitigated by provider-independent CREXA user IDs |
| **Export / migration** | Clerk Backend API and user export capabilities exist; password hashes are not portable; migration requires planning |
| **Webhooks** | Supported via Svix; `user.created`, `user.updated`, `user.deleted`, and related events; retries and replay available |
| **Cost risk** | MAU-based pricing; free tier for development; costs can grow with audience |
| **CREXA fit** | Strong for early product velocity with explicit product-data isolation |

**Advantages:** Fastest secure MVP, lowest auth security burden, excellent Next.js 16 integration, clear separation between auth provider and product database.

**Disadvantages:** Vendor dependency, webhook synchronization complexity, MAU pricing exposure, provider user IDs must not leak into product schema.

### Better Auth

| Area | Assessment |
| --- | --- |
| **Next.js App Router** | Supported via route handlers (`toNextJsHandler`) and session APIs; middleware patterns documented |
| **Sessions** | Stored in CREXA’s database (or optional Redis secondary storage) |
| **Sign-up / sign-in** | CREXA implements and maintains flows |
| **Password reset / verification** | CREXA configures and operates verification tables and email flows |
| **Social login** | Supported via plugins and account tables |
| **Prebuilt UI** | Minimal — CREXA builds UI |
| **Custom UI** | Full flexibility |
| **Security responsibility** | High — CREXA owns password storage, session security, rate limiting, patching, and incident response |
| **Database ownership** | Core tables (`user`, `session`, `account`, `verification`) live in Neon via Drizzle adapter |
| **Neon / Drizzle fit** | Excellent native fit with existing stack |
| **Services introduced** | No additional auth SaaS; uses existing Neon |
| **Setup complexity** | Moderate to high — schema generation, route handlers, middleware, email provider, security hardening |
| **Maintenance** | High — auth framework upgrades, security advisories, operational monitoring |
| **Beginner / Cursor** | Good docs but more assembly required; higher risk of misconfiguration |
| **Vendor lock-in** | Low at database level — auth data is in CREXA’s Postgres |
| **Export / migration** | Database-level control simplifies some transitions, but password hashes remain non-portable across different auth systems |
| **Webhooks** | Not required for basic operation; CREXA can use database hooks instead |
| **Cost risk** | No auth SaaS fees; operational and engineering cost instead |
| **CREXA fit** | Strong long-term control, weaker near-term velocity for a small team |

**Advantages:** Best alignment with Neon + Drizzle, no auth SaaS bill, database-level ownership of auth records.

**Disadvantages:** CREXA assumes auth security operations, slower MVP, higher risk of security mistakes, auth tables coexist with product tables and require strict boundaries.

### Supabase Auth

| Area | Assessment |
| --- | --- |
| **Next.js App Router** | Supported via `@supabase/ssr` with separate browser, server, and middleware clients; cookie-based sessions |
| **Sessions** | Managed by Supabase Auth; JWT/cookie session model |
| **Sign-up / sign-in** | Supabase-hosted or custom UI |
| **Password reset / verification** | Managed by Supabase |
| **Social login** | Built-in providers |
| **Prebuilt UI** | Available through Supabase UI patterns |
| **Custom UI** | Supported |
| **Security responsibility** | Moderate — Supabase manages auth core; CREXA manages integration, middleware, and dual-platform operations |
| **Database ownership** | Auth users live in Supabase `auth.users`, not Neon; product data remains in Neon |
| **Neon / Drizzle fit** | Weak — introduces a second data platform beside Neon; bridge required between Supabase auth users and CREXA product records |
| **Services introduced** | Supabase project in addition to Neon |
| **Setup complexity** | Moderate — dual environment, dual client utilities, middleware token refresh |
| **Maintenance** | Moderate — two platform ecosystems to understand and operate |
| **Beginner / Cursor** | Good official Next.js prompts and tutorials |
| **Vendor lock-in** | Moderate to high toward Supabase ecosystem |
| **Export / migration** | Supabase provides auth APIs; still requires mapping to CREXA internal IDs; passwords not portable |
| **Webhooks** | Supabase database webhooks or auth hooks possible, but architecture spans two platforms |
| **Cost risk** | Additional Supabase billing alongside Neon |
| **CREXA fit** | Weaker while CREXA has committed to Neon + Drizzle as the sole application database |

**Advantages:** Managed auth security, solid Next.js SSR documentation, useful if CREXA later adopts broader Supabase services.

**Disadvantages:** Two database platforms, weaker fit with approved Neon-only product architecture, identity bridge still required, less benefit without adopting Supabase Postgres.

## Weighted decision matrix

| Criterion (weight) | Clerk (1–5) | Better Auth (1–5) | Supabase Auth (1–5) | Clerk weighted | Better Auth weighted | Supabase weighted |
| --- | --- | --- | --- | --- | --- | --- |
| Security and maintenance burden (20%) | 5.0 | 2.5 | 4.0 | 1.00 | 0.50 | 0.80 |
| Next.js App Router integration (15%) | 5.0 | 4.0 | 4.0 | 0.75 | 0.60 | 0.60 |
| Beginner and Cursor reliability (15%) | 5.0 | 3.5 | 4.0 | 0.75 | 0.53 | 0.60 |
| Neon and Drizzle compatibility (10%) | 4.0 | 5.0 | 2.0 | 0.40 | 0.50 | 0.20 |
| Fast MVP implementation (10%) | 5.0 | 3.0 | 3.0 | 0.50 | 0.30 | 0.30 |
| Provider-switching flexibility (10%) | 3.0 | 4.5 | 2.0 | 0.30 | 0.45 | 0.20 |
| Product-data ownership (10%) | 5.0 | 4.0 | 3.0 | 0.50 | 0.40 | 0.30 |
| Long-term scalability (5%) | 4.0 | 3.5 | 4.0 | 0.20 | 0.18 | 0.20 |
| Cost predictability (5%) | 3.0 | 5.0 | 3.0 | 0.15 | 0.25 | 0.15 |
| **Total** | | | | **4.55** | **3.71** | **3.35** |

These scores are CREXA-specific architectural judgments based on the chosen weights and current team context. They are not universal rankings of provider quality.

**Score rationale (brief):**

- **Clerk** scores highest on managed security, Next.js integration, beginner/Cursor reliability, and MVP speed.
- **Better Auth** scores highest on Neon/Drizzle fit, cost predictability, and database-level switching flexibility, but loses on security burden and implementation speed.
- **Supabase Auth** is a capable managed option, but scores lowest overall because CREXA already standardized on Neon for product data and would inherit a second platform without sufficient offsetting benefit.

## Rationale

Clerk is the best fit for CREXA now because:

1. **Lowest auth security burden** — CREXA is early-stage and has no authentication tables or security operations practice yet. Clerk manages credentials, sessions, verification, and social-provider plumbing.
2. **Fastest credible MVP** — Prebuilt and hosted authentication flows reduce time to first sign-in without building auth UI, email flows, and session infrastructure from scratch.
3. **Strong Next.js 16 alignment** — Official `@clerk/nextjs` support, `clerkMiddleware()`, async `auth()`, and Next.js 16 `proxy.ts` conventions match CREXA’s current framework version.
4. **Clean product-data separation** — Clerk keeps authentication outside Neon while CREXA keeps product data in Neon with Drizzle, which matches ADR 005 and the requirement that auth must not own product entities.
5. **Provider independence is achievable** — With an internal CREXA user UUID and external identity mapping layer, product tables never need Clerk IDs. Switching providers later is possible but deliberate.

**Better Auth was not selected** because, although it fits Neon and Drizzle natively and improves database-level control, it shifts substantial security and maintenance responsibility to CREXA before the team has product schema or auth operations maturity. It is a strong reconsideration candidate if CREXA later develops in-house auth operations capacity.

**Supabase Auth was not selected** because it introduces a second platform ecosystem beside Neon without aligning with CREXA’s approved database architecture. Product data would still require a Neon bridge, while auth would live in Supabase.

## Authentication-provider responsibilities

The authentication provider owns:

- Password credentials and password hashing
- Authentication sessions and session validation
- Sign-up, sign-in, and sign-out flows at the auth layer
- Email and phone verification state for authentication factors
- Password recovery and reset flows
- Social-provider connections and OAuth token handling at the auth layer
- Provider-specific MFA, passkeys, and auth security records
- Provider-hosted or provider-managed authentication UI when used
- Provider account status relevant to authentication (for example suspended or deleted auth users)

The provider must **not** become the system of record for CREXA product entities.

## CREXA responsibilities

CREXA owns in Neon:

- Internal CREXA user ID (stable UUID)
- Username, display name, and public profile fields owned by the product
- Creator or listener status and product roles
- Artist identity and biography
- User preferences
- Uploaded music, albums, releases, and metadata
- Playlists, likes, follows, and comments
- Creator analytics and listening events
- Licensing and rights records
- Subscription and monetization relationships as product records
- Moderation state and audit records tied to product actions

CREXA must **not** store in product tables:

- Authentication passwords
- Password hashes
- Provider session tokens
- Provider refresh tokens
- Provider OAuth secrets

## Provider-independent identity boundary

CREXA will use two conceptual records. Exact schema, column types, and Drizzle definitions require separate approval.

### CREXA user (product identity)

Owned entirely by CREXA. All product foreign keys reference this identity only.

| Field (conceptual) | Purpose |
| --- | --- |
| `id` | Internal CREXA-controlled UUID — stable forever |
| `username` | CREXA-owned public identifier |
| `displayName` | CREXA-owned display name |
| `createdAt` | Product record creation time |
| `updatedAt` | Product record update time |
| Product-owned fields | Creator/listener flags, profile fields, preferences, etc. |

### External authentication identity (provider mapping)

Maps a CREXA user to an external auth provider account without exposing provider IDs to product tables.

| Field (conceptual) | Purpose |
| --- | --- |
| `id` | Internal mapping record ID |
| `crexaUserId` | Foreign key to internal CREXA user |
| `provider` | Provider name (initial value: `clerk`) |
| `providerUserId` | External provider user identifier |
| `createdAt` | Mapping creation time |

### Constraints

- **All product tables reference `crexaUserId` only**
- **Product tables must never reference Clerk IDs directly**
- **`provider` + `providerUserId` must be unique**
- **A CREXA user may eventually have multiple external identities**
- **Clerk is the initial provider, not the permanent schema owner**
- **Clerk does not own CREXA’s product schema**
- **Provider profile fields are not copied into CREXA unless there is an explicit product reason**

Authorization in CREXA should use CREXA roles and product state, not Clerk public metadata as the long-term source of truth.

## Synchronization strategy

The accepted target architecture is **hybrid synchronization**: lazy provisioning for first access, with verified webhooks added later for lifecycle consistency. Implementation is deliberately phased.

### Options considered

| Strategy | Strengths | Weaknesses |
| --- | --- | --- |
| **Lazy creation on first authenticated request** | Simple MVP; no webhook infrastructure required initially; user row exists before product actions | Misses provider-side changes until next login; deletion/suspension may lag |
| **Clerk webhook synchronization** | Better eventual consistency for create/update/delete; supports background provisioning | Requires verified endpoint, retries, idempotency, and failure handling; not synchronous |
| **Hybrid** | Fast first-login experience plus background consistency | Slightly more implementation surface |

### Accepted target architecture: **Hybrid**

CREXA will eventually combine lazy provisioning and webhook lifecycle synchronization. The first approved implementation stage uses lazy provisioning only.

### Initial MVP stage

The first approved authentication implementation will:

- Create or resolve the internal CREXA user **lazily after the first verified Clerk-authenticated request**
- Use an **idempotent upsert** keyed by `provider + providerUserId`
- Enforce the **unique `provider` + `providerUserId` identity constraint**
- **Not copy unnecessary Clerk profile data** into CREXA tables
- **Not depend on webhooks** for the user’s first successful access

First-login provisioning must be sufficient for MVP sign-in and initial product actions.

### Lifecycle synchronization stage

Verified Clerk webhooks will be added later through a **separate approved task** for lifecycle events such as:

- `user.updated`
- `user.deleted`

Webhook handlers in that later stage must include:

- **Signature verification**
- **Idempotency**
- **Retry safety**
- **Out-of-order event tolerance**
- **Minimal provider-data copying**
- **A deliberate deletion or suspension policy**
- **Monitoring and failure recovery**

Webhooks must not be treated as synchronous onboarding dependencies. Lazy provisioning remains the fallback if webhook delivery is delayed or temporarily fails.

### Operational rules (both stages)

- **Idempotency:** All create/update handlers must tolerate duplicate delivery
- **Duplicate prevention:** Unique constraint on `provider + providerUserId`
- **Retries:** Accept Clerk/Svix retries; handlers must be safe to rerun
- **Out-of-order events:** Use event timestamps and last-processed markers where needed
- **Deleted or suspended accounts:** Mark external identity inactive; block new product actions according to policy
- **Webhook failures:** Lazy creation still allows first login; reconciliation can backfill missed events in the lifecycle stage
- **Minimal provider data:** Store only mapping identifiers and essential auth-state flags, not full Clerk profile payloads
- **Source of truth:** Clerk owns authentication state; CREXA owns product identity and product profile fields

## Migration-away strategy

Switching authentication providers is **possible** because product data is isolated behind internal CREXA user IDs. It is **not automatic, free, or riskless**.

### Migration principles

1. **Keep CREXA internal UUIDs stable** — product foreign keys must not change during provider migration
2. **Add or update external identity records** — new provider mappings attach to existing CREXA users
3. **Export users from the current provider where supported** — use Clerk Backend API/export tooling for identity inventory
4. **Map old provider identities to new provider identities** — maintain a translation table during transition
5. **Require re-verification or password reset when hashes cannot migrate** — password hashes are generally not portable between providers
6. **Run a controlled transition period** — support dual-provider login only if explicitly approved; otherwise communicate a cutover window
7. **Avoid changing foreign keys in product tables** — only external identity mappings change
8. **Maintain audit records** — log provider migrations, unlink events, and forced re-authentication actions
9. **Test on non-production first** — rehearse export, mapping, and login flows on staging Neon branches
10. **Communicate user impact clearly** — users may need to sign in again, reconnect social accounts, or reset passwords

### Limitations

- Password hashes and some provider-specific authentication factors may not be portable
- Users may need password resets or account re-verification during a provider switch
- Product foreign keys remain stable because they use CREXA UUIDs, but provider identity mappings must be migrated carefully
- Social account relinking may require user action
- Historical provider session tokens cannot be migrated
- Webhook and middleware code must be replaced provider-by-provider
- Migration should be tested outside production first
- Migration may require downtime or phased rollout planning

## Accepted tradeoffs

By choosing Clerk, CREXA accepts:

- **Vendor dependency** for authentication operations
- **MAU-based pricing exposure** as the audience grows
- **Synchronization complexity** between Clerk and Neon product identities
- **Webhook operational responsibility** for lifecycle consistency
- **Non-portable password hashes** if CREXA later migrates away
- **Less database-native auth control** than Better Auth would provide

## Risks and mitigations

| Risk | Mitigation |
| --- | --- |
| Vendor dependency | Internal CREXA UUIDs; external identity mapping; documented migration-away strategy |
| Pricing or plan changes | Monitor MAU; define reconsideration triggers; keep product data out of Clerk |
| Webhook synchronization failures | Idempotent handlers; lazy creation fallback; replay support; reconciliation job |
| Duplicate identities | Unique `(provider, providerUserId)`; transactional upsert on first login |
| Provider outages | Graceful auth outage handling; no product-data mutation during auth failures |
| Account deletion inconsistency | Process `user.deleted` webhooks; deactivate mappings; define product policy for orphaned content |
| Excessive copying of provider data | Store only mapping and required auth-state flags; CREXA owns profile fields |
| Authorization coupled to Clerk metadata | Use CREXA roles and product tables for authorization decisions |
| Clerk IDs in product schema | Code review rule: product tables reference CREXA user ID only |
| Session secrets in Neon | Prohibit password and session token storage in product tables |

## Consequences

### Database schema

- First approved schema task will introduce CREXA user and external identity tables
- Auth tables remain outside Neon (Clerk-managed)
- No Clerk IDs in product foreign keys

### Product relationships

- Tracks, playlists, likes, follows, comments, analytics, and subscriptions reference internal CREXA user IDs
- Creator/listener distinctions live in CREXA-owned fields

### Authorization

- Authentication via Clerk; authorization via CREXA product roles and policies
- Server-only checks use `await auth()` for identity, then resolve CREXA user mapping

### Webhooks

- Future approved task will add verified Clerk webhook endpoint
- Webhooks update identity lifecycle; they do not create product content automatically

### Testing

- Auth integration tests require Clerk test instances or mocked session contexts
- Product tests use CREXA user fixtures independent of provider IDs

### Deployment

- Clerk environment variables required in future implementation task
- Separate Clerk instances recommended for development, preview, and production later

### Future provider migration

- Product schema remains stable
- External identity table supports multiple providers
- Migration tasks can be executed without rewriting product foreign keys

## Implementation boundary

This ADR records the accepted authentication choice but does **not** implement it. Specifically:

- **Clerk is not installed**
- **No Clerk application has been created**
- **No `ClerkProvider` exists**
- **No middleware or proxy auth wiring exists**
- **No authentication pages exist**
- **No authentication environment variables exist**
- **No webhooks exist**
- **No internal CREXA user table exists**
- **No external identity table exists**
- **No migration has been generated**
- **No migration has been applied**
- **No database change has occurred**

Each item requires separate approval.

## Reconsideration triggers

Revisit this decision if:

1. **Authentication cost becomes disproportionate** relative to revenue or MAU
2. **Required auth functionality is unavailable** in Clerk (for example specific enterprise or regional requirements)
3. **Data residency requirements change** and Clerk cannot meet them
4. **Enterprise SSO requirements change** in ways Clerk pricing or features cannot support
5. **Provider limits block growth** (MAU caps, feature gating, or policy constraints)
6. **CREXA develops team capacity** to operate self-hosted auth safely
7. **Migration tooling becomes necessary** and Better Auth’s database ownership would materially reduce risk
8. **CREXA adopts Supabase broadly** for multiple services, changing the dual-platform tradeoff
9. **Repeated operational incidents** trace to Clerk synchronization or outage patterns that self-hosted auth would avoid

9. **Repeated operational incidents** trace to Clerk synchronization or outage patterns that self-hosted auth would avoid

---

*Sources consulted: [Clerk Next.js quickstart](https://clerk.com/docs/nextjs/getting-started/quickstart), [Clerk clerkMiddleware reference](https://clerk.com/docs/reference/nextjs/clerk-middleware), [Clerk webhooks overview](https://clerk.com/docs/guides/development/webhooks/overview), [Better Auth Drizzle adapter](https://www.better-auth.com/docs/adapters/drizzle), [Better Auth database concepts](https://www.better-auth.com/docs/concepts/database), [Supabase server-side auth](https://supabase.com/docs/guides/auth/server-side), [Supabase Next.js tutorial](https://github.com/supabase/supabase/blob/master/apps/docs/content/guides/getting-started/tutorials/with-nextjs.mdx).*
