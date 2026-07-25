import fs from "node:fs/promises";
import path from "node:path";
import { Router } from "express";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import { UPLOAD_DIR } from "../config";

const router = Router();

const ALLOWED_MIME = new Set(["image/png", "image/jpeg", "image/webp", "application/pdf"]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
    cb(null, `${uuidv4()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME.has(file.mimetype)) {
      cb(new Error("סוג קובץ לא נתמך"));
      return;
    }
    cb(null, true);
  },
});

async function convertPdfFirstPage(pdfPath: string): Promise<string> {
  const { pdf } = await import("pdf-to-img");
  const document = await pdf(pdfPath, { scale: 2 });
  let firstPage: Buffer | null = null;
  for await (const page of document) {
    firstPage = page;
    break;
  }
  await document.destroy();
  if (!firstPage) throw new Error("לא ניתן להמיר את קובץ ה-PDF");

  const pngFilename = `${uuidv4()}.png`;
  const pngPath = path.join(UPLOAD_DIR, pngFilename);
  await fs.writeFile(pngPath, firstPage);
  await fs.unlink(pdfPath);
  return pngFilename;
}

router.post("/", upload.single("image"), async (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: "לא נבחר קובץ" });
    return;
  }

  if (req.file.mimetype === "application/pdf") {
    try {
      const pngFilename = await convertPdfFirstPage(req.file.path);
      res.status(201).json({ path: `/uploads/${pngFilename}`, isPdfSourced: true });
    } catch (err) {
      await fs.unlink(req.file.path).catch(() => {});
      res.status(422).json({ error: err instanceof Error ? err.message : "המרת PDF נכשלה" });
    }
    return;
  }

  res.status(201).json({ path: `/uploads/${req.file.filename}`, isPdfSourced: false });
});

export default router;
