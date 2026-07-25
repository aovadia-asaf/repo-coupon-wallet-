import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db/client";

const router = Router();

const CATEGORIES = [
  "food",
  "fashion",
  "electronics",
  "beauty",
  "entertainment",
  "travel",
  "other",
] as const;

const couponInputSchema = z.object({
  title: z.string().min(1, "כותרת חובה"),
  store: z.string().optional().nullable(),
  category: z.enum(CATEGORIES).default("other"),
  value: z.string().optional().nullable(),
  expiry: z.string().datetime().optional().nullable().or(z.literal("").transform(() => null)),
  code: z.string().optional().nullable(),
  codeType: z.enum(["barcode", "qr"]).optional().nullable(),
  notes: z.string().optional().nullable(),
  imagePath: z.string().optional().nullable(),
  imageIsPdfSourced: z.boolean().optional().default(false),
});

function expiryStatus(expiry: Date | null): "valid" | "soon" | "expired" {
  if (!expiry) return "valid";
  const now = new Date();
  const msPerDay = 24 * 60 * 60 * 1000;
  const daysLeft = Math.ceil((expiry.getTime() - now.getTime()) / msPerDay);
  if (daysLeft < 0) return "expired";
  if (daysLeft <= 7) return "soon";
  return "valid";
}

function serialize(coupon: Awaited<ReturnType<typeof prisma.coupon.findFirstOrThrow>>) {
  return { ...coupon, status: expiryStatus(coupon.expiry) };
}

router.get("/", async (req, res) => {
  const { store, category, status, q, view } = req.query as Record<string, string | undefined>;

  const where: Record<string, unknown> = {};
  if (store) where.store = { contains: store };
  if (category) where.category = category;
  if (q) {
    where.OR = [
      { title: { contains: q } },
      { store: { contains: q } },
      { notes: { contains: q } },
    ];
  }
  where.redeemed = view === "redeemed";

  const coupons = await prisma.coupon.findMany({ where, orderBy: { createdAt: "desc" } });
  let result = coupons.map(serialize);

  if (view !== "redeemed" && (status === "valid" || status === "soon" || status === "expired")) {
    result = result.filter((c) => c.status === status);
  }

  res.json(result);
});

const EXPORT_COLUMNS = [
  "title",
  "store",
  "category",
  "value",
  "expiry",
  "code",
  "codeType",
  "notes",
  "redeemed",
  "redeemedAt",
  "createdAt",
  "imagePath",
  "imageIsPdfSourced",
  "status",
] as const;

function csvEscape(value: unknown): string {
  const s =
    value === null || value === undefined
      ? ""
      : value instanceof Date
        ? value.toISOString()
        : String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

router.get("/export", async (req, res) => {
  const format = req.query.format === "csv" ? "csv" : "json";
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
  const result = coupons.map(serialize);
  const dateStamp = new Date().toISOString().slice(0, 10);

  if (format === "csv") {
    const rows = result.map((c) =>
      EXPORT_COLUMNS.map((col) => csvEscape((c as Record<string, unknown>)[col])).join(","),
    );
    const csv = [EXPORT_COLUMNS.join(","), ...rows].join("\n");
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="coupons-${dateStamp}.csv"`);
    res.send(`﻿${csv}`);
    return;
  }

  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="coupons-${dateStamp}.json"`);
  res.send(JSON.stringify(result, null, 2));
});

router.get("/:id", async (req, res) => {
  const coupon = await prisma.coupon.findUnique({ where: { id: req.params.id } });
  if (!coupon) {
    res.status(404).json({ error: "שובר לא נמצא" });
    return;
  }
  res.json(serialize(coupon));
});

router.post("/", async (req, res) => {
  const parsed = couponInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "קלט לא תקין" });
    return;
  }
  const data = parsed.data;
  const coupon = await prisma.coupon.create({
    data: {
      title: data.title,
      store: data.store ?? null,
      category: data.category,
      value: data.value ?? null,
      expiry: data.expiry ? new Date(data.expiry) : null,
      code: data.code ?? null,
      codeType: data.codeType ?? null,
      notes: data.notes ?? null,
      imagePath: data.imagePath ?? null,
      imageIsPdfSourced: data.imageIsPdfSourced ?? false,
    },
  });
  res.status(201).json(serialize(coupon));
});

router.put("/:id", async (req, res) => {
  const parsed = couponInputSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "קלט לא תקין" });
    return;
  }
  const data = parsed.data;
  try {
    const coupon = await prisma.coupon.update({
      where: { id: req.params.id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.store !== undefined && { store: data.store }),
        ...(data.category !== undefined && { category: data.category }),
        ...(data.value !== undefined && { value: data.value }),
        ...(data.expiry !== undefined && { expiry: data.expiry ? new Date(data.expiry) : null }),
        ...(data.code !== undefined && { code: data.code }),
        ...(data.codeType !== undefined && { codeType: data.codeType }),
        ...(data.notes !== undefined && { notes: data.notes }),
        ...(data.imagePath !== undefined && { imagePath: data.imagePath }),
        ...(data.imageIsPdfSourced !== undefined && { imageIsPdfSourced: data.imageIsPdfSourced }),
      },
    });
    res.json(serialize(coupon));
  } catch {
    res.status(404).json({ error: "שובר לא נמצא" });
  }
});

router.patch("/:id/redeem", async (req, res) => {
  const redeemed = Boolean(req.body?.redeemed);
  try {
    const coupon = await prisma.coupon.update({
      where: { id: req.params.id },
      data: { redeemed, redeemedAt: redeemed ? new Date() : null },
    });
    res.json(serialize(coupon));
  } catch {
    res.status(404).json({ error: "שובר לא נמצא" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await prisma.coupon.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch {
    res.status(404).json({ error: "שובר לא נמצא" });
  }
});

export default router;
