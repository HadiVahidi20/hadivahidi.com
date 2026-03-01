/**
 * Scroll utility helpers for in-page navigation with offset support.
 */

interface ScrollToSectionOptions {
  /**
   * Fixed offset (in px) to subtract from the target position.
   * Useful to account for a sticky header.
   * Defaults to 0.
   */
  offset?: number;
  /**
   * Scroll behaviour passed to `window.scrollTo`.
   * Defaults to "smooth".
   */
  behavior?: ScrollBehavior;
}

/**
 * Smoothly scrolls to a section by element ID, with an optional offset to
 * account for sticky headers or other fixed elements.
 *
 * @param id      - The `id` attribute of the target element (without `#`)
 * @param options - Optional offset and scroll behavior
 * @returns `true` if the element was found and scrolled to, `false` otherwise
 */
export function scrollToSection(
  id: string,
  options: ScrollToSectionOptions = {},
): boolean {
  const { offset = 0, behavior = "smooth" } = options;

  const el = document.getElementById(id);
  if (!el) return false;

  const top =
    el.getBoundingClientRect().top + window.scrollY - offset;

  window.scrollTo({ top, behavior });
  return true;
}

/**
 * Calculates the offset required to compensate for a sticky header.
 * Looks for the first `<header>` element and returns its height, or falls
 * back to the supplied default.
 *
 * @param fallback - Fallback offset in px (default: 0)
 */
export function getStickyHeaderOffset(fallback = 0): number {
  if (typeof document === "undefined") return fallback;
  const header = document.querySelector("header");
  return header ? header.getBoundingClientRect().height : fallback;
}

/**
 * Handles a click event on an in-page anchor (`<a href="#section-id">`),
 * preventing the default jump and using smooth scroll with offset instead.
 *
 * @param event   - The mouse/keyboard event from the anchor element
 * @param options - Optional offset and scroll behavior
 */
export function handleAnchorClick(
  event: React.MouseEvent<HTMLAnchorElement>,
  options: ScrollToSectionOptions = {},
): void {
  const href = event.currentTarget.getAttribute("href");
  if (!href?.startsWith("#")) return;

  const id = href.slice(1);
  if (!id) return;

  event.preventDefault();
  scrollToSection(id, {
    offset: options.offset ?? getStickyHeaderOffset(),
    behavior: options.behavior,
  });
}
