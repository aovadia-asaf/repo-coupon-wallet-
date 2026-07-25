import fs from "node:fs/promises";
import path from "node:path";
import multer from "multer";
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

/** Saves an uploaded file (converting PDF to PNG if needed) and returns the final filename + mimetype. */
export async function processUploadedFile(
  file: Express.Multer.File,
): Promise<{ filename: string; mimeType: string; isPdfSourced: boolean }> {
  if (file.mimetype === "application/pdf") {
    const pngFilename = await convertPdfFirstPage(file.path);
    return { filename: pngFilename, mimeType: "image/png", isPdfSourced: true };
  }
  return { filename: file.filename, mimeType: file.mimetype, isPdfSourced: false };
}
