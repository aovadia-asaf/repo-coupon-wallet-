import type { Coupon } from "../types";

function normalize(value: string | null): string {
  return (value ?? "").trim().toLowerCase();
}

export function findDuplicateGroups(coupons: Coupon[]): Coupon[][] {
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
