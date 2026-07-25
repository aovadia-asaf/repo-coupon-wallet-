import type { Coupon } from "../types";

interface Props {
  coupons: Coupon[];
}

export function SummaryBanner({ coupons }: Props) {
  const active = coupons.filter((c) => !c.redeemed);
  const valid = active.filter((c) => c.status === "valid").length;
  const soon = active.filter((c) => c.status === "soon").length;
  const expired = active.filter((c) => c.status === "expired").length;

  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        flexWrap: "wrap",
        marginBottom: 20,
      }}
    >
      <SummaryStat label="בתוקף" value={valid} className="status-valid" />
      <SummaryStat label="נגמר בקרוב" value={soon} className="status-soon" />
      <SummaryStat label="פג תוקף" value={expired} className="status-expired" />
    </div>
  );
}

function SummaryStat({ label, value, className }: { label: string; value: number; className: string }) {
  return (
    <div className={`status-badge ${className}`} style={{ fontSize: "0.95rem", padding: "8px 16px" }}>
      <strong>{value}</strong> {label}
    </div>
  );
}
