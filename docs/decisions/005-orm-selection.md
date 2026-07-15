# ADR 005: ORM Selection

## Status

Accepted

## Decision

**Drizzle ORM**

## Approval

This decision was accepted because CREXA prioritizes:

- Neon-native serverless integration
- SQL transparency
- Reviewable SQL migrations
- PostgreSQL-specific control
- Analytics and event-query flexibility
- Lightweight TypeScript integration

## Context

CREXA is an AI-generated music platform built on:

- Next.js 16 App Router
- TypeScript (strict)
- Tailwind CSS v4
- Neon PostgreSQL 17
- pnpm
- Planned deployment on Vercel

The PostgreSQL foundation (commit `e8d73f1`) is established. Environment variables reserve:

- `DATABASE_URL` — pooled Neon connection for runtime application queries
- `DATABASE_URL_UNPOOLED` — direct connection for migration tooling

No ORM, schema, migration directory, or database client exists in the repository today.

The database will eventually support entities and workflows including users, artist profiles, tracks, albums, playlists (with ordered entries), likes, follows, comment threads, upload processing status, AI-generation disclosures, rights and licensing records, high-volume listening events, creator analytics, moderation audit logs, and subscription/payment records.

This ADR evaluates Drizzle ORM and Prisma ORM against CREXA's technical requirements and selects one for future implementation. No ORM is installed as part of this decision record.

## Options considered

- **Drizzle ORM** — TypeScript-first schema and query builder with `drizzle-kit` for migrations; native Neon drivers (`neon-http`, `neon-serverless`)
- **Prisma ORM** — Declarative `schema.prisma` with generated Prisma Client; `@prisma/adapter-neon` for serverless; Prisma Migrate for SQL migrations

## Decision criteria

| Criterion | Weight |
| --- | --- |
| Neon and serverless compatibility | 15% |
| PostgreSQL control | 15% |
| Type safety | 10% |
| Migration workflow | 15% |
| Query flexibility and analytics | 15% |
| Performance and runtime overhead | 10% |
| Beginner maintainability | 10% |
| Cursor AI coding reliability | 5% |
| Long-term platform fit | 5% |

## Evaluation summary

### Criterion-by-criterion comparison

#### 1. Next.js App Router compatibility

| | Drizzle | Prisma |
| --- | --- | --- |
| **Assessment** | Works in Server Components, Server Actions, and Route Handlers. Singleton `db` export is the documented pattern. No framework-specific coupling. | Works in the same server contexts. Requires `prisma generate` and careful singleton handling to avoid connection exhaustion in serverless. |
| **Advantage** | Drizzle | Slightly simpler runtime setup (no generate step) |
| **Reason** | Drizzle connects via `@neondatabase/serverless` without a separate client generation build step. | Prisma requires adapter wiring and generated client lifecycle management. |
| **Limitation** | Developers must choose the correct Neon driver (`neon-http` vs `neon-serverless`) for transaction needs. | Must call `prisma.$disconnect()` in standalone scripts; generated client path must be configured correctly in Prisma 7+. |

#### 2. Neon PostgreSQL compatibility

| | Drizzle | Prisma |
| --- | --- | --- |
| **Assessment** | First-class Neon integration documented by both Drizzle and Neon. Supports `neon-http` (HTTP, low latency for single queries) and `neon-serverless` (WebSocket, interactive transactions). | Official Neon guide and `@prisma/adapter-neon` adapter. Uses WebSocket-based serverless driver at runtime. |
| **Advantage** | Drizzle | More driver options for different access patterns |
| **Reason** | HTTP driver is well-suited to serverless cold starts and single-statement queries common in App Router handlers. | Prisma's adapter path is mature but WebSocket-only at runtime. |
| **Limitation** | Interactive transactions require WebSocket driver with extra Node.js `ws` configuration. | Requires both pooled and direct URLs; Prisma 7+ splits config between `prisma.config.ts` and adapter. |

#### 3. Serverless connection support

