import { relations } from "drizzle-orm";

import { externalIdentities } from "./external-identities";
import { profiles } from "./profiles";
import { users } from "./users";

export const usersRelations = relations(users, ({ many, one }) => ({
  externalIdentities: many(externalIdentities),
  profile: one(profiles),
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

export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, {
    fields: [profiles.userId],
    references: [users.id],
  }),
}));
