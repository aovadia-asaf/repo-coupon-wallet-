import type { NextFunction, Request, Response } from "express";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (req.signedCookies?.auth === "1") {
    next();
    return;
  }
  res.status(401).json({ error: "לא מחובר" });
}