| | Drizzle | Prisma |
| --- | --- | --- |
| **Assessment** | `neon-http` avoids persistent TCP connections; ideal for Vercel serverless functions. Pooled `DATABASE_URL` is used at runtime; `DATABASE_URL_UNPOOLED` for `drizzle-kit`. | Pooled `DATABASE_URL` via `PrismaNeon` adapter; direct URL for CLI migrations. Connection limit configuration (`connection_limit=1`) recommended for serverless. |
| **Advantage** | Drizzle | HTTP driver aligns with short-lived serverless invocations |
| **Reason** | Neon and Drizzle document HTTP as faster for non-interactive, single transactions — the dominant App Router query pattern. | Prisma works but historically had more connection-pooling pitfalls in serverless; adapter mitigates but adds setup surface. |
| **Limitation** | Must not use pooled connections for migration DDL. | Must ensure preview/production env vars map to correct Neon branches. |

#### 4. TypeScript type safety

| | Drizzle | Prisma |
| --- | --- | --- |
| **Assessment** | Schema defined in TypeScript; types inferred at compile time from table definitions and relations. | Types generated from `schema.prisma` via `prisma generate`; strong autocomplete and relation typing. |
| **Advantage** | Prisma | Marginally more polished generated API types |
| **Reason** | Prisma Client's generated types cover every model, include, and select variant comprehensively. | — |
| **Limitation** | Complex relation queries can require more manual typing discipline. | Generated client must be regenerated after every schema change; stale client causes confusing type/runtime mismatches. |

#### 5. PostgreSQL feature access

| | Drizzle | Prisma |
| --- | --- | --- |
| **Assessment** | Schema API exposes PostgreSQL-specific column types (JSONB, arrays, enums, indexes, constraints) directly. Full SQL feature surface reachable via raw SQL. | Prisma supports PostgreSQL, Neon adapters, migrations, partial indexes, full-text search capabilities, and raw SQL. Some advanced analytics, custom PostgreSQL expressions, extensions, specialized indexes, or database-specific queries may still require TypedSQL, raw SQL, or manually reviewed migration SQL. |
| **Advantage** | Drizzle | Greater SQL transparency and direct PostgreSQL control |
| **Reason** | CREXA will need JSONB metadata, custom indexes, and eventually full-text search — Drizzle keeps these closer to the SQL layer by default. | — |
| **Limitation** | Developers carry more responsibility to use PostgreSQL features correctly. | Advanced or highly specialized PostgreSQL usage may still leave the declarative schema path; this is a transparency tradeoff, not a lack of PostgreSQL support. |

#### 6. SQL transparency and control

| | Drizzle | Prisma |
| --- | --- | --- |
| **Assessment** | Queries compile to predictable SQL; `sql` template tag for raw queries; schema maps closely to SQL DDL. | Prisma Client generates SQL internally; `$queryRaw` / `$executeRaw` available but ORM layer hides most SQL. |
| **Advantage** | Drizzle | SQL is inspectable and controllable |
| **Reason** | Analytics, moderation audit queries, and performance tuning benefit from visible SQL. | — |
| **Limitation** | More SQL literacy expected from contributors. | Debugging generated SQL requires enabling query logging. |

#### 7. Schema readability

| | Drizzle | Prisma |
| --- | --- | --- |
| **Assessment** | TypeScript table definitions with `pgTable`, relations, and indexes inline in code. | Declarative `schema.prisma` DSL; concise for standard relational models. |
| **Advantage** | Prisma | Cleaner for standard CRUD schemas |
| **Reason** | Prisma schema is a compact, purpose-built language easy to scan for entity relationships. | — |
| **Limitation** | Drizzle schema files grow verbose for large domains. | Prisma schema is a second language outside TypeScript; advanced PostgreSQL constructs are harder to express. |

#### 8. Migration generation

| | Drizzle | Prisma |
| --- | --- | --- |
| **Assessment** | `drizzle-kit generate` produces timestamped SQL migration files from TypeScript schema diffs. Also supports `push` for prototyping. | `prisma migrate dev` generates SQL migration folders from `schema.prisma` diffs. Also supports `db push` for prototyping. |
| **Advantage** | Tie | Both generate SQL from schema diffs |
| **Reason** | Both tools produce versioned SQL migration artifacts from declarative schema changes. | — |
| **Limitation** | Drizzle rename detection may prompt interactively. | Prisma migration history can conflict if manually edited without care. |

