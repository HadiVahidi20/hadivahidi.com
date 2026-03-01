export default function Loading() {
  return (
    <main id="main-content" className="min-h-screen flex items-center justify-center">
      <div
        className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
        style={{ borderColor: "var(--border-color)", borderTopColor: "var(--accent)" }}
        role="status"
        aria-label="Loading"
      />
    </main>
  );
}
