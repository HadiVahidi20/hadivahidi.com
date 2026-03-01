/**
 * SkipLink – renders a "Skip to main content" anchor that is visually hidden
 * until it receives keyboard focus. This allows keyboard and screen-reader
 * users to bypass repeated navigation and jump straight to the page content.
 *
 * Usage: render once, near the top of the document (e.g. in RootLayout before
 * all other children). The target element must have `id="main-content"`.
 */
export function SkipLink() {
  return (
    <a href="#main-content" className="skip-link">
      Skip to main content
    </a>
  );
}
