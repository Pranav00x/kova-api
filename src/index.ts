import express from "express";

const app = express();
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "kova-api" });
});

const port = process.env.PORT ?? 4000;
app.listen(port, () => {
  console.log(`kova-api listening on port ${port}`);
});
