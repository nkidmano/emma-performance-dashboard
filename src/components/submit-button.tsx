"use client";

import { LucideLoaderCircle } from "lucide-react";
import React, { cloneElement, JSX } from "react";
import { useFormStatus } from "react-dom";
import { Button, ButtonProps } from "@/components/ui/button";

type SubmitButtonProps = {
  label?: string;
  icon?: JSX.Element;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
};

const SubmitButton = ({
  label,
  icon,
  variant = "default",
  size = "default",
}: SubmitButtonProps) => {
  const { pending } = useFormStatus();

  return (
    <Button disabled={pending} type="submit" variant={variant} size={size}>
      {pending ? (
        <LucideLoaderCircle className="h-4 w-4 animate-spin" />
      ) : icon ? (
        <>
          {cloneElement(icon, {
            className: "w-4 h-4",
          })}
        </>
      ) : null}
      {label}
    </Button>
  );
};

export { SubmitButton };
