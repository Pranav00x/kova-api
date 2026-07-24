import express, { type NextFunction, type Request, type Response } from "express";
import cookieParser from "cookie-parser";
import { authRouter } from "./routes/auth.js";
import { meRouter } from "./routes/me.js";
import { walletRouter } from "./routes/wallet.js";
import { vaultRouter } from "./routes/vault.js";
import { kycRouter } from "./routes/kyc.js";
import { usersRouter } from "./routes/users.js";

const app = express();
app.use(express.json());
app.use(cookieParser());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "kova-api" });
});

app.use("/auth", authRouter);
app.use("/me", meRouter);
app.use("/wallet", walletRouter);
app.use("/vault", vaultRouter);
app.use("/kyc", kycRouter);
app.use("/users", usersRouter);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "internal_error" });
});

const port = process.env.PORT ?? 4000;
app.listen(port, () => {
  console.log(`kova-api listening on port ${port}`);
});
