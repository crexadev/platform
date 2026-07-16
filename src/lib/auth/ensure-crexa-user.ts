import "server-only";

import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { externalIdentities, users, type CrexaUser } from "@/db/schema";

const CLERK_PROVIDER = "clerk";
const IDENTITY_CONSTRAINT =
  "external_identities_provider_provider_user_id_unique";

type CrexaUserErrorCode =
  | "UNAUTHENTICATED"
  | "ACCOUNT_SUSPENDED"
  | "ACCOUNT_DELETED"
  | "PROVISIONING_FAILED";

export class CrexaUserProvisioningError extends Error {
  constructor(readonly code: CrexaUserErrorCode) {
    super(code);
    this.name = "CrexaUserProvisioningError";
  }
}

function isIdentityConflict(error: unknown): boolean {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  const databaseError = error as {
    code?: unknown;
    constraint?: unknown;
    cause?: unknown;
  };

  if (
    databaseError.code === "23505" &&
    databaseError.constraint === IDENTITY_CONSTRAINT
  ) {
    return true;
  }

  return isIdentityConflict(databaseError.cause);
}

function assertAccessible(user: CrexaUser): CrexaUser {
  if (user.status === "suspended") {
    throw new CrexaUserProvisioningError("ACCOUNT_SUSPENDED");
  }

  if (user.status === "deleted") {
    throw new CrexaUserProvisioningError("ACCOUNT_DELETED");
  }

  return user;
}

async function findCrexaUser(providerUserId: string) {
  const [user] = await db
    .select({
      id: users.id,
      status: users.status,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(externalIdentities)
    .innerJoin(users, eq(externalIdentities.userId, users.id))
    .where(
      and(
        eq(externalIdentities.provider, CLERK_PROVIDER),
        eq(externalIdentities.providerUserId, providerUserId),
      ),
    )
    .limit(1);

  return user;
}

export async function ensureCrexaUser(): Promise<CrexaUser> {
  const { userId: providerUserId } = await auth();

  if (!providerUserId) {
    throw new CrexaUserProvisioningError("UNAUTHENTICATED");
  }

  const existingUser = await findCrexaUser(providerUserId);
  if (existingUser) {
    return assertAccessible(existingUser);
  }

  const userId = crypto.randomUUID();

  try {
    await db.batch([
      db.insert(users).values({ id: userId }),
      db.insert(externalIdentities).values({
        userId,
        provider: CLERK_PROVIDER,
        providerUserId,
      }),
    ]);
  } catch (error) {
    if (!isIdentityConflict(error)) {
      throw new CrexaUserProvisioningError("PROVISIONING_FAILED");
    }
  }

  const resolvedUser = await findCrexaUser(providerUserId);
  if (!resolvedUser) {
    throw new CrexaUserProvisioningError("PROVISIONING_FAILED");
  }

  return assertAccessible(resolvedUser);
}
