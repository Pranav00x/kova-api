import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../lib/asyncHandler.js";
import { recordTransaction } from "../lib/transactions.js";

export const webhooksRouter = Router();

const reapTransactionSchema = z.object({
  userId: z.string().uuid(),
  // Smallest-unit USDC amount (6 decimals), matching how amounts are represented
  // everywhere else in this codebase (see kova-contracts KovaVault, kova-app formatUsdc).
  amountUsdc: z.number().int().positive(),
  merchantName: z.string().min(1),
  mccCode: z.string().min(3),
});

/**
 * Ingests Reap card transaction webhooks. TODO: verify Reap's webhook signature
 * (HMAC header per their docs) before trusting the payload — not yet wired
 * because we don't have Reap sandbox credentials to test against.
 */
webhooksRouter.post(
  "/reap/transaction",
  asyncHandler(async (req, res) => {
    const parsed = reapTransactionSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "invalid_payload" });
      return;
    }

    const { userId, amountUsdc, merchantName, mccCode } = parsed.data;
    const transaction = await recordTransaction(userId, amountUsdc, merchantName, mccCode);
    res.status(201).json({ transaction });
  })
);
