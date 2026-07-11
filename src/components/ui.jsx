import { C, FONT_DISPLAY, FONT_BODY } from "../theme";

export function Card({ children, highlight }) {
  return (
    <div style={{ background: C.panel, border: `1px solid ${highlight ? C.gold : C.line}`, borderRadius: 12, padding: 16, marginBottom: 14 }}>
      {children}
    </div>
  );
}

export function Stat({ label, value, color }) {
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 10, padding: "10px 4px", textAlign: "center" }}>
      <div style={{ fontFamily: FONT_DISPLAY, fontSize: 18, color }}>{value}</div>
      <div style={{ fontSize: 8, letterSpacing: "0.2em", color: C.dim, fontWeight: 700, marginTop: 2 }}>{label}</div>
    </div>
  );
}

export function NavBtn({ children, onClick, disabled, accent }) {
  return (
    <button
      onClick={onClick} disabled={disabled}
      style={{
        flex: 1, padding: "10px 0", borderRadius: 8, fontWeight: 700, fontSize: 13, fontFamily: FONT_BODY,
        background: accent ? C.ember : "transparent",
        color: accent ? "#0B0F15" : disabled ? C.line : C.bone,
        border: `1px solid ${accent ? C.ember : C.line}`,
        opacity: disabled ? 0.5 : 1, transition: "all .15s",
      }}
    >
      {children}
    </button>
  );
}

// Checklist row shared by meals / gym / fight cards.
export function CheckRow({ done, onToggle, title, sub, right }) {
  return (
    <button
      onClick={onToggle}
      style={{
        display: "flex", alignItems: "center", gap: 12, width: "100%", textAlign: "left",
        background: done ? C.panel2 : "transparent", border: `1px solid ${done ? C.green : C.line}`,
        borderRadius: 8, padding: "10px 12px", marginTop: 10, color: C.bone, transition: "all .15s",
        fontFamily: FONT_BODY,
      }}
    >
      <span style={{
        width: 22, height: 22, borderRadius: 6, flexShrink: 0,
        border: `2px solid ${done ? C.green : C.dim}`,
        background: done ? C.green : "transparent",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "#0B0F15", fontWeight: 700, fontSize: 14,
      }}>{done ? "✓" : ""}</span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ fontWeight: 600, fontSize: 14 }}>{title}</span>
        {sub && <span style={{ display: "block", fontSize: 11, color: C.dim, lineHeight: 1.4 }}>{sub}</span>}
      </span>
      {right && (
        <span style={{ fontSize: 11, color: C.dim, textAlign: "right", flexShrink: 0, whiteSpace: "pre-line" }}>
          {right}
        </span>
      )}
    </button>
  );
}

export function SectionLabel({ children, color }) {
  return (
    <div style={{ fontSize: 11, letterSpacing: "0.2em", color: color || C.dim, fontWeight: 700 }}>
      {children}
    </div>
  );
}

export function Spinner({ size = 18 }) {
  return (
    <span
      aria-label="Loading"
      style={{
        display: "inline-block", width: size, height: size, borderRadius: "50%",
        border: `2px solid ${C.line}`, borderTopColor: C.ember,
        animation: "spin .7s linear infinite",
      }}
    />
  );
}
