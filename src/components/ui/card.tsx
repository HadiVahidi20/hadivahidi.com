import * as React from "react";

export type CardVariant = "default" | "glass" | "elevated";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
}

const variantStyles: Record<CardVariant, string> = {
  default:
    "bg-[var(--bg-alt)] border border-[var(--border-color)]",
  glass:
    "bg-[rgba(var(--bg-rgb),0.6)] backdrop-blur-md border border-[rgba(var(--border-color),0.5)] supports-[backdrop-filter]:bg-[rgba(var(--bg-rgb),0.4)]",
  elevated:
    "bg-[var(--bg-alt)] shadow-lg border border-[var(--border-color)]",
};

export function Card({
  variant = "default",
  className = "",
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={`rounded-2xl ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`px-6 pt-6 pb-4 border-b border-[var(--border-color)] ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardContent({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`p-6 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`px-6 pb-6 pt-4 border-t border-[var(--border-color)] ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardActions({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`px-6 pb-6 pt-4 flex items-center gap-3 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