#### 9. Migration reviewability

| | Drizzle | Prisma |
| --- | --- | --- |
| **Assessment** | Generated `migration.sql` files are plain SQL in a `drizzle/` directory; snapshots aid diff review. | Generated SQL in `prisma/migrations/<timestamp>_<name>/migration.sql`; readable and committable. |
| **Advantage** | Drizzle | SQL output is the primary artifact with minimal abstraction |
| **Reason** | Drizzle migrations are straightforward SQL files with less tooling indirection; easy to review in PRs. | — |
| **Limitation** | `drizzle-kit push` bypasses migration files — must be policy-restricted in production. | Prisma migration lock and metadata add files beyond raw SQL. |

#### 10. Migration safety

| | Drizzle | Prisma |
| --- | --- | --- |
| **Assessment** | `drizzle-kit migrate` applies only unapplied migrations; uses `DATABASE_URL_UNPOOLED`. Supports custom SQL in migration files. | `prisma migrate deploy` applies pending migrations in CI/production; `migrate dev` for local only. Direct URL required for DDL. |
| **Advantage** | Tie | Both support safe deploy workflows |
| **Reason** | Both separate dev generation from production deploy commands and require direct connections for DDL. | — |
| **Limitation** | Team must enforce `generate` + `migrate` over `push` in production. | Accidental `migrate dev` in production is a known footgun; must use `migrate deploy`. |

#### 11. Complex relational queries

| | Drizzle | Prisma |
| --- | --- | --- |
| **Assessment** | Relational query API (`db.query` with `with`) plus SQL-like `select`/`join` builder. | `include`, `select`, nested writes, and relation filters via Prisma Client. |
| **Advantage** | Prisma | More ergonomic nested relation loading for standard patterns |
| **Reason** | Prisma's `include`/`select` API is highly productive for typical CRUD with nested entities. | — |
| **Limitation** | Drizzle relational queries require understanding of its relation config. | Deeply nested or conditional joins can become awkward; N+1 risk if not using `include` carefully. |

#### 12. Aggregate and analytics queries

| | Drizzle | Prisma |
| --- | --- | --- |
| **Assessment** | `count`, `sum`, `avg`, `groupBy` via query builder; easy transition to raw SQL for window functions and CTEs. | `aggregate`, `groupBy`, and `_count` cover many analytics needs; advanced analytics, custom PostgreSQL expressions, or specialized reporting may require TypedSQL, raw SQL, or manually reviewed migration SQL. |
| **Advantage** | Drizzle | Better path for listening-event analytics at scale |
| **Reason** | CREXA will need daily/monthly play aggregates, creator dashboards, and time-bucketed metrics — Drizzle's SQL proximity reduces friction for evolving analytics. | — |
| **Limitation** | Analytics SQL must be written/maintained by the team. | Complex reporting is possible but less transparent through the ORM layer. |

#### 13. Transaction support

| | Drizzle | Prisma |
| --- | --- | --- |
| **Assessment** | Interactive transactions via `neon-serverless` WebSocket driver or `node-postgres`; `db.transaction()` API. | `$transaction` with interactive and batch modes; requires Neon adapter WebSocket path. |
| **Advantage** | Tie | Both support transactions on Neon |
| **Reason** | Both document interactive transaction support through Neon's WebSocket driver. | — |
| **Limitation** | `neon-http` driver does not support interactive transactions — driver choice matters. | Long-running transactions are risky in serverless timeouts. |

#### 14. Indexes and constraints

