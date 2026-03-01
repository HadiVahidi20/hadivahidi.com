import { auth } from "@/lib/auth";
import { errorResponse } from "@/lib/api-utils";

export async function requireAdmin() {
  const session = await auth();
  if (!session) {
    return { error: errorResponse("Unauthorized", 401), session: null };
  }
  return { error: null, session };
}
