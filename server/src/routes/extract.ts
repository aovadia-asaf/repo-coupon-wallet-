import fs from "node:fs/promises";
import path from "node:path";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { Router } from "express";
import { z } from "zod/v4";
import { CATEGORIES } from "../constants";
import { UPLOAD_DIR } from "../config";
import { generateThumbnail, generateThumbnailFromRegion, processUploadedFile, upload } from "../imageProcessing";

const router = Router();

const ExtractionSchema = z.object({
  title: z.string().describe("Short descriptive title for the coupon/voucher"),
  store: z.string().nullable().describe("Business or brand name shown on the coupon, or null if not visible"),
  category: z.enum(CATEGORIES).describe("Best matching category for this coupon"),
  value: z.string().nullable().describe("The discount/value as shown, e.g. '20%' or '50 ILS', or null"),
  expiry: z
    .string()
    .nullable()
    .describe("Expiry date in ISO 8601 format (YYYY-MM-DD) if a date is visible on the coupon, otherwise null"),
  code: z.string().nullable().describe("The redemption/voucher code or number shown on the coupon, or null"),
  codeType: z
    .enum(["barcode", "qr"])
    .nullable()
    .describe("'barcode' if a scannable barcode is visible, 'qr' if a QR code is visible, otherwise null"),
  notes: z.string().nullable().describe("Any other relevant details worth keeping, or null"),
  photoRegion: z
    .object({
      x: z.number().describe("left edge of the region, as a fraction (0-1) of the full image width"),
      y: z.number().describe("top edge of the region, as a fraction (0-1) of the full image height"),
      width: z.number().describe("width of the region, as a fraction (0-1) of the full image width"),
      height: z.number().describe("height of the region, as a fraction (0-1) of the full image height"),
    })
    .nullable()
    .describe(
      "Bounding box of the single distinct photo, product image, or logo graphic within this file, excluding " +
        "surrounding text, whitespace, or document background (e.g. a coupon PDF with a product photo in one " +
        "corner plus terms text elsewhere). Return null if the entire image is essentially just one photo with no " +
        "separate text-heavy layout around it, or if no clear distinct photo/graphic can be identified.",
    ),
});

const EXTRACTION_PROMPT = `You are looking at an image of a coupon, discount voucher, or gift card, possibly in Hebrew or English.
Extract the fields defined by the schema. If a field isn't visible or you're unsure, use null (or "other" for category).
Respond only in the language the coupon itself uses for text values (title, store, value, notes) — preserve Hebrew text as Hebrew, do not translate.`;

router.post("/", upload.single("image"), async (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: "לא נבחר קובץ" });
    return;
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    await fs.unlink(req.file.path).catch(() => {});
    res.status(503).json({ error: "זיהוי אוטומטי לא מוגדר בשרת (חסר ANTHROPIC_API_KEY)" });
    return;
  }

  try {
    const { filename, mimeType, isPdfSourced } = await processUploadedFile(req.file);
    const imageBuffer = await fs.readFile(path.join(UPLOAD_DIR, filename));

    const client = new Anthropic();
    const message = await client.messages.parse({
      model: "claude-sonnet-5",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: mimeType as "image/jpeg" | "image/png" | "image/webp", data: imageBuffer.toString("base64") },
            },
            { type: "text", text: EXTRACTION_PROMPT },
          ],
        },
      ],
      output_config: { format: zodOutputFormat(ExtractionSchema) },
    });

    if (!message.parsed_output) {
      res.status(422).json({ error: "הזיהוי האוטומטי לא הצליח לפענח את התמונה" });
      return;
    }

    const { photoRegion, ...extracted } = message.parsed_output;
    const thumbnailFilename = photoRegion
      ? await generateThumbnailFromRegion(filename, photoRegion)
      : await generateThumbnail(filename);

    res.status(201).json({
      path: `/uploads/${filename}`,
      isPdfSourced,
      thumbnailPath: `/uploads/${thumbnailFilename}`,
      extracted,
    });
  } catch (err) {
    await fs.unlink(req.file.path).catch(() => {});
    res.status(500).json({ error: err instanceof Error ? err.message : "זיהוי אוטומטי נכשל" });
  }
});

export default router;