| | Drizzle | Prisma |
| --- | --- | --- |
| **Assessment** | Indexes, unique constraints, check constraints, and composite keys defined in TypeScript schema alongside tables. | `@@index`, `@@unique`, `@unique`, and relation constraints in `schema.prisma`; partial indexes require raw SQL migrations. |
| **Advantage** | Drizzle | More direct PostgreSQL constraint expression |
| **Reason** | CREXA will need composite unique constraints (e.g., playlist track ordering) and performance indexes on high-volume event tables. | — |
| **Limitation** | Index strategy remains a design responsibility. | Partial and expression indexes need manual SQL in migration files. |

#### 15. Raw SQL support

| | Drizzle | Prisma |
| --- | --- | --- |
| **Assessment** | `sql` tagged template with parameter binding; integrates with typed schema references. | `$queryRaw`, `$executeRaw`, `Prisma.sql` tagged template; typed results require manual typing. |
| **Advantage** | Drizzle | Raw SQL is a first-class daily tool, not an escape hatch |
| **Reason** | Full-text search, JSONB operators, and analytics will require raw SQL on PostgreSQL. | — |
| **Limitation** | Raw SQL bypasses schema type safety if not wrapped carefully. | Raw query results are less integrated with generated types. |

#### 16. Runtime and bundle overhead

| | Drizzle | Prisma |
| --- | --- | --- |
| **Assessment** | Lightweight query builder; no generated client binary; tree-shakeable. | Generated Prisma Client adds significant bundle size; `prisma generate` required on every build. |
| **Advantage** | Drizzle | Smaller serverless function bundles |
| **Reason** | Vercel serverless functions benefit from minimal cold-start payload. | — |
| **Limitation** | None significant. | Build pipelines must include `prisma generate`; client size affects edge/serverless deployments. |

#### 17. Cold-start considerations

| | Drizzle | Prisma |
| --- | --- | --- |
| **Assessment** | `neon-http` driver: no persistent connection, HTTP round-trip per query batch. Minimal import overhead. | Prisma Client initialization + Neon WebSocket adapter setup on cold start. |
| **Advantage** | Drizzle | Lower initialization cost |
| **Reason** | Serverless functions on Vercel restart frequently; lighter clients reduce cold-start latency. | — |
| **Limitation** | HTTP per-query overhead for very chatty handlers — batch queries where possible. | Client instantiation must be module-cached as singleton. |

#### 18. Developer experience for a beginner

| | Drizzle | Prisma |
| --- | --- | --- |
| **Assessment** | Requires understanding SQL concepts, TypeScript schema syntax, and driver selection. Documentation is good but less hand-holding. | Excellent onboarding, Prisma Studio GUI, clear error messages, extensive tutorials. |
| **Advantage** | Prisma | Lower barrier for first-time ORM users |
| **Reason** | Prisma's guided workflows and Studio make schema exploration and debugging approachable. | — |
| **Limitation** | Drizzle assumes SQL familiarity. | Abstraction can hide PostgreSQL behavior until problems surface. |

#### 19. Ease of AI-assisted coding in Cursor

| | Drizzle | Prisma |
| --- | --- | --- |
| **Assessment** | Schema and queries in TypeScript — same language as the rest of CREXA. Large training corpus. | `schema.prisma` DSL is well-known to AI models; generated-client patterns are common in training data. |
| **Advantage** | Drizzle | TypeScript-native schema aligns with CREXA's TS-first codebase |
| **Reason** | Cursor agents work in `.ts` files; Drizzle schema lives alongside application code without context-switching to a separate DSL. | — |
| **Limitation** | AI may generate incorrect relation config without schema context. | AI may hallucinate Prisma APIs from outdated versions (especially Prisma 7 config changes). |

#### 20. Debugging clarity

| | Drizzle | Prisma |
| --- | --- | --- |
| **Assessment** | Queries map closely to SQL; errors often reference familiar PostgreSQL messages. | Prisma error messages are user-friendly but abstract away SQL; query logging available. |
| **Advantage** | Drizzle | Easier to correlate application code with database behavior |
| **Reason** | When debugging playlist ordering bugs or constraint violations, SQL-transparent errors reduce investigation time. | — |
| **Limitation** | Less friendly error wrapping for newcomers. | Prisma error codes require learning Prisma-specific semantics. |

#### 21. Testing support

