import type { ElementType, ReactNode } from "react";

interface VisuallyHiddenProps {
  /** Content to expose only to assistive technologies. */
  children: ReactNode;
  /**
   * HTML element to render. Defaults to `span` so it can be used inline.
   * Use `"p"` or another block element when wrapping block-level content.
   */
  as?: ElementType;
}

/**
 * VisuallyHidden – renders its children in a way that is invisible on screen
 * but fully accessible to screen readers.
 *
 * Prefer this over `aria-label` when the text is more than a few words, or
 * when you want the label to be translatable by browser translation tools.
 */
export function VisuallyHidden({
  children,
  as: Component = "span",
}: VisuallyHiddenProps) {
  return <Component className="sr-only">{children}</Component>;
}
