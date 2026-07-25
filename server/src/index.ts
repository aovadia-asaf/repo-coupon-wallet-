import fs from "node:fs";
import path from "node:path";
import cookieParser from "cookie-parser";
import cors from "cors";
import "dotenv/config";
import express from "express";
import { UPLOAD_DIR } from "./config";
import { requireAuth } from "./middleware/auth";
import authRouter from "./routes/auth";
import couponsRouter from "./routes/coupons";
import uploadRouter from "./routes/upload";

const app = express();
const PORT = process.env.PORT ?? 3001;
const isProduction = process.env.NODE_ENV === "production";

fs.mkdirSync(UPLOAD_DIR, { recursive: true });

app.set("trust proxy", 1);

if (!isProduction) {
  app.use(
    cors({
      origin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173",
      credentials: true,
    }),
  );
}
app.use(express.json());
app.use(cookieParser(process.env.SESSION_SECRET));

app.use("/api/auth", authRouter);
app.use("/uploads", requireAuth, express.static(UPLOAD_DIR));
app.use("/api/coupons", requireAuth, couponsRouter);
app.use("/api/upload", requireAuth, uploadRouter);

if (isProduction) {
  const clientDist = path.join(__dirname, "..", "..", "client", "dist");
  app.use(express.static(clientDist));
  app.get(/^(?!\/api|\/uploads).*/, (_req, res) => {
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
