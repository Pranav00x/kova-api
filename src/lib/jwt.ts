import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? "change-me");

export interface SessionClaims {
  userId: string;
  [key: string]: unknown;
}

export async function signAccessToken(claims: SessionClaims): Promise<string> {
  return new SignJWT(claims)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(secret);
}

export async function signRefreshToken(claims: SessionClaims): Promise<string> {
  return new SignJWT(claims)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);
}

export async function verifyToken(token: string): Promise<SessionClaims> {
  const { payload } = await jwtVerify(token, secret);
  return payload as SessionClaims;
}
