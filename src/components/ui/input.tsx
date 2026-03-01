"use client";

import * as React from "react";

type InputType = "text" | "email" | "password" | "search" | "url" | "tel";

interface BaseInputProps {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  className?: string;
}

export interface InputProps
  extends BaseInputProps,
    Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  type?: InputType;
}

export interface TextareaProps
  extends BaseInputProps,
    React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const inputBaseClasses = [
  "w-full rounded-lg text-sm transition-colors",
  "bg-[var(--bg)] text-[var(--text)]",
  "border border-[var(--border-color)]",
  "placeholder:text-[var(--muted)]",
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-1",
  "disabled:cursor-not-allowed disabled:opacity-50",
].join(" ");

const inputErrorClasses = "border-red-500 focus-visible:ring-red-500";

function FieldWrapper({
  id,
  label,
  helperText,
  errorMessage,
  children,
}: {
  id: string;
  label?: string;
  helperText?: string;
  errorMessage?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-[var(--text)]">
          {label}
        </label>
      )}
      {children}
      {errorMessage && (
        <p
          id={`${id}-error`}
          className="text-xs text-red-500"
          role="alert"
          aria-live="polite"
        >
          {errorMessage}
        </p>
      )}
      {!errorMessage && helperText && (
        <p id={`${id}-helper`} className="text-xs text-[var(--text-light)]">
          {helperText}
        </p>
      )}
    </div>
  );
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  function Input(
    {
      type = "text",
      label,
      helperText,
      errorMessage,
      className = "",
      id: idProp,
      ...props
    },
    ref,
  ) {
    const generatedId = React.useId();
    const id = idProp ?? generatedId;
    const hasError = Boolean(errorMessage);

    return (
      <FieldWrapper
        id={id}
        label={label}
        helperText={helperText}
        errorMessage={errorMessage}
      >
        <input
          ref={ref}
          id={id}
          type={type}
          aria-invalid={hasError}
          aria-describedby={
            errorMessage
              ? `${id}-error`
              : helperText
                ? `${id}-helper`
                : undefined
          }
          className={`${inputBaseClasses} px-4 py-2.5 ${hasError ? inputErrorClasses : ""} ${className}`}
          {...props}
        />
      </FieldWrapper>
    );
  },
);

Input.displayName = "Input";

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
    {
      label,
      helperText,
      errorMessage,
      className = "",
      id: idProp,
      rows = 4,
      ...props
    },
    ref,
  ) {
    const generatedId = React.useId();
    const id = idProp ?? generatedId;
    const hasError = Boolean(errorMessage);

    return (
      <FieldWrapper
        id={id}
        label={label}
        helperText={helperText}
        errorMessage={errorMessage}
      >
        <textarea
          ref={ref}
          id={id}
          rows={rows}
          aria-invalid={hasError}
          aria-describedby={
            errorMessage
              ? `${id}-error`
              : helperText
                ? `${id}-helper`
                : undefined
          }
          className={`${inputBaseClasses} px-4 py-2.5 resize-y ${hasError ? inputErrorClasses : ""} ${className}`}
          {...props}
        />
      </FieldWrapper>
    );
  },
);

Textarea.displayName = "Textarea";
