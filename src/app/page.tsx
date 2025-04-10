import { getAuth } from "@/features/auth/queries/get-auth";
import { performancePath, signInPath } from "@/utils/paths";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const { user } = await getAuth();

  if (user) {
    redirect(performancePath());
  } else {
    redirect(signInPath());
  }
}
