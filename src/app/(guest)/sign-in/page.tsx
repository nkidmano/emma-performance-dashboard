import { CardCompact } from "@/components/card-compact";
import { SignInForm } from "@/features/auth/components/sign-in-form";

export default async function SignInPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center">
      <CardCompact
        title="Sign In"
        description="Sign in to your account"
        className="w-full w-[420px] animate-fade-from-top"
        content={<SignInForm />}
      />
    </div>
  );
}
