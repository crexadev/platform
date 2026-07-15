import { relations } from "drizzle-orm";

import { externalIdentities } from "./external-identities";
import { users } from "./users";

export const usersRelations = relations(users, ({ many }) => ({
  externalIdentities: many(externalIdentities),
}));

export const externalIdentitiesRelations = relations(
  externalIdentities,
  ({ one }) => ({
    user: one(users, {
      fields: [externalIdentities.userId],
      references: [users.id],
    }),
  }),
);
