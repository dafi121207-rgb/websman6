import { SignJWT, jwtVerify } from "jose";
import type { SessionUser } from "@/lib/types";

export const SESSION_COOKIE = "sman6garut_session";

// Module aman untuk Edge (middleware) & Node runtime — tanpa next/headers.
const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "fallback-secret-change-me"
);

export async function signSession(user: SessionUser): Promise<string> {
  return new SignJWT({
    id: user.id,
    identifier: user.identifier,
    name: user.name,
    role: user.role,
    kelas: user.kelas ?? null,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET);
}

export async function verifySession(token?: string): Promise<SessionUser | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, SECRET);
    if (!payload.id || !payload.role) return null;
    return {
      id: payload.id as string,
      identifier: payload.identifier as string,
      name: payload.name as string,
      role: payload.role as "ADMIN" | "GURU" | "SISWA",
      kelas: (payload.kelas as string) ?? null,
    };
  } catch {
    return null;
  }
}
