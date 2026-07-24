import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { db } from "../lib/db.js";

export const usersRouter = Router();

/** Looks up another Kova user's smart account address by phone/email, for P2P sends. */
usersRouter.get(
  "/lookup",
  requireAuth,
  asyncHandler(async (req, res) => {
    const identifier = req.query.identifier;
    if (typeof identifier !== "string" || identifier.length < 3) {
      res.status(400).json({ error: "invalid_identifier" });
      return;
    }

    const result = await db.query(
      `SELECT u.id, w.smart_account_address
       FROM users u
       JOIN wallets w ON w.user_id = u.id
       WHERE u.identifier = $1`,
      [identifier]
    );

    const user = result.rows[0];
    if (!user) {
      res.status(404).json({ error: "user_not_found" });
      return;
    }

    res.json({ userId: user.id, smartAccountAddress: user.smart_account_address });
  })
);
