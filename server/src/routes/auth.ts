import { timingSafeEqual } from "node:crypto";
import { Router } from "express";
import { z } from "zod";

const router = Router();

const loginSchema = z.object({ pin: z.string().min(1) });

function safeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

router.post("/login", (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "נא להזין קוד PIN" });
    return;
  }

  const familyPin = process.env.FAMILY_PIN ?? "";
  if (!familyPin || !safeCompare(parsed.data.pin, familyPin)) {
    res.status(401).json({ error: "קוד שגוי" });
    return;
  }

  res.cookie("auth", "1", {
    httpOnly: true,
    signed: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
  res.json({ authenticated: true });
});

router.post("/logout", (req, res) => {
  res.clearCookie("auth");
  res.json({ authenticated: false });
});

router.get("/me", (req, res) => {
  res.json({ authenticated: req.signedCookies?.auth === "1" });
});

export default router;
