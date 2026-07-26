import { type ChangeEvent, type FormEvent, useState } from "react";
import { api } from "../api/client";
import { CATEGORY_LABELS, type Category, type CodeType, type Coupon, type CouponInput } from "../types";
import { CropTool } from "./CropTool";

interface Props {
  initial?: Coupon;
  prefill?: Partial<CouponInput>;
  onSaved: () => void;
  onCancel: () => void;
}

type ImageTarget = "main" | "thumbnail";

function toDateInputValue(iso: string | null | undefined): string {
  if (!iso) return "";
  return iso.slice(0, 10);
}

export function CouponForm({ initial, prefill, onSaved, onCancel }: Props) {
  const source = initial ?? prefill;
  const [title, setTitle] = useState(source?.title ?? "");
  const [store, setStore] = useState(source?.store ?? "");
  const [category, setCategory] = useState<Category>(source?.category ?? "other");
  const [value, setValue] = useState(source?.value ?? "");
  const [expiry, setExpiry] = useState(toDateInputValue(source?.expiry ?? null));
  const [code, setCode] = useState(source?.code ?? "");
  const [codeType, setCodeType] = useState<CodeType | "">(source?.codeType ?? "");
  const [notes, setNotes] = useState(source?.notes ?? "");
  const [imagePath, setImagePath] = useState(source?.imagePath ?? "");
  const [imageIsPdfSourced, setImageIsPdfSourced] = useState(source?.imageIsPdfSourced ?? false);
  const [thumbnailPath, setThumbnailPath] = useState(source?.thumbnailPath ?? "");

  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [cropTarget, setCropTarget] = useState<ImageTarget | null>(null);
  const [uploading, setUploading] = useState<ImageTarget | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileSelect(e: ChangeEvent<HTMLInputElement>, target: ImageTarget) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (target === "main" && file.type === "application/pdf") {
      setUploading(target);
      setError(null);
      try {
        const { path, isPdfSourced } = await api.uploadImage(file, file.name);
        setImagePath(path);
        setImageIsPdfSourced(isPdfSourced);
      } catch (err) {
        setError(err instanceof Error ? err.message : "העלאה נכשלה");
      } finally {
        setUploading(null);
      }
      return;
    }

    setCropTarget(target);
    const reader = new FileReader();
    reader.onload = () => setCropSrc(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleCropConfirm(blob: Blob) {
    const target = cropTarget ?? "main";
    setUploading(target);
    setError(null);
    try {
      const { path, isPdfSourced } = await api.uploadImage(blob, "coupon.jpg");
      if (target === "thumbnail") {
        setThumbnailPath(path);
      } else {
        setImagePath(path);
        setImageIsPdfSourced(isPdfSourced);
      }
      setCropSrc(null);
      setCropTarget(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "העלאה נכשלה");
    } finally {
      setUploading(null);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("כותרת חובה");
      return;
    }
    setSaving(true);
    setError(null);
    const payload: CouponInput = {
      title: title.trim(),
      store: store.trim() || null,
      category,
      value: value.trim() || null,
      expiry: expiry ? new Date(expiry).toISOString() : null,
      code: code.trim() || null,
      codeType: codeType || null,
      notes: notes.trim() || null,
      imagePath: imagePath || null,
      imageIsPdfSourced,
      thumbnailPath: thumbnailPath || null,
    };
    try {
      if (initial) {
        await api.updateCoupon(initial.id, payload);
      } else {
        await api.createCoupon(payload);
      }
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "שמירה נכשלה");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h2 style={{ marginBottom: 16 }}>{initial ? "עריכת שובר" : "שובר חדש"}</h2>

        {cropSrc ? (
          <CropTool
            src={cropSrc}
            onCancel={() => {
              setCropSrc(null);
              setCropTarget(null);
            }}
            onConfirm={handleCropConfirm}
          />
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="title">כותרת *</label>
              <input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div className="field">
              <label htmlFor="store">חנות</label>
              <input id="store" value={store} onChange={(e) => setStore(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="category">קטגוריה</label>
              <select id="category" value={category} onChange={(e) => setCategory(e.target.value as Category)}>
                {Object.entries(CATEGORY_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="value">שווי</label>
              <input id="value" value={value} onChange={(e) => setValue(e.target.value)} placeholder="לדוגמה: 50 ש״ח / 20%" />
            </div>
            <div className="field">
              <label htmlFor="expiry">תוקף עד</label>
              <input id="expiry" type="date" value={expiry} onChange={(e) => setExpiry(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="code">קוד שובר</label>
              <input id="code" className="mono" value={code} onChange={(e) => setCode(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="codeType">סוג קוד</label>
              <select id="codeType" value={codeType} onChange={(e) => setCodeType(e.target.value as CodeType | "")}>
                <option value="">ללא</option>
                <option value="barcode">ברקוד</option>
                <option value="qr">QR</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="notes">הערות</label>
              <textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
            </div>
            <div className="field">
              <label>קובץ השובר (תמונה או PDF)</label>
              {imagePath ? (
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <img src={imagePath} alt="תצוגה מקדימה" style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8 }} />
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => {
                      setImagePath("");
                      setImageIsPdfSourced(false);
                    }}
                  >
                    הסרה
                  </button>
                </div>
              ) : (
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => handleFileSelect(e, "main")}
                  disabled={uploading !== null}
                />
              )}
              {uploading === "main" && <p style={{ fontSize: "0.85rem", color: "var(--ink-soft)" }}>מעלה קובץ...</p>}
            </div>
            <div className="field">
              <label>תמונה לתצוגה (לא חובה)</label>
              <p style={{ fontSize: "0.8rem", color: "var(--ink-soft)", margin: "0 0 6px" }}>
                תמונה קטנה שתוצג בכרטיס וברשימה — אם לא תעלו, תוצג תמונת קובץ השובר.
              </p>
              {thumbnailPath ? (
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <img src={thumbnailPath} alt="תמונת תצוגה" style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8 }} />
                  <button type="button" className="btn btn-ghost" onClick={() => setThumbnailPath("")}>
                    הסרה
                  </button>
                </div>
              ) : (
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileSelect(e, "thumbnail")}
                  disabled={uploading !== null}
                />
              )}
              {uploading === "thumbnail" && <p style={{ fontSize: "0.85rem", color: "var(--ink-soft)" }}>מעלה תמונה...</p>}
            </div>

            {error && <p style={{ color: "var(--expired)", marginBottom: 12 }}>{error}</p>}

            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
              <button type="button" className="btn btn-secondary" onClick={onCancel}>
                ביטול
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving || uploading !== null}>
                {saving ? "שומר..." : "שמירה"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
