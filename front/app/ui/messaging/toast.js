import { useEffect } from  'react'

const C = {
  accent: "#00d2be",
  danger: "#ef4444",
  fontfamily: "'Courier New', monospace",
};

// ─── Toast ────────────────────────────────────────────────────────────────────
export default function Toast({ msg, type, clear }) {
  useEffect(() => { const t = setTimeout(clear, 2800); return () => clearTimeout(t); }, [msg]);
  return (
    <div style={{
      position: "fixed", bottom: "24px", right: "24px", zIndex: 9999,
      background: type === "err" ? C.danger : C.accent,
      color: "#050810", fontFamily: C.mono, fontSize: "12px", fontWeight: 700,
      letterSpacing: "0.06em", padding: "10px 18px", borderRadius: "8px",
      boxShadow: `0 4px 24px ${type === "err" ? C.danger : C.accent}66`,
      animation: "toastIn 0.2s ease",
    }}>
      {msg}
    </div>
  );
}