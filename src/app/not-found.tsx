import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main-content" className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1
          className="text-8xl font-bold mb-4"
          style={{ color: "var(--accent)", fontFamily: "var(--font-display)" }}
        >
          404
        </h1>
        <h2 className="text-2xl font-semibold mb-3">Page Not Found</h2>
        <p className="mb-8" style={{ color: "var(--text-light)" }}>
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-medium transition-all hover:scale-105"
          style={{ backgroundColor: "var(--accent)" }}
        >
          &larr; Back to Home
        </Link>
      </div>
    </main>
  );
}
