import { useState } from "react";
import type { Coupon } from "../types";

interface Props {
  groups: Coupon[][];
  showingOnly: boolean;
  onToggleShowOnly: () => void;
}

export function DuplicateBanner({ groups, showingOnly, onToggleShowOnly }: Props) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || groups.length === 0) return null;

  const totalCount = groups.reduce((sum, g) => sum + g.length, 0);

  return (
    <div
      className="status-badge status-soon"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 6,
        padding: "10px 16px",
        marginBottom: 16,
        width: "100%",
        fontSize: "0.9rem",
      }}
    >
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", width: "100%", gap: 8 }}>
        <strong>נמצאו {totalCount} שוברים שנראים כפולים</strong>
        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" className="btn-ghost" onClick={onToggleShowOnly} style={{ border: "none" }}>
            {showingOnly ? "הצג הכל" : "הצג כפולים בלבד"}
          </button>
          <button
            type="button"
            className="btn-ghost"
            onClick={() => {
              setDismissed(true);
              if (showingOnly) onToggleShowOnly();
            }}
            style={{ border: "none" }}
          >
            סגירה
          </button>
        </div>
      </div>
      <ul style={{ margin: 0, paddingInlineStart: 20 }}>
        {groups.map((group) => (
          <li key={group.map((c) => c.id).join(",")}>
            {group.map((c) => c.title).join(" / ")}
            {group[0].store ? ` (${group[0].store})` : ""}
          </li>
        ))}
      </ul>
    </div>
  );
}
