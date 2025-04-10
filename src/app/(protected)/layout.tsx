import { redirect } from "next/navigation";
import { signInPath } from "@/utils/paths";
import { getAuth } from "@/features/auth/queries/get-auth";
import React from "react";

type ProtectedLayoutProps = Readonly<{ children: React.ReactNode }>;

export default async function ProtectedLayout({
  children,
}: ProtectedLayoutProps) {
  const { user } = await getAuth();

  if (!user) {
    redirect(signInPath());
  }

  return <>{children}</>;
}
