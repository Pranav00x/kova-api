import { Router } from "express";
import { z } from "zod";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";
import { computeSmartAccountAddress } from "../lib/wallet.js";
import { createWallet, getWalletForUser } from "../lib/wallets.js";
import { asyncHandler } from "../lib/asyncHandler.js";

export const walletRouter = Router();

const createWalletSchema = z.object({
  ownerAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
});

walletRouter.get(
  "/",
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const wallet = await getWalletForUser(req.userId!);
    if (!wallet) {
      res.status(404).json({ error: "no_wallet" });
      return;
    }
    res.json({ wallet });
  })
);

walletRouter.post(
  "/",
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const parsed = createWalletSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "invalid_owner_address" });
      return;
    }

    const existing = await getWalletForUser(req.userId!);
    if (existing) {
      res.json({ wallet: existing });
      return;
    }

    const smartAccountAddress = await computeSmartAccountAddress(parsed.data.ownerAddress as `0x${string}`);
    const wallet = await createWallet(req.userId!, smartAccountAddress);
    res.status(201).json({ wallet });
  })
);
