import { pgEnum, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

export const userStatusEnum = pgEnum("user_status", [
  "active",
  "suspended",
  "deleted",
]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  status: userStatusEnum("status").notNull().default("active"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type CrexaUser = InferSelectModel<typeof users>;
export type NewCrexaUser = InferInsertModel<typeof users>;
