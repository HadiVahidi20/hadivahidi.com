"use client";

import * as React from "react";

type SkeletonVariant = "text" | "circular" | "rectangular";

interface SkeletonProps {
  variant?: SkeletonVariant;
  width?: string | number;
  height?: string | number;
  lines?: number;
  className?: string;
}

const variantClasses: Record<SkeletonVariant, string> = {
  text: "rounded",
  circular: "rounded-full",
  rectangular: "rounded-lg",
};

function SingleSkeleton({
  variant = "rectangular",
  width,
  height,
  className = "",
}: Omit<SkeletonProps, "lines">) {
  const style: React.CSSProperties = {
    width: width !== undefined ? (typeof width === "number" ? `${width}px` : width) : "100%",
    height: height !== undefined ? (typeof height === "number" ? `${height}px` : height) : undefined,
  };

  return (
    <span
      role="status"
      aria-label="Loading…"
      style={style}
      className={[
        "block animate-pulse bg-[var(--border-color)]",
        variant === "text" ? "h-4" : variant === "circular" ? "h-10 w-10" : "h-16",
        variantClasses[variant],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    />
  );
}

export function Skeleton({
  variant = "rectangular",
  width,
  height,
  lines = 1,
  className = "",
}: SkeletonProps) {
  if (variant === "text" && lines > 1) {
    return (
      <div className={["flex flex-col gap-2", className].filter(Boolean).join(" ")}>
        {Array.from({ length: lines }).map((_, i) => (
          <SingleSkeleton
            key={i}
            variant="text"
            width={i === lines - 1 && lines > 1 ? "75%" : width}
            height={height}
          />
        ))}
      </div>
    );
  }

  return (
    <SingleSkeleton
      variant={variant}
      width={width}
      height={height}
      className={className}
    />
  );
}
