"use client";

import * as React from "react";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonBaseProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  asChild?: boolean;
  className?: string;
}

type ButtonProps = ButtonBaseProps &
  React.ButtonHTMLAttributes<HTMLButtonElement>;

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--accent)] text-white hover:opacity-90 focus-visible:ring-[var(--accent)]",
  secondary:
    "bg-[var(--bg-alt)] text-[var(--text)] hover:opacity-80 focus-visible:ring-[var(--accent)]",
  outline:
    "border border-[var(--border-color)] text-[var(--text)] hover:bg-[var(--bg-alt)] focus-visible:ring-[var(--accent)]",
  ghost:
    "text-[var(--text)] hover:bg-[var(--bg-alt)] focus-visible:ring-[var(--accent)]",
  danger:
    "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm rounded-md gap-1.5",
  md: "px-4 py-2.5 text-sm rounded-lg gap-2",
  lg: "px-6 py-3 text-base rounded-xl gap-2",
};

const Spinner = () => (
  <svg
    className="animate-spin h-4 w-4 shrink-0"
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

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = "primary",
      size = "md",
      loading = false,
      disabled = false,
      asChild = false,
      className = "",
      children,
      ...props
    },
    ref,
  ) {
    const isDisabled = disabled || loading;

    const baseClasses = [
      "inline-flex items-center justify-center font-medium transition-all duration-150",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
      "disabled:pointer-events-none disabled:opacity-50",
      variantClasses[variant],
      sizeClasses[size],
      className,
    ]
      .filter(Boolean)
      .join(" ");

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(
        children as React.ReactElement<React.HTMLAttributes<HTMLElement>>,
        {
          className: [
            (children as React.ReactElement<React.HTMLAttributes<HTMLElement>>)
              .props.className,
            baseClasses,
          ]
            .filter(Boolean)
            .join(" "),
        },
      );
    }

    return (
      <button ref={ref} disabled={isDisabled} className={baseClasses} {...props}>
        {loading && <Spinner />}
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
