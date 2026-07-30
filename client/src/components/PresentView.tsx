import JsBarcode from "jsbarcode";
import QRCode from "qrcode";
import { useEffect, useRef } from "react";
import { CATEGORY_LABELS, type Coupon } from "../types";
import { wazeUrl } from "../utils/waze";

interface Props {
  coupon: Coupon;
  onClose: () => void;
}

export function PresentView({ coupon, onClose }: Props) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!coupon.code) return;
    // Prefer the actual QR graphic cropped from the source image — a regenerated QR is only ever
    // a best-effort fallback (e.g. a manually-typed code with no source image to crop from).
    if (coupon.qrImagePath) return;
    if (coupon.codeType === "qr") {
      if (canvasRef.current) {
        QRCode.toCanvas(canvasRef.current, coupon.code, { width: 240, margin: 1 }).catch(() => {});
      }
    } else if (svgRef.current) {
      try {
        JsBarcode(svgRef.current, coupon.code, {
          format: "CODE128",
          displayValue: true,
          width: 2,
          height: 90,
          margin: 8,
        });
      } catch {
        /* invalid code for barcode encoding */
      }
    }
  }, [coupon.code, coupon.codeType]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: 420, textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
        <h2 style={{ marginBottom: 4 }}>{coupon.title}</h2>
        <p style={{ margin: "0 0 16px", color: "var(--ink-soft)" }}>
          {coupon.store}
          {coupon.store && " · "}
          {CATEGORY_LABELS[coupon.category]}
          {coupon.value ? ` · ${coupon.value}` : ""}
        </p>

        {coupon.imagePath && (
          <img
            src={coupon.imagePath}
            alt={coupon.title}
            style={{ width: "100%", maxHeight: 260, objectFit: "contain", borderRadius: 8, marginBottom: 16 }}
          />
        )}

        {coupon.code && (
          <div style={{ background: "#fff", borderRadius: 8, padding: 16, display: "flex", justifyContent: "center" }}>
            {coupon.qrImagePath ? (
              <img src={coupon.qrImagePath} alt="קוד QR" style={{ maxWidth: 240, width: "100%" }} />
            ) : coupon.codeType === "qr" ? (
              <canvas ref={canvasRef} />
            ) : (
              <svg ref={svgRef} />
            )}
          </div>
        )}

        {coupon.expiry && (
          <p style={{ marginTop: 16, fontSize: "0.9rem" }}>
            בתוקף עד {new Date(coupon.expiry).toLocaleDateString("he-IL")}
          </p>
        )}

        {coupon.location && (
          <p style={{ marginTop: 8, fontSize: "0.9rem", display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
            <span style={{ color: "var(--ink-soft)" }}>📍 {coupon.location}</span>
            <a href={wazeUrl(coupon.location)} target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)" }}>
              נווט ב-Waze
            </a>
          </p>
        )}

        {coupon.websiteUrl && (
          <p style={{ marginTop: 8, fontSize: "0.9rem" }}>
            <a href={coupon.websiteUrl} target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)" }}>
              🔗 לאתר הכרטיסים
            </a>
          </p>
        )}

        <button type="button" className="btn btn-secondary" onClick={onClose} style={{ marginTop: 16 }}>
          סגירה
        </button>
      </div>
    </div>
  );
}
