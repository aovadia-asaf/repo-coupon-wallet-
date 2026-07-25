import JsBarcode from "jsbarcode";
import QRCode from "qrcode";
import { useEffect, useRef } from "react";
import { CATEGORY_LABELS, type Coupon } from "../types";

interface Props {
  coupon: Coupon;
  onClose: () => void;
}

export function PresentView({ coupon, onClose }: Props) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!coupon.code) return;
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
            {coupon.codeType === "qr" ? (
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

        <button type="button" className="btn btn-secondary" onClick={onClose} style={{ marginTop: 16 }}>
          סגירה
        </button>
      </div>
    </div>
  );
}
