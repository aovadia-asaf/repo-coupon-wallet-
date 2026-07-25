import { CATEGORY_LABELS, type Coupon, STATUS_LABELS } from "../types";

interface Props {
  coupons: Coupon[];
  onSelect: (coupon: Coupon) => void;
}

export function CouponListView({ coupons, onSelect }: Props) {
  return (
    <div className="ticket" style={{ padding: 0, overflow: "hidden" }}>
      {coupons.map((coupon, i) => (
        <button
          key={coupon.id}
          type="button"
          onClick={() => onSelect(coupon)}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
            padding: "12px 16px",
            border: "none",
            borderTop: i === 0 ? "none" : "1px solid var(--line)",
            background: "transparent",
            textAlign: "right",
            cursor: "pointer",
            opacity: coupon.redeemed ? 0.6 : 1,
          }}
        >
          <span style={{ fontWeight: 600 }}>{coupon.title}</span>
          <span style={{ display: "flex", gap: 8, alignItems: "center", fontSize: "0.8rem", color: "var(--ink-soft)" }}>
            {coupon.store && <span>{coupon.store}</span>}
            <span>{CATEGORY_LABELS[coupon.category]}</span>
            {!coupon.redeemed && (
              <span className={`status-badge status-${coupon.status}`}>{STATUS_LABELS[coupon.status]}</span>
            )}
          </span>
        </button>
      ))}
    </div>
  );
}
