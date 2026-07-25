import { CATEGORY_LABELS, type Coupon, STATUS_LABELS } from "../types";

interface Props {
  coupon: Coupon;
  onEdit: () => void;
  onDelete: () => void;
  onToggleRedeemed: () => void;
}

function formatDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("he-IL");
}

export function CouponCard({ coupon, onEdit, onDelete, onToggleRedeemed }: Props) {
  return (
    <div className="ticket" style={{ opacity: coupon.redeemed ? 0.6 : 1 }}>
      {coupon.imagePath && (
        <img
          src={coupon.imagePath}
          alt={coupon.title}
          style={{ width: "100%", height: 140, objectFit: "cover", borderRadius: 8 }}
        />
      )}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <h3 style={{ fontSize: "1.1rem" }}>{coupon.title}</h3>
        <span className={`status-badge status-${coupon.status}`}>{STATUS_LABELS[coupon.status]}</span>
      </div>
      {coupon.store && <p style={{ margin: 0, color: "var(--ink-soft)" }}>{coupon.store}</p>}
      <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--ink-soft)" }}>
        {CATEGORY_LABELS[coupon.category]}
        {coupon.value ? ` · ${coupon.value}` : ""}
      </p>
      {coupon.expiry && (
        <p style={{ margin: 0, fontSize: "0.85rem" }}>בתוקף עד {formatDate(coupon.expiry)}</p>
      )}
      {coupon.code && (
        <div className="ticket-tear">
          <p className="mono" style={{ margin: "8px 0 0", fontSize: "0.95rem", letterSpacing: 1 }}>
            {coupon.code}
          </p>
        </div>
      )}
      {coupon.notes && <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--ink-soft)" }}>{coupon.notes}</p>}
      {coupon.redeemed && (
        <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--ink-soft)" }}>
          מומש {coupon.redeemedAt ? `ב-${formatDate(coupon.redeemedAt)}` : ""}
        </p>
      )}
      <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
        <button className="btn btn-secondary" onClick={onEdit}>
          עריכה
        </button>
        <button className="btn btn-ghost" onClick={onToggleRedeemed}>
          {coupon.redeemed ? "סמן כפעיל" : "סמן כממומש"}
        </button>
        <button className="btn btn-danger" onClick={onDelete} style={{ marginRight: "auto" }}>
          מחיקה
        </button>
      </div>
    </div>
  );
}
