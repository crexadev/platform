"use client";

import { Show, UserButton } from "@clerk/nextjs";
import Link from "next/link";

export function HomeAuthControls() {
  return (
    <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
      <Show when="signed-out">
        <Link
          href="/sign-in"
          className="inline-flex items-center justify-center rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground no-underline transition-colors hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          Sign in
        </Link>
        <Link
          href="/sign-up"
          className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground no-underline transition-colors hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          Create account
        </Link>
      </Show>
      <Show when="signed-in">
        <Link
          href="/account"
          className="text-sm font-medium text-primary no-underline hover:text-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          Account
        </Link>
        <UserButton />
      </Show>
    </div>
  );
}
