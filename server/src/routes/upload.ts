import path from "node:path";
import { Router } from "express";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import { UPLOAD_DIR } from "../config";

const router = Router();

const ALLOWED_MIME = new Set(["image/png", "image/jpeg", "image/webp"]);

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

router.post("/", upload.single("image"), (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: "לא נבחר קובץ" });
    return;
  }
  res.status(201).json({ path: `/uploads/${req.file.filename}` });
});

export default router;
