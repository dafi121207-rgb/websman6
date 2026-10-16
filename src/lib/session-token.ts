import { SignJWT, jwtVerify } from "jose";
import type { SessionUser } from "@/lib/types";

export const SESSION_COOKIE = "sman6garut_session";

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET wajib disetel dan minimal 32 karakter.");
  }
  return new TextEncoder().encode(secret);
}

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
    .sign(getSecret());
}

export async function verifySession(token?: string): Promise<SessionUser | null> {
  if (!token) return null;
  const secret = getSecret();
  try {
    const { payload } = await jwtVerify(token, secret);
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