| | Drizzle | Prisma |
| --- | --- | --- |
| **Assessment** | Test against real or containerized PostgreSQL; schema can be pushed or migrated in test setup. No special test client. | Same database testing patterns; Prisma supports seed scripts and test transaction rollback patterns documented. |
| **Advantage** | Tie | Both test against PostgreSQL |
| **Reason** | Neither ORM provides a fundamentally different testing model; both work with Neon branches or local Postgres for integration tests. | — |
| **Limitation** | Test DB setup is manual. | Must run `prisma generate` in CI test pipelines. |

#### 22. Long-term maintainability

| | Drizzle | Prisma |
| --- | --- | --- |
| **Assessment** | Schema in TypeScript under version control; SQL migrations are portable; no lock-in to generated client APIs. | Schema in `schema.prisma`; migrations portable; generated client creates API coupling. |
| **Advantage** | Drizzle | Schema and queries remain standard TypeScript + SQL |
| **Reason** | As CREXA grows, contributors can read schema and SQL without learning a proprietary query dialect. | — |
| **Limitation** | Schema files may become large; needs modular organization. | Major Prisma version upgrades (e.g., v6 → v7) can require config migration. |

#### 23. Vendor lock-in risk

| | Drizzle | Prisma |
| --- | --- | --- |
| **Assessment** | Open-source; queries are SQL; schema is TypeScript; can migrate away with moderate effort. | Open-source; but Prisma Client API is proprietary; leaving requires rewriting queries. |
| **Advantage** | Drizzle | Lower API lock-in |
| **Reason** | SQL migrations and TypeScript schema are portable; query builder is thin over SQL. | — |
| **Limitation** | Drizzle-specific schema helpers still require translation if switching ORMs. | Prisma schema and client are deeply coupled. |

#### 24. Community and official documentation

| | Drizzle | Prisma |
| --- | --- | --- |
| **Assessment** | Growing community; excellent docs for PostgreSQL and Neon; Neon officially documents Drizzle in quickstart guides. | Large established community; comprehensive docs; Neon and Prisma maintain official integration guides. |
| **Advantage** | Prisma | Larger ecosystem and more Stack Overflow coverage |
| **Reason** | Prisma has a longer track record and broader adoption for beginner resources. | — |
| **Limitation** | Fewer beginner-oriented tutorials than Prisma. | Prisma 7 introduces config changes that may fragment older examples. |

#### 25. Fit for a growing AI music platform

| | Drizzle | Prisma |
| --- | --- | --- |
| **Assessment** | Strong fit for evolving schema (rights, AI disclosures, versioning), high-volume events, analytics, and PostgreSQL-native features. | Strong fit for rapid CRUD feature development; advanced analytics and highly specialized PostgreSQL usage may rely more on TypedSQL, raw SQL, or custom migration SQL as the platform matures. |
| **Advantage** | Drizzle | Matches CREXA's data complexity trajectory |
| **Reason** | CREXA is not a simple CRUD app — it will accumulate event data, metadata, and compliance records that benefit from SQL control. | — |
| **Limitation** | Requires deliberate schema modularization from the start. | As analytics and database-specific needs grow, more queries may move outside the generated-client path, reducing Prisma's DX advantage without negating its PostgreSQL support. |

### CREXA-specific database needs

