import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { sql } from "drizzle-orm";
import {
  check,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

import { users } from "./users";

export const profiles = pgTable(
  "profiles",
  {
    userId: uuid("user_id")
      .primaryKey()
      .references(() => users.id, { onDelete: "cascade" }),
    username: text("username").notNull(),
    displayName: text("display_name").notNull(),
    bio: text("bio"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    unique("profiles_username_unique").on(table.username),
    check(
      "profiles_username_format_check",
      sql`${table.username} ~ '^[a-z0-9_]{3,30}$'`,
    ),
    check(
      "profiles_display_name_length_check",
      sql`char_length(${table.displayName}) BETWEEN 1 AND 50`,
    ),
    check(
      "profiles_bio_length_check",
      sql`${table.bio} IS NULL OR char_length(${table.bio}) <= 160`,
    ),
  ],
);

export type Profile = InferSelectModel<typeof profiles>;
export type NewProfile = InferInsertModel<typeof profiles>;
