import type { Coupon, ExpiryStatus } from "../types";

interface Props {
  coupons: Coupon[];
  activeStatuses: ExpiryStatus[];
  onToggleStatus: (status: ExpiryStatus) => void;
}

export function SummaryBanner({ coupons, activeStatuses, onToggleStatus }: Props) {
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
      <SummaryStat
        label="בתוקף"
        value={valid}
        className="status-valid"
        selected={activeStatuses.includes("valid")}
        onClick={() => onToggleStatus("valid")}
      />
      <SummaryStat
        label="נגמר בקרוב"
        value={soon}
        className="status-soon"
        selected={activeStatuses.includes("soon")}
        onClick={() => onToggleStatus("soon")}
      />
      <SummaryStat
        label="פג תוקף"
        value={expired}
        className="status-expired"
        selected={activeStatuses.includes("expired")}
        onClick={() => onToggleStatus("expired")}
      />
    </div>
  );
}

function SummaryStat({
  label,
  value,
  className,
  selected,
  onClick,
}: {
  label: string;
  value: number;
  className: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`status-badge ${className}`}
      style={{
        fontSize: "0.95rem",
        padding: "8px 16px",
        border: selected ? "2px solid currentColor" : "2px solid transparent",
        cursor: "pointer",
      }}
    >
      <strong>{value}</strong> {label}
    </button>
  );
}
