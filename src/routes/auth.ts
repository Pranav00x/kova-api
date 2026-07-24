import { Router } from "express";
import { z } from "zod";
import { requestOtp, verifyOtp } from "../lib/otp.js";
import { findOrCreateUser } from "../lib/users.js";
import { signAccessToken, signRefreshToken } from "../lib/jwt.js";
import { asyncHandler } from "../lib/asyncHandler.js";

export const authRouter = Router();

const identifierSchema = z.object({
  identifier: z.string().min(3),
});

const verifySchema = identifierSchema.extend({
  code: z.string().length(6),
});

authRouter.post("/otp/request", asyncHandler(async (req, res) => {
  const parsed = identifierSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid_identifier" });
    return;
  }

  await requestOtp(parsed.data.identifier);
  res.json({ status: "sent" });
}));

authRouter.post("/otp/verify", asyncHandler(async (req, res) => {
  const parsed = verifySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid_payload" });
    return;
  }

  const { identifier, code } = parsed.data;
  const ok = await verifyOtp(identifier, code);
  if (!ok) {
    res.status(401).json({ error: "invalid_or_expired_code" });
    return;
  }

  const user = await findOrCreateUser(identifier);
  const accessToken = await signAccessToken({ userId: user.id });
  const refreshToken = await signRefreshToken({ userId: user.id });

  res.cookie("kova_session", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 24 * 60 * 60 * 1000,
  });

  res.json({ accessToken, refreshToken, user: { id: user.id, kycStatus: user.kyc_status } });
}));
