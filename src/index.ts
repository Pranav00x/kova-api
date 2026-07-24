import express from "express";
import cookieParser from "cookie-parser";
import { authRouter } from "./routes/auth.js";
import { meRouter } from "./routes/me.js";

const app = express();
app.use(express.json());
app.use(cookieParser());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "kova-api" });
});

app.use("/auth", authRouter);
app.use("/me", meRouter);

const port = process.env.PORT ?? 4000;
app.listen(port, () => {
  console.log(`kova-api listening on port ${port}`);
});
