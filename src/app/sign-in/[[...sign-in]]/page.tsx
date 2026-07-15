import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <h1 className="sr-only">Sign in to CREXA</h1>
        <SignIn />
      </div>
    </main>
  );
}
