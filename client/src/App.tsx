import { useEffect, useState } from "react";
import { api } from "./api/client";
import { ConfirmDialog } from "./components/ConfirmDialog";
import { CouponCard } from "./components/CouponCard";
import { CouponForm } from "./components/CouponForm";
import { DuplicateBanner } from "./components/DuplicateBanner";
import { FilterBar, type Filters } from "./components/FilterBar";
import { ImportModal } from "./components/ImportModal";
import { LoginScreen } from "./components/LoginScreen";
import { PresentView } from "./components/PresentView";
import { SummaryBanner } from "./components/SummaryBanner";
import type { Coupon, CouponInput } from "./types";
import { ViewTabs, type View } from "./components/ViewTabs";

const EMPTY_FILTERS: Filters = { q: "", store: "", category: "", status: "" };

export default function App() {
  const [authChecked, setAuthChecked] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [view, setView] = useState<View>("active");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editingCoupon, setEditingCoupon] = useState<Coupon | "new" | null>(null);
  const [deletingCoupon, setDeletingCoupon] = useState<Coupon | null>(null);
  const [presentingCoupon, setPresentingCoupon] = useState<Coupon | null>(null);
  const [importing, setImporting] = useState(false);
  const [prefillData, setPrefillData] = useState<Partial<CouponInput> | null>(null);

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
        view,
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
  }, [authenticated, filters, view]);

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
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <a href="/api/coupons/export?format=csv" className="btn btn-secondary" style={{ textDecoration: "none" }}>
            ייצוא CSV
          </a>
          <a href="/api/coupons/export?format=json" className="btn btn-secondary" style={{ textDecoration: "none" }}>
            ייצוא JSON
          </a>
          <button className="btn btn-secondary" onClick={() => setImporting(true)}>
            ייבוא אוטומטי
          </button>
          <button className="btn btn-primary" onClick={() => setEditingCoupon("new")}>
            + שובר חדש
          </button>
        </div>
      </header>

      <ViewTabs view={view} onChange={setView} />

      {view === "active" && (
        <>
          <SummaryBanner coupons={coupons} />
          <DuplicateBanner coupons={coupons} />
        </>
      )}
      <FilterBar filters={filters} onChange={setFilters} hideStatus={view === "redeemed"} />

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
            onPresent={() => setPresentingCoupon(coupon)}
          />
        ))}
      </div>

      {editingCoupon && (
        <CouponForm
          initial={editingCoupon === "new" ? undefined : editingCoupon}
          prefill={editingCoupon === "new" ? (prefillData ?? undefined) : undefined}
          onCancel={() => {
            setEditingCoupon(null);
            setPrefillData(null);
          }}
          onSaved={() => {
            setEditingCoupon(null);
            setPrefillData(null);
            loadCoupons();
          }}
        />
      )}

      {importing && (
        <ImportModal
          onCancel={() => setImporting(false)}
          onExtracted={(prefill) => {
            setPrefillData(prefill);
            setImporting(false);
            setEditingCoupon("new");
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

      {presentingCoupon && <PresentView coupon={presentingCoupon} onClose={() => setPresentingCoupon(null)} />}
    </div>
  );
}
