import type { ReactNode } from "react";

export type View = "active" | "redeemed";

interface Props {
  view: View;
  onChange: (view: View) => void;
}

export function ViewTabs({ view, onChange }: Props) {
  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
      <TabButton active={view === "active"} onClick={() => onChange("active")}>
        פעילים
      </TabButton>
      <TabButton active={view === "redeemed"} onClick={() => onChange("redeemed")}>
        ממומשים
      </TabButton>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="btn"
      style={{
        background: active ? "var(--accent)" : "transparent",
        color: active ? "#fff" : "var(--ink-soft)",
        border: active ? "none" : "1.5px solid var(--line)",
      }}
    >
      {children}
    </button>
  );
}
