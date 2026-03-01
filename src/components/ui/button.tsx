"use client";

import * as React from "react";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  asChild?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--accent)] text-white hover:opacity-90 focus-visible:ring-[var(--accent)]",
  secondary:
    "bg-[var(--bg-alt)] text-[var(--text)] border border-[var(--border-color)] hover:bg-[var(--border-color)] focus-visible:ring-[var(--accent)]",
  outline:
    "bg-transparent text-[var(--accent)] border border-[var(--accent)] hover:bg-[var(--accent)] hover:text-white focus-visible:ring-[var(--accent)]",
  ghost:
    "bg-transparent text-[var(--text)] hover:bg-[var(--bg-alt)] focus-visible:ring-[var(--accent)]",
  danger:
    "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-12 px-6 text-base gap-2",
};

function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={`animate-spin ${className ?? ""}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = "primary",
      size = "md",
      loading = false,
      asChild = false,
      disabled,
      className = "",
      children,
      ...props
    },
    ref,
  ) {
    const isDisabled = disabled || loading;

    const baseClasses = [
      "inline-flex items-center justify-center font-medium rounded-lg",
      "transition-colors duration-150",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
      "disabled:pointer-events-none disabled:opacity-50",
      variantStyles[variant],
      sizeStyles[size],
      className,
    ]
      .filter(Boolean)
      .join(" ");

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(
        children as React.ReactElement<React.HTMLAttributes<HTMLElement>>,
        {
          className: [
            (children as React.ReactElement<{ className?: string }>).props
              .className,
            baseClasses,
          ]
            .filter(Boolean)
            .join(" "),
          ...props,
        },
      );
    }

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={baseClasses}
        aria-disabled={isDisabled}
        {...props}
      >
        {loading && (
          <Spinner
            className={
              size === "sm" ? "w-3 h-3" : size === "lg" ? "w-5 h-5" : "w-4 h-4"
            }
          />
        )}
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
