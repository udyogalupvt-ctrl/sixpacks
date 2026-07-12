import { useState } from "react";
import { C, FONT_DISPLAY, FONT_BODY } from "../theme";
import {
  WORKOUTS, FIGHT_DAYS, START, END,
  toKey, clampDate, dayNumber, phaseOf, isDayComplete, startDate, endDate,
} from "../plan";

const DOW = ["S", "M", "T", "W", "T", "F", "S"];
const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
const SHORT = { "REST DAY": "REST", PUSH: "PUSH", PULL: "PULL", "LEGS + ABS": "LEGS" };

const sameMonth = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
const inRange = (d) => d >= startDate() && d <= endDate();

export default function Calendar({ days, view, onPick, onClose }) {
  const [month, setMonth] = useState(() => new Date(view.getFullYear(), view.getMonth(), 1));
  const today = clampDate(new Date());

  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const lead = first.getDay();
  const cells = [
    ...Array.from({ length: lead }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(month.getFullYear(), month.getMonth(), i + 1)),
  ];

  const canPrev = new Date(month.getFullYear(), month.getMonth(), 0) >= startDate();
  const canNext = new Date(month.getFullYear(), month.getMonth() + 1, 1) <= endDate();
  const shiftMonth = (d) => setMonth((m) => new Date(m.getFullYear(), m.getMonth() + d, 1));

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 40, background: C.bg, overflowY: "auto", fontFamily: FONT_BODY, color: C.bone }}>
      <div style={{ maxWidth: 520, margin: "0 auto", padding: "14px 16px 40px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 30 }}>CALENDAR<span style={{ color: C.ember }}>.</span></div>
          <button
            onClick={onClose} aria-label="Close calendar"
            style={{ background: "none", border: `1px solid ${C.line}`, color: C.bone, borderRadius: 8, padding: "8px 14px", fontWeight: 700, fontSize: 13, fontFamily: FONT_BODY }}
          >
            ✕ Close
          </button>
        </div>

        {/* month nav */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <MonthBtn onClick={() => shiftMonth(-1)} disabled={!canPrev}>◀</MonthBtn>
          <div style={{ flex: 1, textAlign: "center", fontFamily: FONT_DISPLAY, fontSize: 20 }}>
            {MONTHS[month.getMonth()]} {month.getFullYear()}
          </div>
          <MonthBtn onClick={() => shiftMonth(1)} disabled={!canNext}>▶</MonthBtn>
        </div>

        {/* weekday header */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 4 }}>
          {DOW.map((d, i) => (
            <div key={i} style={{ textAlign: "center", fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", color: C.dim, padding: "4px 0" }}>
              {d}
            </div>
          ))}
        </div>

        {/* day grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
          {cells.map((d, i) => {
            if (!d) return <div key={`e${i}`} />;
            const usable = inRange(d);
            const k = toKey(d);
            const rec = days[k];
            const done = usable && isDayComplete(rec, d);
            const isToday = usable && toKey(d) === toKey(today);
            const isView = usable && toKey(d) === toKey(view);
            const w = WORKOUTS[d.getDay()];
            const fight = FIGHT_DAYS.includes(d.getDay());

            return (
              <button
                key={k}
                disabled={!usable}
                onClick={() => onPick(d)}
                aria-label={`${k}${done ? " — complete" : ""}`}
                style={{
                  aspectRatio: "1 / 1.15", borderRadius: 8, padding: "3px 1px", fontFamily: FONT_BODY,
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1,
                  background: done ? "rgba(61,201,124,0.14)" : isView ? C.panel2 : "transparent",
                  border: `1px solid ${isView ? C.ember : done ? C.green : isToday ? C.gold : C.line}`,
                  opacity: usable ? 1 : 0.22,
                  color: C.bone, cursor: usable ? "pointer" : "default",
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 700, lineHeight: 1, color: isToday ? C.gold : C.bone }}>
                  {d.getDate()}
                </span>
                {usable && (
                  <>
                    <span style={{ fontSize: 7, letterSpacing: "0.05em", color: w.rest ? C.dim : C.bone, lineHeight: 1 }}>
                      {SHORT[w.name]}
                    </span>
                    <span style={{ fontSize: 7, lineHeight: 1, height: 8 }}>
                      {fight ? "🥊" : ""}{done ? "✓" : ""}
                    </span>
                  </>
                )}
              </button>
            );
          })}
        </div>

        {/* legend */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 14, fontSize: 10, color: C.dim }}>
          <Legend color={C.gold}>Today</Legend>
          <Legend color={C.ember}>Selected</Legend>
          <Legend color={C.green}>Fully logged</Legend>
          <span>🥊 Fight day</span>
        </div>

        <div style={{ fontSize: 11, color: C.dim, marginTop: 14, lineHeight: 1.6, borderTop: `1px solid ${C.line}`, paddingTop: 12 }}>
          Tap any day to open its full plan — gym, fight session, meals. Green means every
          pillar was logged. The grind runs {MONTHS[START.m]} {String(START.d).padStart(2, "0")}, {START.y} →{" "}
          {MONTHS[END.m]} {String(END.d).padStart(2, "0")}, {END.y}.
        </div>
      </div>
    </div>
  );
}

function MonthBtn({ children, onClick, disabled }) {
  return (
    <button
      onClick={onClick} disabled={disabled}
      style={{
        width: 44, height: 40, borderRadius: 8, fontFamily: FONT_BODY, fontSize: 13, fontWeight: 700,
        background: "transparent", color: disabled ? C.line : C.bone,
        border: `1px solid ${C.line}`, opacity: disabled ? 0.5 : 1,
      }}
    >
      {children}
    </button>
  );
}

function Legend({ color, children }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
      <span style={{ width: 9, height: 9, borderRadius: 3, border: `1px solid ${color}`, display: "inline-block" }} />
      {children}
    </span>
  );
}
