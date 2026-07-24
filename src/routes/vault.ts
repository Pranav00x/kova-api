import { Router } from "express";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";
import { getVaultStats, getUserVaultShares } from "../lib/vaultContract.js";
import { getWalletForUser } from "../lib/wallets.js";
import { asyncHandler } from "../lib/asyncHandler.js";

export const vaultRouter = Router();

vaultRouter.get(
  "/stats",
  asyncHandler(async (_req, res) => {
    const stats = await getVaultStats();
    res.json(stats);
  })
);

vaultRouter.get(
  "/my-shares",
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const wallet = await getWalletForUser(req.userId!);
    if (!wallet) {
      res.status(404).json({ error: "no_wallet" });
      return;
    }

    const shares = await getUserVaultShares(wallet.smart_account_address as `0x${string}`);
    res.json({ shares });
  })
);
