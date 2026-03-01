"use client";

import * as React from "react";
import type { RegisterOptions, UseFormRegisterReturn } from "react-hook-form";

type InputType = "text" | "email" | "password" | "textarea";

interface InputProps {
  id?: string;
  name?: string;
  type?: InputType;
  label?: string;
  helperText?: string;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  /** Accept the object returned by react-hook-form's `register()` */
  registration?: UseFormRegisterReturn;
  /** Additional validation rules when using react-hook-form directly */
  rules?: RegisterOptions;
  rows?: number;
  autoComplete?: string;
  value?: string;
  defaultValue?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
}

const baseInputClasses = [
  "w-full rounded-lg text-sm transition-colors",
  "bg-[var(--bg)] text-[var(--text)]",
  "border border-[var(--border-color)]",
  "placeholder:text-[var(--muted)]",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-0",
  "disabled:opacity-50 disabled:cursor-not-allowed",
].join(" ");

const errorInputClasses = [
  "border-red-500",
  "focus-visible:ring-red-500",
].join(" ");

export function Input({
  id,
  name,
  type = "text",
  label,
  helperText,
  error,
  placeholder,
  disabled = false,
  required = false,
  className = "",
  registration,
  rows = 4,
  autoComplete,
  value,
  defaultValue,
  onChange,
  onBlur,
}: InputProps) {
  const inputId = id ?? name;
  const hasError = Boolean(error);

  const inputClasses = [
    baseInputClasses,
    hasError ? errorInputClasses : "",
    type === "textarea" ? "px-4 py-3 resize-y" : "px-4 py-2.5",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const sharedProps = {
    id: inputId,
    name,
    placeholder,
    disabled,
    required,
    autoComplete,
    "aria-invalid": hasError ? ("true" as const) : ("false" as const),
    "aria-describedby": hasError
      ? `${inputId}-error`
      : helperText
        ? `${inputId}-helper`
        : undefined,
    className: inputClasses,
    ...registration,
    ...(value !== undefined && { value }),
    ...(defaultValue !== undefined && { defaultValue }),
    ...(onChange && { onChange }),
    ...(onBlur && { onBlur }),
  };

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-[var(--text)]"
        >
          {label}
          {required && (
            <span className="ml-1 text-red-500" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      {type === "textarea" ? (
        <textarea rows={rows} {...(sharedProps as React.TextareaHTMLAttributes<HTMLTextAreaElement>)} />
      ) : (
        <input type={type} {...(sharedProps as React.InputHTMLAttributes<HTMLInputElement>)} />
      )}

      {helperText && !hasError && (
        <p
          id={`${inputId}-helper`}
          className="text-xs text-[var(--muted)]"
        >
          {helperText}
        </p>
      )}

      {hasError && (
        <p
          id={`${inputId}-error`}
          role="alert"
          className="text-xs text-red-500"
        >
          {error}
        </p>
      )}
    </div>
  );
}
