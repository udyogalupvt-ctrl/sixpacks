import { useState, useEffect, useRef } from "react";
import { C, FONT_DISPLAY, FONT_BODY } from "../theme";
import {
  TOTAL_DAYS, PROTEIN_TARGET, WATER_TARGET, FIGHT_DAYS,
  WORKOUTS, FIGHT, buildMeals,
  toKey, clampDate, dayNumber, phaseOf, fmtDate, emptyDay, slugOf,
  gymItemsFor, fightItemsFor, isDayComplete,
} from "../plan";
import { Card, Stat, NavBtn, CheckRow, SectionLabel } from "./ui";
import SectionImage from "./SectionImage";

const parseKey = (k) => { const [y, m, d] = k.split("-").map(Number); return new Date(y, m - 1, d); };

export default function GrindLog({ profile, save }) {
  const days = profile?.days || {};
  const [view, setView] = useState(() => clampDate(new Date()));
  const [showLifts, setShowLifts] = useState(true);

  const key = toKey(view);
  const rec = { ...emptyDay(), ...(days[key] || {}) };
  const dow = view.getDay();
  const dayNum = dayNumber(view);
  const phase = phaseOf(view);
  const workout = WORKOUTS[dow];
  const isFightDay = FIGHT_DAYS.includes(dow);
  const fight = FIGHT[phase.n];
  const meals = buildMeals(dow, phase.n);
  const daysLeft = TOTAL_DAYS - dayNumber(clampDate(new Date()));

  const gymItems = gymItemsFor(view);
  const gymIds = gymItems.filter((x) => x.id).map((x) => x.id);
  const gymDoneCount = gymIds.filter((id) => rec.gym?.[id]).length;
  const gymAllDone = gymIds.length > 0 && gymDoneCount === gymIds.length;

  const fightItems = fightItemsFor(view);
  const fightIds = fightItems.map((x) => x.id);
  const fightDoneCount = fightIds.filter((id) => rec.fight?.[id]).length;
  const fightAllDone = fightIds.length > 0 && fightDoneCount === fightIds.length;

  // Granular merge writes: only the touched field is sent, so debounced
  // inputs and rapid taps can never clobber each other with stale data.
  const patchDay = (patch) => save({ days: { [key]: patch } });
  const toggleMeal = (id) => patchDay({ meals: { [id]: !rec.meals?.[id] } });
  const toggleGym = (id) => patchDay({ gym: { [id]: !rec.gym?.[id] } });
  const toggleFight = (id) => patchDay({ fight: { [id]: !rec.fight?.[id] } });
  const markAllGym = () => patchDay({ gym: Object.fromEntries(gymIds.map((id) => [id, !gymAllDone])) });
  const markAllFight = () => patchDay({ fight: Object.fromEntries(fightIds.map((id) => [id, !fightAllDone])) });

  // Last weight used per exercise on any earlier day (progressive overload reference).
  const lastWeights = {};
  Object.entries(days)
    .filter(([k]) => k < key)
    .sort((a, b) => (a[0] > b[0] ? -1 : 1))
    .forEach(([, r]) => {
      Object.entries(r.gymWeights || {}).forEach(([slug, w]) => {
        if (!(slug in lastWeights) && w !== "" && w != null) lastWeights[slug] = w;
      });
    });

  const sectionImages = profile?.sectionImages || {};

  // ----- stats across all logged days -----
  const today = clampDate(new Date());
  const elapsed = dayNumber(today);
  let completedDays = 0, workoutsDone = 0, fightsDone = 0;
  Object.entries(days).forEach(([k, r]) => {
    const dt = parseKey(k);
    const gIds = gymItemsFor(dt).filter((x) => x.id).map((x) => x.id);
    if (gIds.length && gIds.every((id) => r.gym?.[id])) workoutsDone++;
    const fIds = fightItemsFor(dt).map((x) => x.id);
    if (fIds.length && fIds.every((id) => r.fight?.[id])) fightsDone++;
    if (isDayComplete(r, dt)) completedDays++;
  });
  let streak = 0;
  for (let i = 0; i < TOTAL_DAYS; i++) {
    const dt = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
    if (dt < parseKey("2026-07-12")) break;
    if (isDayComplete(days[toKey(dt)], dt)) streak++;
    else if (i === 0) continue;
    else break;
  }

  const proteinIn = meals.reduce((s, m) => s + (rec.meals?.[m.id] ? m.p : 0), 0);
  const kcalIn = meals.reduce((s, m) => s + (rec.meals?.[m.id] ? m.kcal : 0), 0);
  const mealsDoneCount = meals.filter((m) => rec.meals?.[m.id]).length;

  const weights = Object.entries(days)
    .filter(([, r]) => r.weight !== "" && r.weight != null && !isNaN(parseFloat(r.weight)))
    .map(([k, r]) => ({ k, w: parseFloat(r.weight) }))
    .sort((a, b) => (a.k < b.k ? -1 : 1));
  const latestW = weights.length ? weights[weights.length - 1].w : null;

  const move = (delta) =>
    setView((v) => clampDate(new Date(v.getFullYear(), v.getMonth(), v.getDate() + delta)));

  // Day pillars — everything that counts toward the day being "complete".
  const pillars = [
    { label: "MEALS", done: mealsDoneCount === meals.length, text: `${mealsDoneCount}/${meals.length}` },
    ...(workout.rest ? [] : [{ label: "GYM", done: gymAllDone, text: `${gymDoneCount}/${gymIds.length}` }]),
    ...(isFightDay ? [{ label: "FIGHT", done: fightAllDone, text: `${fightDoneCount}/${fightIds.length}` }] : []),
    { label: "WATER", done: (rec.water || 0) >= WATER_TARGET, text: `${rec.water || 0}/${WATER_TARGET}` },
    { label: "WEIGHT", done: rec.weight !== "" && rec.weight != null, text: rec.weight ? `${rec.weight}kg` : "—", optional: true },
  ];

  return (
    <div style={{ maxWidth: 520, margin: "0 auto", padding: "8px 16px 20px", color: C.bone, fontFamily: FONT_BODY }}>
      {/* ---- header ---- */}
      <div style={{ borderBottom: `1px solid ${C.line}`, paddingBottom: 16, marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 52, lineHeight: 1 }}>
            DAY {String(dayNum).padStart(3, "0")}
          </div>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 20, color: C.ember }}>/ {TOTAL_DAYS}</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
          <span style={{ fontSize: 13, color: C.dim }}>{fmtDate(view)}</span>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", color: phase.n === 3 ? C.ember : C.gold, border: `1px solid ${phase.n === 3 ? C.ember : C.gold}`, padding: "3px 8px", borderRadius: 3 }}>
            PHASE {phase.n} · {phase.name}
          </span>
        </div>
        <div style={{ fontSize: 12, color: C.dim, marginTop: 6 }}>{phase.note}</div>
        <div style={{ fontSize: 12, color: C.dim, marginTop: 4 }}>
          <span style={{ color: C.ember, fontWeight: 700 }}>{Math.max(daysLeft, 0)} days</span> until Jan 12, 2027
        </div>
      </div>

      {/* ---- stats ---- */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6, marginBottom: 10 }}>
        <Stat label="STREAK" value={`${streak}d`} color={streak >= 7 ? C.gold : C.bone} />
        <Stat label="GYM" value={workoutsDone} color={C.bone} />
        <Stat label="FIGHTS" value={fightsDone} color={C.bone} />
        <Stat label="ADHERE" value={`${elapsed > 0 ? Math.round((completedDays / elapsed) * 100) : 0}%`} color={C.bone} />
      </div>

      {/* ---- day pillars ---- */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
        {pillars.map((p) => (
          <span key={p.label} style={{
            fontSize: 10, fontWeight: 700, letterSpacing: "0.1em",
            border: `1px solid ${p.done ? C.green : p.optional ? C.line : C.line}`,
            color: p.done ? C.green : p.optional ? C.dim : C.bone,
            background: p.done ? "rgba(61,201,124,0.08)" : "transparent",
            borderRadius: 20, padding: "4px 10px",
          }}>
            {p.done ? "✓ " : ""}{p.label} {p.text}
          </span>
        ))}
      </div>

      {/* ---- nav ---- */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <NavBtn onClick={() => move(-1)} disabled={dayNum <= 1}>◀ Prev</NavBtn>
        <NavBtn onClick={() => setView(clampDate(new Date()))} accent>Today</NavBtn>
        <NavBtn onClick={() => move(1)} disabled={dayNum >= TOTAL_DAYS}>Next ▶</NavBtn>
      </div>

      {/* ---- gym session (lifts + cardio, tracked like meals) ---- */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <SectionLabel>GYM SESSION {gymIds.length > 0 && <span style={{ color: gymAllDone ? C.green : C.dim }}>· {gymDoneCount}/{gymIds.length}</span>}</SectionLabel>
              {!workout.rest && (
                <SectionImage imgKey={`gym-${workout.key}`} url={sectionImages[`gym-${workout.key}`]} save={save} label={`${workout.name} session`} />
              )}
            </div>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 26, marginTop: 4, color: workout.rest ? C.dim : C.bone }}>
              {workout.name}
            </div>
          </div>
          {!workout.rest && (
            <button
              onClick={markAllGym}
              style={{
                background: gymAllDone ? C.green : "transparent",
                color: gymAllDone ? "#0B0F15" : C.bone,
                border: `2px solid ${gymAllDone ? C.green : C.line}`,
                borderRadius: 8, padding: "12px 16px", fontWeight: 700, fontSize: 13, minWidth: 92, transition: "all .15s", fontFamily: FONT_BODY,
              }}
            >
              {gymAllDone ? "✓ DONE" : "Mark all"}
            </button>
          )}
        </div>
        {workout.rest ? (
          <div style={{ fontSize: 12, color: C.dim, marginTop: 6 }}>{workout.detail}</div>
        ) : (
          <>
            <button
              onClick={() => setShowLifts((s) => !s)}
              style={{ background: "none", border: "none", color: C.gold, fontSize: 12, fontWeight: 700, padding: "8px 0 0", fontFamily: FONT_BODY }}
            >
              {showLifts ? "▾ Hide exercises" : `▸ Show exercises (${gymDoneCount}/${gymIds.length} done)`}
            </button>
            {showLifts && (
              <div style={{ marginTop: 6, borderTop: `1px solid ${C.line}`, paddingTop: 2 }}>
                {gymItems.map((item, i) => {
                  if (item.id === null) {
                    return <div key={`h${i}`} style={{ fontSize: 10, letterSpacing: "0.2em", color: C.ember, fontWeight: 700, margin: "12px 0 0" }}>{item.header}</div>;
                  }
                  const slug = slugOf(item.name);
                  return (
                    <div key={item.id} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <CheckRow
                          done={!!rec.gym?.[item.id]}
                          onToggle={() => toggleGym(item.id)}
                          title={item.name}
                          sub={item.sub}
                          right={item.sets}
                        />
                      </div>
                      {item.id !== "cardio" && (
                        <KgInput
                          key={`${key}-${slug}`}
                          value={rec.gymWeights?.[slug] ?? ""}
                          last={lastWeights[slug]}
                          onSave={(v) => patchDay({ gymWeights: { [slug]: v } })}
                        />
                      )}
                    </div>
                  );
                })}
                <div style={{ fontSize: 11, color: C.dim, marginTop: 10 }}>
                  Overload rule: hit the top reps on all sets → +2.5 kg next time. Cardio counts — don't skip the treadmill.
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      {/* ---- fight training (tracked drill by drill) ---- */}
      {isFightDay && (
        <Card highlight>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <SectionLabel color={C.ember}>🥊 FIGHT TRAINING · {fightDoneCount}/{fightIds.length}</SectionLabel>
                <SectionImage imgKey={`fight-${phase.n}`} url={sectionImages[`fight-${phase.n}`]} save={save} label={fight.title} />
              </div>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 22, marginTop: 4 }}>{fight.title}</div>
            </div>
            <button
              onClick={markAllFight}
              style={{
                background: fightAllDone ? C.green : "transparent",
                color: fightAllDone ? "#0B0F15" : C.bone,
                border: `2px solid ${fightAllDone ? C.green : C.line}`,
                borderRadius: 8, padding: "12px 16px", fontWeight: 700, fontSize: 13, minWidth: 92, transition: "all .15s", fontFamily: FONT_BODY,
              }}
            >
              {fightAllDone ? "✓ DONE" : "Mark all"}
            </button>
          </div>
          <div style={{ marginTop: 8, borderTop: `1px solid ${C.line}`, paddingTop: 2 }}>
            {fightItems.map((item) => (
              <CheckRow
                key={item.id}
                done={!!rec.fight?.[item.id]}
                onToggle={() => toggleFight(item.id)}
                title={item.name}
                right={item.sets}
              />
            ))}
            <div style={{ fontSize: 11, color: C.gold, marginTop: 10 }}>{fight.note}</div>
          </div>
        </Card>
      )}

      {/* ---- meals ---- */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
            <SectionLabel>
              MEALS — {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"][dow]} (dairy-free)
            </SectionLabel>
            <SectionImage imgKey={`meals-${dow}`} url={sectionImages[`meals-${dow}`]} save={save} label={`${["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][dow]} meals`} />
          </div>
          <div style={{ fontSize: 12, color: C.dim, flexShrink: 0 }}>{kcalIn} kcal logged</div>
        </div>
        {meals.map((m) => (
          <CheckRow
            key={m.id}
            done={!!rec.meals?.[m.id]}
            onToggle={() => toggleMeal(m.id)}
            title={m.label}
            sub={m.food}
            right={`${m.kcal} kcal\n${m.p}g P`}
          />
        ))}
        <div style={{ marginTop: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: C.dim, fontWeight: 700 }}>
            <span>PROTEIN</span>
            <span style={{ color: proteinIn >= PROTEIN_TARGET ? C.green : C.bone }}>{proteinIn} / {PROTEIN_TARGET}g</span>
          </div>
          <div style={{ height: 8, background: C.panel2, borderRadius: 4, marginTop: 6, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${Math.min((proteinIn / PROTEIN_TARGET) * 100, 100)}%`, background: proteinIn >= PROTEIN_TARGET ? C.green : C.ember, transition: "width .2s" }} />
          </div>
          <div style={{ fontSize: 10, color: C.dim, marginTop: 4 }}>
            No dairy = your calcium comes from ragi, sesame (gingelly), gongura/greens, soya + 20 min morning sun for Vitamin D.
          </div>
        </div>
      </Card>

      {/* ---- water ---- */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <SectionLabel>WATER</SectionLabel>
          <div style={{ fontSize: 12, color: C.dim }}>{((rec.water || 0) * 0.5).toFixed(1)} / 4.0 L</div>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
          {Array.from({ length: WATER_TARGET }).map((_, i) => {
            const filled = i < (rec.water || 0);
            return (
              <button
                key={i}
                aria-label={`Glass ${i + 1}`}
                onClick={() => patchDay({ water: filled && i === (rec.water || 0) - 1 ? i : i + 1 })}
                style={{
                  width: 40, height: 48, borderRadius: "6px 6px 10px 10px",
                  border: `2px solid ${filled ? C.blue : C.line}`,
                  background: filled ? "rgba(77,163,255,0.25)" : "transparent",
                  fontSize: 16, transition: "all .15s", color: C.blue,
                }}
              >
                {filled ? "💧" : ""}
              </button>
            );
          })}
        </div>
      </Card>

      {/* ---- weight ---- */}
      <Card highlight={dow === 6}>
        <SectionLabel color={dow === 6 ? C.gold : C.dim}>
          {dow === 6 ? "★ SATURDAY WEIGH-IN (empty stomach)" : "WEIGHT (optional — Saturdays official)"}
        </SectionLabel>
        <div style={{ display: "flex", gap: 10, marginTop: 10, alignItems: "center" }}>
          <WeightInput key={key} value={rec.weight} onSave={(w) => patchDay({ weight: w })} />
          <span style={{ fontSize: 13, color: C.dim }}>kg · target 72–74</span>
        </div>
        {weights.length > 0 && (
          <div style={{ marginTop: 12, borderTop: `1px solid ${C.line}`, paddingTop: 10 }}>
            <SectionLabel>LOG</SectionLabel>
            {weights.slice(-6).map((e, i, arr) => {
              const prev = i > 0 ? arr[i - 1].w : (weights.length > 6 ? weights[weights.length - 7].w : null);
              const delta = prev != null ? (e.w - prev).toFixed(1) : null;
              return (
                <div key={e.k} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginTop: 6 }}>
                  <span style={{ color: C.dim }}>{e.k}</span>
                  <span>
                    <b>{e.w} kg</b>
                    {delta != null && (
                      <span style={{ color: parseFloat(delta) <= 0 ? C.green : C.ember, marginLeft: 8, fontSize: 12 }}>
                        {parseFloat(delta) > 0 ? "+" : ""}{delta}
                      </span>
                    )}
                  </span>
                </div>
              );
            })}
            {latestW != null && (
              <div style={{ fontSize: 12, color: C.gold, marginTop: 8 }}>
                {(latestW - 72).toFixed(1)} kg between you and the goal.
              </div>
            )}
          </div>
        )}
      </Card>

      <div style={{ textAlign: "center", fontSize: 11, color: C.dim, marginTop: 20, lineHeight: 1.7 }}>
        Never miss two in a row. Discipline &gt; motivation.<br />
        If any pain feels sharp (not sore), rest it and see a doctor — heroes recover, they don't break.<br />
        Progress syncs to your account — log in anywhere and it's all there.
      </div>
    </div>
  );
}

// Small per-exercise kg input next to each lift. Placeholder shows the
// last weight used for the same exercise so progressive overload is obvious.
function KgInput({ value, last, onSave }) {
  const [local, setLocal] = useState(value ?? "");
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);

  const change = (v) => {
    setLocal(v);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => onSave(v), 700);
  };
  const flush = () => { clearTimeout(timer.current); onSave(local); };

  return (
    <div style={{ marginTop: 10, flexShrink: 0, width: 62 }}>
      <input
        type="number" inputMode="decimal" step="0.5" min="0"
        placeholder={last != null ? String(last) : "kg"}
        aria-label="Weight used (kg)"
        value={local}
        onChange={(e) => change(e.target.value)}
        onBlur={flush}
        onKeyDown={(e) => e.key === "Enter" && flush()}
        style={{
          width: "100%", background: C.panel2, border: `1px solid ${local !== "" ? C.gold : C.line}`,
          borderRadius: 8, color: C.bone, padding: "10px 6px", fontSize: 14,
          fontFamily: FONT_BODY, textAlign: "center",
        }}
      />
      <div style={{ fontSize: 8, color: C.dim, textAlign: "center", marginTop: 2, letterSpacing: "0.05em" }}>
        {last != null ? `LAST ${last}` : "KG"}
      </div>
    </div>
  );
}

// Debounced weight input — avoids one Firestore write per keystroke.
function WeightInput({ value, onSave }) {
  const [local, setLocal] = useState(value ?? "");
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);

  const change = (v) => {
    setLocal(v);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => onSave(v), 700);
  };
  const flush = () => { clearTimeout(timer.current); onSave(local); };

  return (
    <input
      type="number" inputMode="decimal" step="0.1" placeholder="e.g. 81.0"
      value={local}
      onChange={(e) => change(e.target.value)}
      onBlur={flush}
      onKeyDown={(e) => e.key === "Enter" && flush()}
      style={{ background: C.panel2, border: `1px solid ${C.line}`, borderRadius: 8, color: C.bone, padding: "10px 12px", fontSize: 16, width: 120, fontFamily: FONT_BODY }}
    />
  );
}
