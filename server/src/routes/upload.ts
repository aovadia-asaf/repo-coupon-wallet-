import fs from "node:fs/promises";
import { Router } from "express";
import { detectQrInImage, extractQrImage, generateThumbnail, processUploadedFile, upload } from "../imageProcessing";

const router = Router();

router.post("/", upload.single("image"), async (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: "לא נבחר קובץ" });
    return;
  }

  try {
    const { filename, isPdfSourced } = await processUploadedFile(req.file);
    const thumbnailFilename = await generateThumbnail(filename);
    const detectedQr = await detectQrInImage(filename).catch(() => null);
    let qrImagePath: string | undefined;
    if (detectedQr) {
      const qrFilename = await extractQrImage(filename, detectedQr.region);
      qrImagePath = `/uploads/${qrFilename}`;
    }
    res.status(201).json({
      path: `/uploads/${filename}`,
      isPdfSourced,
      thumbnailPath: `/uploads/${thumbnailFilename}`,
      ...(detectedQr && { code: detectedQr.data, codeType: "qr" as const, qrImagePath }),
    });
  } catch (err) {
    await fs.unlink(req.file.path).catch(() => {});
    res.status(422).json({ error: err instanceof Error ? err.message : "עיבוד הקובץ נכשל" });
  }
});

export default router;
