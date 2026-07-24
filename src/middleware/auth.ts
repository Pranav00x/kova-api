import type { NextFunction, Request, Response } from "express";
import { verifyToken } from "../lib/jwt.js";

export interface AuthedRequest extends Request {
  userId?: string;
}

export async function requireAuth(req: AuthedRequest, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : req.cookies?.kova_session;

  if (!token) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }

  try {
    const claims = await verifyToken(token);
    req.userId = claims.userId;
    next();
  } catch {
    res.status(401).json({ error: "invalid_session" });
  }
}
