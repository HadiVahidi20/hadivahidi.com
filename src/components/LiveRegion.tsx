"use client";

interface LiveRegionProps {
  /** The message to announce. Changing this value triggers an announcement. */
  message: string;
  /**
   * `"polite"` (default) – waits for the user to be idle before announcing.
   * `"assertive"` – interrupts the current speech; use only for urgent alerts.
   */
  politeness?: "polite" | "assertive";
}

/**
 * LiveRegion – an off-screen ARIA live region that announces dynamic content
 * changes to screen readers.
 *
 * Place one instance in the root layout so it is always mounted. Update the
 * `message` prop whenever you need to make an announcement (e.g. after a form
 * submission, route change, or async operation completes).
 *
 * @example
 * // In a server component or context provider:
 * <LiveRegion message={announcement} />
 */
export function LiveRegion({
  message,
  politeness = "polite",
}: LiveRegionProps) {
  return (
    <div aria-live={politeness} aria-atomic="true" className="sr-only">
      {message}
    </div>
  );
}
