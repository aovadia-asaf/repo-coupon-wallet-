import { CATEGORY_LABELS, type Category } from "../types";

export interface Filters {
  q: string;
  store: string;
  category: Category | "";
  status: "" | "valid" | "soon" | "expired";
}

interface Props {
  filters: Filters;
  onChange: (filters: Filters) => void;
  hideStatus?: boolean;
}

export function FilterBar({ filters, onChange, hideStatus }: Props) {
  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        flexWrap: "wrap",
        marginBottom: 20,
        alignItems: "center",
      }}
    >
      <input
        placeholder="חיפוש חופשי..."
        value={filters.q}
        onChange={(e) => onChange({ ...filters, q: e.target.value })}
        style={{
          flex: "1 1 200px",
          border: "1.5px solid var(--line)",
          borderRadius: 8,
          padding: "9px 12px",
          background: "#fff",
        }}
      />
      <input
        placeholder="חנות..."
        value={filters.store}
        onChange={(e) => onChange({ ...filters, store: e.target.value })}
        style={{
          flex: "1 1 140px",
          border: "1.5px solid var(--line)",
          borderRadius: 8,
          padding: "9px 12px",
          background: "#fff",
        }}
      />
      <select
        value={filters.category}
        onChange={(e) => onChange({ ...filters, category: e.target.value as Category | "" })}
        style={{ border: "1.5px solid var(--line)", borderRadius: 8, padding: "9px 12px", background: "#fff" }}
      >
        <option value="">כל הקטגוריות</option>
        {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      {!hideStatus && (
        <select
          value={filters.status}
          onChange={(e) => onChange({ ...filters, status: e.target.value as Filters["status"] })}
          style={{ border: "1.5px solid var(--line)", borderRadius: 8, padding: "9px 12px", background: "#fff" }}
        >
          <option value="">כל הסטטוסים</option>
          <option value="valid">בתוקף</option>
          <option value="soon">נגמר בקרוב</option>
          <option value="expired">פג תוקף</option>
        </select>
      )}
    </div>
  );
}
