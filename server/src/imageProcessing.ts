import fs from "node:fs/promises";
import path from "node:path";
import multer from "multer";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";
import { UPLOAD_DIR } from "./config";

export const ALLOWED_MIME = new Set(["image/png", "image/jpeg", "image/webp", "application/pdf"]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
    cb(null, `${uuidv4()}${ext}`);
  },
});

export const upload = multer({
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

export async function convertPdfFirstPage(pdfPath: string): Promise<string> {
  const { pdf } = await import("pdf-to-img");
  const document = await pdf(pdfPath, { scale: 4 });
  let firstPage: Buffer | null = null;
  for await (const page of document) {
    firstPage = page;
    break;
  }
  await document.destroy();
  if (!firstPage) throw new Error("לא ניתן להמיר את קובץ ה-PDF");

  // Many PDF coupons/tickets are a small printed strip on an otherwise blank page;
  // trimming the surrounding whitespace keeps the actual content legible at Claude's
  // vision input size instead of being crushed down alongside empty margins.
  const trimmed = await sharp(firstPage).trim().toBuffer();

  const pngFilename = `${uuidv4()}.png`;
  const pngPath = path.join(UPLOAD_DIR, pngFilename);
  await fs.writeFile(pngPath, trimmed);
  await fs.unlink(pdfPath);
  return pngFilename;
}

/** Saves an uploaded file, converting PDF to PNG (first page) if needed. */
export async function processUploadedFile(
  file: Express.Multer.File,
): Promise<{ filename: string; mimeType: string; isPdfSourced: boolean }> {
  if (file.mimetype === "application/pdf") {
    const pngFilename = await convertPdfFirstPage(file.path);
    return { filename: pngFilename, mimeType: "image/png", isPdfSourced: true };
  }
  return { filename: file.filename, mimeType: file.mimetype, isPdfSourced: false };
}

/** Smart-crops the given image to a square-ish thumbnail, focusing on the most visually interesting region. */
export async function generateThumbnail(sourceFilename: string): Promise<string> {
  const thumbFilename = `${uuidv4()}-thumb.jpg`;
  await sharp(path.join(UPLOAD_DIR, sourceFilename))
    .resize(480, 480, { fit: "cover", position: sharp.strategy.attention })
    .jpeg({ quality: 85 })
    .toFile(path.join(UPLOAD_DIR, thumbFilename));
  return thumbFilename;
}

export interface FractionalRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Crops the given image to a specific region (fractions 0-1 of the source dimensions), then fits it to a square thumbnail. */
export async function generateThumbnailFromRegion(
  sourceFilename: string,
  region: FractionalRegion,
): Promise<string> {
  const sourcePath = path.join(UPLOAD_DIR, sourceFilename);
  const metadata = await sharp(sourcePath).metadata();
  const imgWidth = metadata.width ?? 0;
  const imgHeight = metadata.height ?? 0;

  const left = Math.max(0, Math.min(imgWidth - 1, Math.round(region.x * imgWidth)));
  const top = Math.max(0, Math.min(imgHeight - 1, Math.round(region.y * imgHeight)));
  const width = Math.max(1, Math.min(imgWidth - left, Math.round(region.width * imgWidth)));
  const height = Math.max(1, Math.min(imgHeight - top, Math.round(region.height * imgHeight)));

  if (width < 20 || height < 20) {
    return generateThumbnail(sourceFilename);
  }

  const thumbFilename = `${uuidv4()}-thumb.jpg`;
  await sharp(sourcePath)
    .extract({ left, top, width, height })
    .resize(480, 480, { fit: "cover" })
    .jpeg({ quality: 85 })
    .toFile(path.join(UPLOAD_DIR, thumbFilename));
  return thumbFilename;
}
