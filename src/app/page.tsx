import { getAuth } from "@/features/auth/queries/get-auth";
import { signInPath } from "@/utils/paths";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const user = await getAuth();

  if (!user) {
    redirect(signInPath());
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-4xl font-bold">Home</h1>
      <p className="text-lg">Welcome to the Emma Performance Dashboard</p>
    </div>
  );
}
