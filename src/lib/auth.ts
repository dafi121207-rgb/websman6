import { cookies } from "next/headers";
import { verifySession, SESSION_COOKIE } from "@/lib/session-token";
import type { SessionUser } from "@/lib/types";

export { signSession, verifySession, SESSION_COOKIE } from "@/lib/session-token";

export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies();
  return verifySession(store.get(SESSION_COOKIE)?.value);
}

export async function requireRole(
  roles: Array<"ADMIN" | "GURU" | "SISWA">
): Promise<SessionUser | null> {
  const session = await getSession();
  if (!session || !roles.includes(session.role)) return null;
  return session;
}
