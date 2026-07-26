import { useEffect, useRef, useState } from "react";

export function ExportMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        className="btn btn-secondary"
        onClick={() => setOpen((v) => !v)}
        aria-label="עוד אפשרויות"
        style={{ padding: "8px 12px", fontSize: "1.1rem", lineHeight: 1 }}
      >
        ⋮
      </button>
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            background: "#fff",
            border: "1.5px solid var(--line)",
            borderRadius: 8,
            boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
            minWidth: 140,
            zIndex: 20,
            overflow: "hidden",
          }}
        >
          <a
            href="/api/coupons/export?format=csv"
            onClick={() => setOpen(false)}
            style={{ display: "block", padding: "10px 14px", textDecoration: "none", color: "var(--ink)", whiteSpace: "nowrap" }}
          >
            ייצוא CSV
          </a>
          <a
            href="/api/coupons/export?format=json"
            onClick={() => setOpen(false)}
            style={{
              display: "block",
              padding: "10px 14px",
              textDecoration: "none",
              color: "var(--ink)",
              whiteSpace: "nowrap",
              borderTop: "1px solid var(--line)",
            }}
          >
            ייצוא JSON
          </a>
        </div>
      )}
    </div>
  );
}
