"use client";

import * as React from "react";

type CardVariant = "default" | "glass" | "elevated";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  className?: string;
}

interface CardSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

const variantClasses: Record<CardVariant, string> = {
  default:
    "bg-[var(--bg-alt)] border border-[var(--border-color)] rounded-2xl",
  glass:
    "bg-white/5 dark:bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg",
  elevated:
    "bg-[var(--bg-alt)] border border-[var(--border-color)] rounded-2xl shadow-xl",
};

export function Card({
  variant = "default",
  className = "",
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={[variantClasses[variant], className].filter(Boolean).join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className = "", children, ...props }: CardSectionProps) {
  return (
    <div
      className={["px-6 py-4 border-b border-[var(--border-color)]", className]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardBody({ className = "", children, ...props }: CardSectionProps) {
  return (
    <div className={["p-6", className].filter(Boolean).join(" ")} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className = "", children, ...props }: CardSectionProps) {
  return (
    <div
      className={["px-6 py-4 border-t border-[var(--border-color)]", className]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardActions({ className = "", children, ...props }: CardSectionProps) {
  return (
    <div
      className={[
        "px-6 py-4 flex items-center gap-3 border-t border-[var(--border-color)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}
