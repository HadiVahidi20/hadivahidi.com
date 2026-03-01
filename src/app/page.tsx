import Link from "next/link";

export default function Home() {
  return (
    <main id="main-content" className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-6 px-4">
        <div
          className="inline-flex items-center justify-center w-14 h-14 rounded-xl font-bold text-xl"
          style={{
            backgroundColor: "var(--accent)",
            color: "var(--accent-foreground)",
          }}
        >
          HV
        </div>
        <h1
          className="text-5xl font-bold tracking-tight"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Hadi Vahidi
        </h1>
        <p
          className="text-xl max-w-md mx-auto"
          style={{ color: "var(--text-light)" }}
        >
          Front-End Developer crafting exceptional digital experiences.
        </p>
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          Portfolio redesign in progress.
        </p>
        <div className="flex gap-4 justify-center pt-4">
          <Link
            href="/admin/login"
            className="inline-flex items-center px-6 py-3 rounded-lg font-medium transition-opacity hover:opacity-90"
            style={{
              backgroundColor: "var(--accent)",
              color: "var(--accent-foreground)",
            }}
          >
            Admin Panel
          </Link>
        </div>
      </div>
    </main>
  );
}
