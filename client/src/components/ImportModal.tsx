import { type ChangeEvent, useState } from "react";
import { api } from "../api/client";
import type { CouponInput } from "../types";

interface Props {
  onCancel: () => void;
  onExtracted: (prefill: Partial<CouponInput>) => void;
}

export function ImportModal({ onCancel, onExtracted }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileSelect(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setLoading(true);
    setError(null);
    try {
      const { path, isPdfSourced, thumbnailPath, extracted } = await api.extractCoupon(file);
      onExtracted({ ...extracted, imagePath: path, imageIsPdfSourced: isPdfSourced, thumbnailPath });
    } catch (err) {
      setError(err instanceof Error ? err.message : "הזיהוי האוטומטי נכשל");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-box" style={{ maxWidth: 400, textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
        <h2 style={{ marginBottom: 8 }}>ייבוא אוטומטי</h2>
        <p style={{ color: "var(--ink-soft)", marginBottom: 16, fontSize: "0.9rem" }}>
          העלו תמונה או PDF של שובר, ו-AI ימלא את הפרטים אוטומטית. תוכלו לבדוק ולערוך לפני השמירה.
        </p>

        {loading ? (
          <p style={{ padding: "20px 0" }}>מזהה פרטי שובר...</p>
        ) : (
          <input type="file" accept="image/*,application/pdf" onChange={handleFileSelect} />
        )}

        {error && <p style={{ color: "var(--expired)", marginTop: 12 }}>{error}</p>}

        <div style={{ display: "flex", justifyContent: "center", marginTop: 20 }}>
          <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={loading}>
            ביטול
          </button>
        </div>
      </div>
    </div>
  );
}
