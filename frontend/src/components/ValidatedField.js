import React from "react";
import { Controller } from "react-hook-form";
import FormField from "./FormField";

export default function ValidatedField({
  name,
  control,
  label,
  htmlFor,
  className,
  render,
}) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <FormField
          label={label}
          htmlFor={htmlFor}
          error={fieldState.error?.message}
          className={className}
        >
          {render(field, fieldState)}
        </FormField>
      )}
    />
  );
}

export function fieldClassName(fieldState, className = "") {
  return fieldState.invalid ? `${className} p-invalid`.trim() : className;
}