| Need | Drizzle approach | Prisma approach |
| --- | --- | --- |
| Many-to-many playlist ↔ track | Junction table with `pgTable` and relation definitions | Implicit or explicit many-to-many in `schema.prisma` |
| Ordered playlist entries | Composite unique on `(playlist_id, position)` or `sort_order` column with index | `sortOrder Int` field on join model; `@@unique` constraints |
| Artist follower relationships | Self-referential or junction table with indexes on both foreign keys | Relation fields with `@@unique([followerId, followingId])` |
| Track likes | Junction table with unique `(user_id, track_id)` | Join model or implicit m2m with unique constraint |
| Comment threads | `parent_id` self-reference on comments table; index on `parent_id` | Self-relation `@relation("CommentThread")` with `parentId` |
| Track versioning | Version table with `track_id` FK and `version_number`; partial unique index | Separate `TrackVersion` model; raw SQL for partial indexes |
| AI-tool disclosure metadata | JSONB column on tracks/generations table | `Json` field type; query via Prisma filters, TypedSQL, or raw SQL as needed |
| Licensing and rights records | Typed columns + JSONB for flexible license terms | Model with `Json` fields; complex queries via TypedSQL or raw SQL when needed |
| High-volume listening events | Narrow event table with time-based indexes; batch inserts; raw SQL aggregates | `ListeningEvent` model; ORM overhead and specialized aggregates may favor TypedSQL or raw SQL at scale |
| Daily/monthly analytics aggregates | Materialized views or aggregate tables via raw SQL migrations; query builder `groupBy` | `groupBy` for many aggregates; materialized views and advanced rollups via custom migration SQL |
| PostgreSQL indexes | Declared in TypeScript schema or custom SQL migrations | `@@index` in schema; partial and specialized indexes via migration SQL |
| Unique constraints | `unique()` / `uniqueIndex()` in schema | `@@unique` / `@unique` in schema |
| JSONB metadata | `jsonb()` column type with typed wrappers | `Json` type |
| Full-text search | `sql` template with `to_tsvector` / `to_tsquery`; GIN indexes in migrations | PostgreSQL FTS via Prisma capabilities, TypedSQL, or raw SQL |
| Transactions | `db.transaction()` on WebSocket driver | `$transaction` |
| Moderation audit logs | Append-only table; raw SQL for audit queries | Standard model; complex audit queries via TypedSQL or raw SQL when needed |
| Evolving data migrations | Custom SQL in Drizzle migration files | Custom SQL appended to Prisma migration files |

### Operational workflow comparison

#### Drizzle workflow (proposed)

1. Define schema in TypeScript files (e.g., `src/db/schema/`)
2. Configure `drizzle.config.ts` with `DATABASE_URL_UNPOOLED` for kit commands
3. Generate migrations: `drizzle-kit generate`
4. Review plain SQL in `drizzle/<timestamp>/migration.sql`
5. Apply migrations: `drizzle-kit migrate` (CI/production) using unpooled URL
6. Runtime: `drizzle-orm/neon-http` with pooled `DATABASE_URL`
7. No generated client step in build pipeline

**Cursor Agent inspectability:** High. Schema, queries, config, and migration SQL are all plain TypeScript and SQL files in the repository. Agents can read, diff, and review migrations without generated artifacts.

#### Prisma workflow

1. Define schema in `prisma/schema.prisma`
2. Configure `prisma.config.ts` (Prisma 7+) with direct URL for CLI
3. Generate migration: `prisma migrate dev --name <name>`
4. Review SQL in `prisma/migrations/<timestamp>_<name>/migration.sql`
5. Apply in production: `prisma migrate deploy`
6. Runtime: `@prisma/adapter-neon` with pooled `DATABASE_URL`
7. Build requires `prisma generate`; generated client must be cached or committed per team policy

**Cursor Agent inspectability:** Moderate. Schema and migration SQL are readable, but generated client code adds indirection. Agents must account for `prisma generate` output and Prisma 7 config split.

### Weighted decision matrix

| Criterion (weight) | Drizzle (1–5) | Prisma (1–5) | Drizzle weighted | Prisma weighted |
| --- | --- | --- | --- | --- |
| Neon and serverless compatibility (15%) | 5 | 4 | 0.75 | 0.60 |
| PostgreSQL control (15%) | 5 | 3.5 | 0.75 | 0.525 |
| Type safety (10%) | 4.5 | 5 | 0.45 | 0.50 |
| Migration workflow (15%) | 4.5 | 4 | 0.675 | 0.60 |
| Query flexibility and analytics (15%) | 5 | 3.5 | 0.75 | 0.525 |
| Performance and runtime overhead (10%) | 5 | 3 | 0.50 | 0.30 |
| Beginner maintainability (10%) | 3.5 | 4.5 | 0.35 | 0.45 |
| Cursor AI coding reliability (5%) | 4.5 | 4 | 0.225 | 0.20 |
| Long-term platform fit (5%) | 4.5 | 3.5 | 0.225 | 0.175 |
| **Total** | | | **4.68** | **3.88** |

