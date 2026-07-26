import { CATEGORY_LABELS, type Coupon, STATUS_LABELS } from "../types";

interface Props {
  coupons: Coupon[];
  onSelect: (coupon: Coupon) => void;
}

export function CouponListView({ coupons, onSelect }: Props) {
  return (
    <div className="ticket" style={{ padding: 0, overflow: "hidden" }}>
      {coupons.map((coupon, i) => {
        const thumb = coupon.thumbnailPath || coupon.imagePath;
        return (
          <button
            key={coupon.id}
            type="button"
            onClick={() => onSelect(coupon)}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
              padding: "10px 16px",
              border: "none",
              borderTop: i === 0 ? "none" : "1px solid var(--line)",
              background: "transparent",
              textAlign: "right",
              cursor: "pointer",
              opacity: coupon.redeemed ? 0.6 : 1,
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0, flex: "1 1 auto" }}>
              {thumb ? (
                <img
                  src={thumb}
                  alt=""
                  style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 6, flexShrink: 0 }}
                />
              ) : (
                <span
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 6,
                    background: "var(--paper)",
                    border: "1px solid var(--line)",
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.9rem",
                  }}
                >
                  🎟️
                </span>
              )}
              <span
                style={{
                  fontWeight: 600,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  minWidth: 0,
                }}
              >
                {coupon.title}
              </span>
            </span>
            <span style={{ display: "flex", gap: 8, alignItems: "center", fontSize: "0.8rem", color: "var(--ink-soft)", flexShrink: 0, flexWrap: "wrap", justifyContent: "flex-end" }}>
              {coupon.store && <span>{coupon.store}</span>}
              <span>{CATEGORY_LABELS[coupon.category]}</span>
              {!coupon.redeemed && (
                <span className={`status-badge status-${coupon.status}`}>{STATUS_LABELS[coupon.status]}</span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
