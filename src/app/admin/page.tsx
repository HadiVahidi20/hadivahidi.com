import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Link from "next/link";

export default async function AdminDashboard() {
  const session = await auth();

  if (!session) {
    redirect("/admin/login");
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p style={{ color: "var(--text-light)" }}>
              Welcome back, {session.user.firstName || session.user.name}
            </p>
          </div>
          <Link
            href="/api/auth/signout"
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{
              border: "1px solid var(--border)",
              color: "var(--text-light)",
            }}
          >
            Sign Out
          </Link>
        </div>

        <div
          className="p-6 rounded-2xl"
          style={{
            backgroundColor: "var(--bg-alt)",
            border: "1px solid var(--border)",
          }}
        >
          <h2 className="font-semibold mb-2">Sprint 1: Foundation & Security</h2>
          <p style={{ color: "var(--text-light)" }} className="text-sm">
            Admin panel is connected to the database and authentication is
            working. Full dashboard UI coming in Sprint 5.
          </p>
        </div>
      </div>
    </main>
  );
}
