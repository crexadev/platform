import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function AccountPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16 sm:px-8">
      <div className="w-full max-w-lg rounded-lg border border-border bg-surface p-8 text-center sm:p-10">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Your CREXA account
        </h1>
        <p className="mt-4 text-muted-foreground">Authentication is active.</p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground no-underline transition-colors hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          Back to homepage
        </Link>
      </div>
    </main>
  );
}
