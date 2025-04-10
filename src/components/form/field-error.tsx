import { ActionState } from "@/components/form/utils/to-action-state";

type FieldErrorProps = {
  actionState: Awaited<ActionState>;
  name: string;
};
export function FieldError({ actionState, name }: FieldErrorProps) {
  const message = actionState.fieldErrors[name]?.[0];

  if (!message) {
    return null;
  }

  return <span className="text-xs text-red-500">{message}</span>;
}
