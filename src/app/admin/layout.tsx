import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import AdminShell from "./AdminShell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Allow login page without auth — it handles its own state
  // For all other admin routes, redirect to login
  const isLoginPage =
    typeof window === "undefined" ? false : window.location.pathname === "/admin/login";

  if (!session && !isLoginPage) {
    // We can't check pathname server-side in layout easily,
    // so individual pages handle their own auth check.
    // Layout just provides the shell when authenticated.
  }

  // If not authenticated, render children directly (login page)
  if (!session) {
    return <>{children}</>;
  }

  return (
    <AdminShell
      user={{
        name: `${session.user.firstName || ""} ${session.user.lastName || ""}`.trim() || session.user.name,
        email: session.user.email,
        role: session.user.role,
      }}
    >
      {children}
    </AdminShell>
  );
}
