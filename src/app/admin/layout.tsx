import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Allow login page without auth
  // Layout wraps all /admin/* routes
  // The login page handles its own unauthenticated state

  return <>{children}</>;
}
