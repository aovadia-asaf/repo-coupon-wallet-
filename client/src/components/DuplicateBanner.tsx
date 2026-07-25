import { useMemo, useState } from "react";
import type { Coupon } from "../types";

interface Props {
  coupons: Coupon[];
}

function normalize(value: string | null): string {
  return (value ?? "").trim().toLowerCase();
}

function findDuplicateGroups(coupons: Coupon[]): Coupon[][] {
  const byCode = new Map<string, Coupon[]>();
  const byStoreTitle = new Map<string, Coupon[]>();

  for (const coupon of coupons) {
    if (coupon.code) {
      const key = `code:${normalize(coupon.code)}`;
      byCode.set(key, [...(byCode.get(key) ?? []), coupon]);
    } else {
      const key = `st:${normalize(coupon.store)}|${normalize(coupon.title)}`;
      byStoreTitle.set(key, [...(byStoreTitle.get(key) ?? []), coupon]);
    }
  }

  const groups: Coupon[][] = [];
  for (const group of byCode.values()) {
    if (group.length > 1) groups.push(group);
  }
  for (const group of byStoreTitle.values()) {
    if (group.length > 1) groups.push(group);
  }
  return groups;
}

export function DuplicateBanner({ coupons }: Props) {
  const [dismissed, setDismissed] = useState(false);
  const groups = useMemo(() => findDuplicateGroups(coupons), [coupons]);

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
      <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
        <strong>נמצאו {totalCount} שוברים שנראים כפולים</strong>
        <button type="button" className="btn-ghost" onClick={() => setDismissed(true)} style={{ border: "none" }}>
          סגירה
        </button>
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
