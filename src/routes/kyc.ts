import { Router } from "express";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { db } from "../lib/db.js";

export const kycRouter = Router();

/**
 * Marks KYC as submitted. Reap performs the actual identity verification during
 * card onboarding (see Master Brief 4.3) — this just tracks Kova's own view of
 * status so the app can gate card/vault features until Reap confirms approval.
 */
kycRouter.post(
  "/submit",
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const result = await db.query(
      "UPDATE users SET kyc_status = 'submitted' WHERE id = $1 AND kyc_status = 'pending' RETURNING id, kyc_status",
      [req.userId]
    );

    if (!result.rows[0]) {
      res.status(409).json({ error: "already_submitted_or_not_found" });
      return;
    }

    res.json({ user: result.rows[0] });
  })
);
