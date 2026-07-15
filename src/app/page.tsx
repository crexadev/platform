import { HomeAuthControls } from "@/components/home-auth-controls";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16 sm:px-8">
      <div className="w-full max-w-lg rounded-lg border border-border bg-surface p-8 text-center sm:p-10">
        <p className="text-sm font-medium uppercase tracking-widest text-primary">
          Foundation
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          CREXA
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          The platform for AI-generated music.
        </p>
        <p className="mt-8 text-sm text-muted-foreground">
          CREXA is currently in development.
        </p>
        <HomeAuthControls />
        <a
          href="https://github.com/crexadev/platform"
          className="mt-6 inline-flex items-center justify-center rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground no-underline transition-colors hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          rel="noopener noreferrer"
          target="_blank"
        >
          View repository
        </a>
      </div>
    </main>
  );
}
