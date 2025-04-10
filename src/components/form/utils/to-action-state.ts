import { ZodError } from "zod";

export type ActionState = {
  message: string;
  timestamp: number;
  fieldErrors: Record<string, string[] | undefined>;
  payload?: FormData;
  status?: "SUCCESS" | "ERROR";
};

export const INITIAL_ACTION_STATE: ActionState = {
  fieldErrors: {},
  message: "",
  timestamp: Date.now(),
};

export function toActionState(
  status: ActionState["status"],
  message: string,
  formData?: FormData,
): ActionState {
  return {
    ...INITIAL_ACTION_STATE,
    status,
    message,
    payload: formData,
    timestamp: Date.now(),
  };
}

export function fromErrorToActionState(
  error: unknown,
  formData?: FormData,
): ActionState {
  if (error instanceof ZodError) {
    return {
      status: "ERROR",
      message: error.errors[0].message,
      fieldErrors: error.flatten().fieldErrors,
      payload: formData,
      timestamp: Date.now(),
    };
  }

  if (error instanceof Error) {
    return {
      status: "ERROR",
      message: error.message,
      fieldErrors: {},
      payload: formData,
      timestamp: Date.now(),
    };
  }

  return {
    status: "ERROR",
    message: "Unknown error occurred",
    fieldErrors: {},
    payload: formData,
    timestamp: Date.now(),
  };
}
