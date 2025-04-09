import { redirect } from "next/navigation";
import { performancePath } from "@/utils/paths";
import { getAuth } from "@/features/auth/queries/get-auth";
import React from "react";

type GuestLayoutProps = Readonly<{ children: React.ReactNode }>;

export default async function GuestLayout({ children }: GuestLayoutProps) {
  const { user } = await getAuth();

  if (user) {
    redirect(performancePath());
  }

  return <div suppressHydrationWarning>{children}</div>;
}
