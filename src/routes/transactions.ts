import { Router } from "express";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { getMonthlyAnalytics, listTransactions } from "../lib/transactions.js";

export const transactionsRouter = Router();

transactionsRouter.get(
  "/",
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const transactions = await listTransactions(req.userId!);
    res.json({ transactions });
  })
);

transactionsRouter.get(
  "/analytics/monthly",
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const breakdown = await getMonthlyAnalytics(req.userId!);
    res.json({ breakdown });
  })
);
