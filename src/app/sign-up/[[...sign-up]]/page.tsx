import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <h1 className="sr-only">Create your CREXA account</h1>
        <SignUp />
      </div>
    </main>
  );
}
