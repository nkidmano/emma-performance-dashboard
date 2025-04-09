"use server";

import { redirect } from "next/navigation";
import { getAuth } from "../queries/get-auth";
import { deleteSessionCookie } from "../utils/session-cookie";
import { signInPath } from "@/utils/paths";
import { invalidateSession } from "@/lib/auth";

export const signOut = async () => {
  const { session } = await getAuth();

  if (!session) {
    redirect(signInPath());
  }

  await invalidateSession(session.id);
  await deleteSessionCookie();

  redirect(signInPath());
};
