"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main id="main-content" className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1
          className="text-6xl font-bold mb-4"
          style={{ color: "var(--accent)", fontFamily: "var(--font-display)" }}
        >
          Oops
        </h1>
        <h2 className="text-2xl font-semibold mb-3">Something went wrong</h2>
        <p className="mb-8" style={{ color: "var(--text-light)" }}>
          An unexpected error occurred. Please try again.
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-medium transition-all hover:scale-105"
          style={{ backgroundColor: "var(--accent)" }}
        >
          Try Again
        </button>
      </div>
    </main>
  );
}
