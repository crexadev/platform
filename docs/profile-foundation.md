# Public Profile Foundation

CREXA profiles provide product-owned public identity without depending on Clerk profile data.

## Purpose

- Each CREXA user may have one public profile.
- Product relationships continue to use internal CREXA UUIDs.
- Clerk profile information is never copied automatically.

## Table

`profiles` is a one-to-one extension of `users`. Its `user_id` is both the primary key and a foreign key to `users.id` with `ON DELETE CASCADE`.

| Field | Purpose |
| --- | --- |
| `userId` | Internal CREXA UUID for the profile owner |
| `username` | Unique lowercase public identifier |
| `displayName` | Public display name with preserved capitalization and spacing |
| `bio` | Optional plain-text biography |
| `createdAt` | Profile creation timestamp |
| `updatedAt` | Application-maintained update timestamp |

## Username rules

- Lowercase only
- 3–30 characters
- Letters, numbers, and underscores only
- Database-enforced uniqueness

Reserved names such as `admin`, `api`, `account`, `settings`, `sign-in`, `sign-up`, `support`, `help`, `crexa`, and `www` are an application-validation concern for the later profile-creation task. They are intentionally not embedded in an evolving database check constraint.

## Media boundary

Avatar and banner columns are intentionally absent. CREXA has not selected a storage provider; initial profile UI should use a generated initials placeholder until storage is approved. Clerk image URLs are not copied into CREXA.

## Current boundary

- Migration `0001_profile_foundation` is applied in the development database.
- No profile record exists.
- No profile form or public profile route exists.
- No creator or artist profile exists.