These scores are architectural judgments based on CREXA's chosen weights and anticipated platform needs. They are not universal performance benchmarks and should not be read as proof that either ORM is objectively faster or better in every context.

**Score rationale (brief):**

- **Neon/serverless:** Drizzle's HTTP driver and lighter runtime edge out Prisma's WebSocket adapter and generated client overhead.
- **PostgreSQL control:** Drizzle exposes PostgreSQL features directly; Prisma supports PostgreSQL well, but advanced or specialized usage may require TypedSQL, raw SQL, or custom migration SQL with less day-to-day SQL transparency.
- **Type safety:** Both excellent; Prisma's generated client types are slightly more comprehensive for relation variants.
- **Migration workflow:** Both produce reviewable SQL; Drizzle's workflow has less tooling indirection and no generate step.
- **Query flexibility:** CREXA's analytics and event data favor Drizzle's SQL-transparent query builder.
- **Performance:** Drizzle's smaller bundle and no code-generation build step favor serverless cold starts.
- **Beginner maintainability:** Prisma's Studio, tutorials, and ergonomic API lower the learning curve.
- **Cursor AI:** Drizzle's TypeScript-native schema reduces context-switching for AI-assisted development in this repo.
- **Long-term fit:** CREXA's evolving domain (rights, AI disclosures, events, analytics) aligns with SQL-transparent tooling.

## Rationale

Drizzle ORM is the best fit for CREXA because:

1. **Neon alignment** — CREXA's existing `DATABASE_URL` / `DATABASE_URL_UNPOOLED` convention maps directly to Drizzle's documented runtime (pooled HTTP) and migration (unpooled direct) workflow.
2. **PostgreSQL-first** — The platform will rely on JSONB metadata, composite indexes, full-text search, high-volume event tables, and analytics aggregates. Drizzle keeps PostgreSQL features accessible without fighting an abstraction layer.
3. **Serverless performance** — The `neon-http` driver and absence of a generated client reduce cold-start overhead on Vercel serverless functions.
4. **Migration transparency** — `drizzle-kit generate` produces plain SQL migration files that are easy to review in pull requests and audit for safety.
5. **TypeScript cohesion** — Schema, queries, and application code share one language, matching CREXA's established TypeScript-first conventions.
6. **Cursor Agent workflow** — Schema and migration files are human- and agent-readable without generated artifact indirection.

Prisma ORM was not selected because, while it offers superior beginner ergonomics and CRUD productivity, CREXA's anticipated data model complexity (listening events, analytics, rights, AI disclosures, moderation audit trails) will benefit more from day-to-day SQL transparency than from Prisma's abstraction layer. Prisma does support PostgreSQL, Neon adapters, migrations, partial indexes, full-text search, and raw SQL, but advanced analytics and specialized PostgreSQL expressions are more likely to move outside the generated-client path as the platform matures. Prisma's generated client, build-time `prisma generate` step, and larger runtime footprint are meaningful costs for serverless deployment without sufficient offsetting benefit for this domain.

## Accepted tradeoffs

By choosing Drizzle, CREXA accepts:

- **Steeper learning curve** — Contributors need basic SQL literacy and must understand Neon driver selection (`neon-http` vs `neon-serverless`).
- **Less ergonomic nested queries** — Standard CRUD with deeply nested includes is more verbose than Prisma's `include` API.
- **Less established GUI data browsing** — Drizzle provides Drizzle Studio through Drizzle Kit, but Prisma Studio may offer a more established or beginner-friendly data-browsing experience. The accepted tradeoff is weaker GUI ergonomics for beginners, not the total absence of GUI tooling.
- **Smaller beginner tutorial ecosystem** — Fewer copy-paste resources compared to Prisma for first-time ORM developers.
- **Manual analytics SQL** — Complex reporting queries will be written and maintained as SQL, not generated by the ORM.

