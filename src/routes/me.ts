import { Router } from "express";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";
import { db } from "../lib/db.js";
import { asyncHandler } from "../lib/asyncHandler.js";

export const meRouter = Router();

meRouter.get(
  "/",
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const result = await db.query("SELECT id, identifier, kyc_status, created_at FROM users WHERE id = $1", [
      req.userId,
    ]);
    const user = result.rows[0];
    if (!user) {
      res.status(404).json({ error: "not_found" });
      return;
    }
    res.json({ user });
  })
);
