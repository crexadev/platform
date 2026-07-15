import {
  index,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

import { users } from "./users";

export const externalIdentities = pgTable(
  "external_identities",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    provider: text("provider").notNull(),
    providerUserId: text("provider_user_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    unique("external_identities_provider_provider_user_id_unique").on(
      table.provider,
      table.providerUserId,
    ),
    unique("external_identities_user_id_provider_unique").on(
      table.userId,
      table.provider,
    ),
    index("external_identities_user_id_idx").on(table.userId),
  ],
);

export type ExternalIdentity = InferSelectModel<typeof externalIdentities>;
export type NewExternalIdentity = InferInsertModel<typeof externalIdentities>;
