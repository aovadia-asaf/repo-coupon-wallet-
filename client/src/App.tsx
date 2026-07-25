import { useEffect, useState } from "react";
import { api } from "./api/client";
import { ConfirmDialog } from "./components/ConfirmDialog";
import { CouponCard } from "./components/CouponCard";
import { CouponForm } from "./components/CouponForm";
import { FilterBar, type Filters } from "./components/FilterBar";
import { LoginScreen } from "./components/LoginScreen";
import { SummaryBanner } from "./components/SummaryBanner";
import type { Coupon } from "./types";

const EMPTY_FILTERS: Filters = { q: "", store: "", category: "", status: "" };

export default function App() {
  const [authChecked, setAuthChecked] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editingCoupon, setEditingCoupon] = useState<Coupon | "new" | null>(null);
  const [deletingCoupon, setDeletingCoupon] = useState<Coupon | null>(null);

  useEffect(() => {
    api
      .me()
      .then((res) => setAuthenticated(res.authenticated))
      .finally(() => setAuthChecked(true));
  }, []);

  async function loadCoupons() {
    setLoading(true);
    setError(null);
    try {
      const data = await api.listCoupons({
        q: filters.q,
        store: filters.store,
        category: filters.category,
        status: filters.status,
      });
      setCoupons(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "טעינה נכשלה");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!authenticated) return;
    loadCoupons();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticated, filters]);

  if (!authChecked) return null;

  if (!authenticated) {
    return <LoginScreen onLoggedIn={() => setAuthenticated(true)} />;
  }

  async function handleDeleteConfirmed() {
    if (!deletingCoupon) return;
    await api.deleteCoupon(deletingCoupon.id);
    setDeletingCoupon(null);
    loadCoupons();
  }

  async function handleToggleRedeemed(coupon: Coupon) {
    await api.setRedeemed(coupon.id, !coupon.redeemed);
    loadCoupons();
  }

  return (
    <div className="app-shell">
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: "1.6rem" }}>🎟️ ארנק הקופונים המשפחתי</h1>
        <button className="btn btn-primary" onClick={() => setEditingCoupon("new")}>
          + שובר חדש
        </button>
      </header>

      <SummaryBanner coupons={coupons} />
      <FilterBar filters={filters} onChange={setFilters} />

      {loading && <p>טוען...</p>}
      {error && <p style={{ color: "var(--expired)" }}>{error}</p>}

      {!loading && coupons.length === 0 && (
        <p style={{ color: "var(--ink-soft)", textAlign: "center", marginTop: 40 }}>אין שוברים להצגה.</p>
      )}

      <div className="grid">
        {coupons.map((coupon) => (
          <CouponCard
            key={coupon.id}
            coupon={coupon}
            onEdit={() => setEditingCoupon(coupon)}
            onDelete={() => setDeletingCoupon(coupon)}
            onToggleRedeemed={() => handleToggleRedeemed(coupon)}
          />
        ))}
      </div>

      {editingCoupon && (
        <CouponForm
          initial={editingCoupon === "new" ? undefined : editingCoupon}
          onCancel={() => setEditingCoupon(null)}
          onSaved={() => {
            setEditingCoupon(null);
            loadCoupons();
          }}
        />
      )}

      {deletingCoupon && (
        <ConfirmDialog
          title="מחיקת שובר"
          message={`למחוק את "${deletingCoupon.title}"? לא ניתן לשחזר לאחר המחיקה.`}
          confirmLabel="מחיקה"
          onConfirm={handleDeleteConfirmed}
          onCancel={() => setDeletingCoupon(null)}
        />
      )}
    </div>
  );
}