## Risks and mitigations

| Risk | Mitigation |
| --- | --- |
| Incorrect Neon driver choice breaks transactions | Document driver policy: `neon-http` for default queries; `neon-serverless` for transactional code paths. Enforce in `docs/postgresql-foundation.md` and code review. |
| `drizzle-kit push` used in production, bypassing migration review | Prohibit `push` in production by convention and CI policy; require `generate` + `migrate` only. |
| Schema files become unwieldy as domain grows | Organize schema into modular files (`users.ts`, `tracks.ts`, `playlists.ts`) from the first implementation task. |
| Team SQL skill gap slows development | Provide internal schema examples; use Drizzle relational queries for CRUD; reserve raw SQL for analytics and search. |
| High-volume event table performance | Design indexes and partitioning strategy in dedicated schema tasks; use raw SQL migrations for materialized views. |
| Migration conflicts in team development | Serialize migration generation; review SQL files in PRs; use Neon branches for preview environments. |

## Consequences

### Schema ownership

- Schema will live in TypeScript files under version control (e.g., `src/db/schema/`).
- `drizzle-kit` will be the sole migration generator.
- `DATABASE_URL_UNPOOLED` will be required for all migration commands.

### Queries

- Application code will import a singleton `db` instance using `drizzle-orm/neon-http`.
- Complex analytics and search will use Drizzle's `sql` tagged template.
- Transactional workflows will use the WebSocket driver where needed.

### Migrations

- SQL migration files will be committed in a `drizzle/` directory.
- Production deploys will run `drizzle-kit migrate` against the unpooled URL in CI.
- Custom SQL (indexes, materialized views, data backfills) will be added to generated migration files.

### Testing

- Integration tests will run against Neon branches or a local PostgreSQL instance.
- Schema setup in tests will use `drizzle-kit migrate` or `push` (test-only).

### Deployment

- No `prisma generate` build step.
- Vercel build must include `drizzle-orm` and `@neondatabase/serverless` as dependencies.
- Environment variables `DATABASE_URL` (pooled) and `DATABASE_URL_UNPOOLED` (direct) must be configured per environment.

### Future contributors

- Must read `docs/postgresql-foundation.md` and the Drizzle schema conventions before modifying the database layer.
- SQL literacy is expected for performance-sensitive features.

## Implementation boundary

This ADR records the accepted ORM choice but does **not** implement it. Specifically:

- **No ORM package is installed yet**
- **No database client exists**
- **No schema exists**
- **No migration has been generated or executed**
- Implementation requires a separate approved task

## Reconsideration triggers

Revisit this decision if:

1. **Team composition shifts** — If the core team remains beginner-heavy and CRUD velocity matters more than analytics SQL control, Prisma's DX advantage may outweigh Drizzle's PostgreSQL transparency.
2. **Prisma ecosystem gap closes** — If Prisma significantly improves PostgreSQL feature coverage, serverless bundle size, or analytics query ergonomics.
3. **Drizzle Neon transaction limitations block features** — If interactive transaction requirements on serverless cannot be met reliably with Drizzle's Neon drivers.
4. **Full-text search or analytics become ORM-managed** — If a future ORM or extension provides first-class, type-safe FTS and analytics without raw SQL and that becomes a critical requirement.
5. **Operational incidents trace to ORM choice** — Repeated migration failures, connection exhaustion, or type-safety bugs attributable to Drizzle that Prisma would prevent.
6. **Neon or Vercel publish an official recommended ORM change** — If platform partners shift their documented default integration path.

---

*Sources consulted: [Drizzle Neon docs](https://orm.drizzle.team/docs/connect-neon), [Drizzle migrations](https://orm.drizzle.team/docs/migrations), [Neon Drizzle quickstart](https://neon.com/docs/get-started/full-backend-quickstart), [Neon Prisma guide](https://neon.com/docs/guides/prisma), [Prisma Neon docs](https://www.prisma.io/docs/orm/overview/databases/neon), [Prisma Migrate overview](https://www.prisma.io/docs/orm/prisma-migrate).*
