"use client";

import { useActionState } from "react";
import { FieldError } from "@/components/form/field-error";
import { Form } from "@/components/form/form";
import { INITIAL_ACTION_STATE } from "@/components/form/utils/to-action-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "@/features/auth/actions/sign-in";
import { SubmitButton } from "@/components/submit-button";
import { redirect } from "next/navigation";
import { performancePath } from "@/utils/paths";

export function SignInForm() {
  const [actionState, action] = useActionState(signIn, INITIAL_ACTION_STATE);

  return (
    <Form
      action={action}
      actionState={actionState}
      onSuccess={() => redirect(performancePath())}
    >
      <Label htmlFor="username">Username</Label>
      <Input
        id="username"
        name="username"
        type="username"
        defaultValue={(actionState.payload?.get("username") as string) ?? ""}
      />
      <FieldError actionState={actionState} name="username" />

      <Label htmlFor="password">Password</Label>
      <Input
        id="password"
        name="password"
        type="password"
        defaultValue={(actionState.payload?.get("password") as string) ?? ""}
      />
      <FieldError actionState={actionState} name="password" />

      <SubmitButton label="Sign In" />
    </Form>
  );
}
