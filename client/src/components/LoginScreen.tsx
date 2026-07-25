import { type FormEvent, useState } from "react";
import { api } from "../api/client";

interface Props {
  onLoggedIn: () => void;
}

export function LoginScreen({ onLoggedIn }: Props) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api.login(pin);
      onLoggedIn();
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה בכניסה");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <form onSubmit={handleSubmit} className="ticket" style={{ width: 320 }}>
        <h1 style={{ fontSize: "1.4rem", textAlign: "center", marginBottom: 4 }}>🎟️ ארנק הקופונים המשפחתי</h1>
        <p style={{ textAlign: "center", color: "var(--ink-soft)", fontSize: "0.9rem", margin: "0 0 12px" }}>
          הזינו את קוד ה-PIN המשפחתי
        </p>
        <div className="field">
          <label htmlFor="pin">קוד PIN</label>
          <input
            id="pin"
            type="password"
            inputMode="numeric"
            autoFocus
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="••••"
          />
        </div>
        {error && <p style={{ color: "var(--expired)", fontSize: "0.85rem", margin: "0 0 8px" }}>{error}</p>}
        <button type="submit" className="btn btn-primary" disabled={loading || !pin} style={{ width: "100%" }}>
          {loading ? "בודק..." : "כניסה"}
        </button>
      </form>
    </div>
  );
}
