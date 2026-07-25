import fs from "node:fs/promises";
import { Router } from "express";
import { processUploadedFile, upload } from "../imageProcessing";

const router = Router();

router.post("/", upload.single("image"), async (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: "לא נבחר קובץ" });
    return;
  }

  try {
    const { filename, isPdfSourced } = await processUploadedFile(req.file);
    res.status(201).json({ path: `/uploads/${filename}`, isPdfSourced });
  } catch (err) {
    await fs.unlink(req.file.path).catch(() => {});
    res.status(422).json({ error: err instanceof Error ? err.message : "עיבוד הקובץ נכשל" });
  }
});

export default router;
