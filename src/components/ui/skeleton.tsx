import * as React from "react";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
  rounded?: "sm" | "md" | "lg" | "full";
}

const roundedStyles = {
  sm: "rounded",
  md: "rounded-lg",
  lg: "rounded-2xl",
  full: "rounded-full",
};

export function Skeleton({
  width,
  height,
  rounded = "md",
  className = "",
  style,
  ...props
}: SkeletonProps) {
  return (
    <div
      role="status"
      aria-label="Loading…"
      className={`animate-pulse bg-[var(--border-color)] ${roundedStyles[rounded]} ${className}`}
      style={{ width, height, ...style }}
      {...props}
    />
  );
}

export function SkeletonText({
  lines = 3,
  className = "",
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={`space-y-2 ${className}`} role="status" aria-label="Loading…">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height={16}
          className={i === lines - 1 ? "w-3/4" : "w-full"}
          rounded="sm"
        />
      ))}
    </div>
  );
}
