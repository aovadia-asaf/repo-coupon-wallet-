interface Props {
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ title, message, confirmLabel = "אישור", onConfirm, onCancel }: Props) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-box" style={{ maxWidth: 360 }} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ marginBottom: 8 }}>{title}</h3>
        <p style={{ color: "var(--ink-soft)", marginBottom: 20 }}>{message}</p>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button className="btn btn-secondary" onClick={onCancel}>
            ביטול
          </button>
          <button className="btn btn-danger" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
