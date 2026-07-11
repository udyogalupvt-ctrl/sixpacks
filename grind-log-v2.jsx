import { useState, useEffect, useCallback } from "react";

// ---------- constants ----------
const START = { y: 2026, m: 6, d: 12 }; // Jul 12 2026
const END = { y: 2027, m: 0, d: 12 };   // Jan 12 2027
const TOTAL_DAYS = 185;
const STORAGE_KEY = "sixpack-tracker-v1"; // keeps any data you already logged
const PROTEIN_TARGET = 150;
const FIGHT_DAYS = [1, 3, 5]; // Mon, Wed, Fri

const C = {
  bg: "#0F141C", panel: "#171E29", panel2: "#1E2735", line: "#2A3547",
  bone: "#E9E4D8", dim: "#7C8798", ember: "#FF4D3D", gold: "#D9A441",
  green: "#3DC97C", blue: "#4DA3FF",
};
const FONT_DISPLAY = "'Archivo Black', 'Arial Black', sans-serif";
const FONT_BODY = "'IBM Plex Sans', system-ui, sans-serif";

// ---------- WORKOUT PLAN (full detail, per phase) ----------
const LIFTS = {
  push: {
    1: [["Barbell bench press", "4 × 8–10"], ["Overhead DB press", "3 × 8–10"], ["Incline DB press", "3 × 10–12"], ["Lateral raises", "3 × 12–15"], ["Rope pushdown", "3 × 12–15"]],
    2: [["Barbell bench press", "4 × 6–8"], ["Overhead DB press", "3 × 6–8"], ["Incline DB press", "3 × 10–12"], ["Dips", "3 × 8–12"], ["Lateral raises", "3 × 12–15"], ["Rope pushdown", "3 × 12–15"]],
  },
  pull: {
    1: [["Lat pulldown", "4 × 8–10"], ["Barbell/DB row", "4 × 8–10"], ["Seated cable row", "3 × 10–12"], ["Face pulls", "3 × 15"], ["DB curls", "3 × 10–12"]],
    2: [["Pull-ups", "4 × max (goal: 10)"], ["Barbell/DB row", "4 × 6–8"], ["Lat pulldown", "3 × 8–10"], ["Face pulls", "3 × 15"], ["DB curls", "3 × 10–12"]],
  },
  legs: {
    1: [["Back squat", "4 × 8–10"], ["Romanian deadlift", "3 × 8–10"], ["Leg press", "3 × 10–12"], ["Calf raises", "4 × 15"], ["— ABS —", ""], ["Hanging knee raises", "3 × 12–15"], ["Cable crunches", "3 × 15"], ["Plank", "3 × 45–60s"]],
    2: [["Back squat", "4 × 6–8"], ["Romanian deadlift", "3 × 6–8"], ["Leg press", "3 × 10–12"], ["Walking lunges", "3 × 12/leg"], ["Calf raises", "4 × 15"], ["— ABS —", ""], ["Hanging leg raises", "3 × 10–12"], ["Weighted crunches", "4 × 12–15"], ["Ab wheel rollouts", "3 × 8–12"], ["Russian twists", "3 × 20 total"]],
  },
};
const liftPhase = (n) => (n === 1 ? 1 : 2); // phase 2 & 3 lift the same

const FIGHT = {
  1: {
    title: "FIGHT BASICS",
    drills: [["Rope skipping", "3 × 3 min"], ["Stance + footwork drills", "10 min"], ["Shadowboxing (jab, cross)", "4 × 2 min rounds"], ["Wall push + neck bridges (light)", "2 × 10"]],
    note: "Learn the stance before the punch. Slow is smooth, smooth is fast.",
  },
  2: {
    title: "FIGHT SKILLS",
    drills: [["Rope skipping", "3 × 3 min"], ["Shadowboxing (add hooks, uppercuts, front kick)", "6 × 2 min rounds"], ["Heavy bag (if available)", "4 × 2 min"], ["Footwork ladder / pivots", "10 min"]],
    note: "Join a local boxing/karate/MMA academy in Kakinada if you can — a coach beats any app.",
  },
  3: {
    title: "FIGHT CONDITIONING",
    drills: [["Rope skipping", "4 × 3 min"], ["Shadowboxing (full combos)", "6 × 2 min rounds"], ["Heavy bag power rounds", "4 × 2 min"], ["Burpee + sprawl finisher", "3 × 10"]],
    note: "This doubles as your Phase-3 HIIT. Spar only under a coach — never untrained.",
  },
};

const WORKOUTS = {
  0: { name: "REST DAY", key: null, rest: true, detail: "Recovery. Walk, stretch, sleep. Gapryong rested too." },
  1: { name: "PUSH", key: "push" },
  2: { name: "PULL", key: "pull" },
  3: { name: "LEGS + ABS", key: "legs" },
  4: { name: "PUSH", key: "push" },
  5: { name: "PULL", key: "pull" },
  6: { name: "LEGS + ABS", key: "legs" },
};

// ---------- DIET (100% dairy-free) ----------
// Constant pre/post
const PRE = { id: "pre", label: "Pre-workout", food: "1 banana + black coffee (no sugar)", kcal: 110, p: 1, gym: true };
const POST = { id: "post", label: "Post-workout", food: "Plant protein scoop (pea/soy, water) + 1 banana — OR 4 egg whites + 1 egg + banana", kcal: 225, p: 24, gym: true };

// Per-weekday meals (0=Sun ... 6=Sat)
const WEEK_DIET = {
  1: {
    bfast: ["3 idli + sambar + 2 boiled eggs", 420, 22],
    lunch: ["Rice (1.5 cups) + chicken curry (150g) + cabbage fry + lemon water", 600, 40],
    snack: ["Sprouted moong salad (1 cup) + lemon", 130, 9],
    dinner: ["3 phulkas + palak dal (1 cup) + cucumber salad", 430, 18],
  },
  2: {
    bfast: ["Vegetable oats upma (60g oats) + 2 boiled eggs", 440, 24],
    lunch: ["Rice (1.5 cups) + fish pulusu (150g) + beans fry", 580, 42],
    snack: ["1 guava + 20g roasted peanuts", 180, 7],
    dinner: ["3 phulkas + egg curry (2 eggs) + salad", 470, 22],
  },
  3: {
    bfast: ["2 ragi dosa + peanut chutney + 2 boiled eggs", 450, 21],
    lunch: ["Rice (1.5 cups) + chicken curry (150g) + tomato pappu", 620, 43],
    snack: ["Coconut water + 1 orange", 110, 2],
    dinner: ["Soya chunks curry (50g dry) + 2 phulkas + salad", 460, 28],
  },
  4: {
    bfast: ["2 pesarattu + ginger chutney + 1 boiled egg", 420, 22],
    lunch: ["Rice (1.5 cups) + egg curry (2 eggs) + gongura pappu", 600, 28],
    snack: ["Sprouts chaat (1 cup)", 130, 9],
    dinner: ["Grilled/tawa chicken (150g) + sautéed veg + 1 phulka", 450, 42],
  },
  5: {
    bfast: ["3 idli + sambar + 2 boiled eggs", 420, 22],
    lunch: ["Rice (1.5 cups) + tawa fish fry (150g) + dondakaya fry", 600, 42],
    snack: ["1 apple + 20g roasted chana", 170, 6],
    dinner: ["3 phulkas + rajma/chole (1 cup) + salad", 470, 19],
  },
  6: {
    bfast: ["Egg dosa (2) + chutney", 430, 20],
    lunch: ["Rice (1.5 cups) + chicken curry (175g) + veg fry", 650, 48],
    snack: ["20g peanuts + nimbu pani (no sugar)", 160, 8],
    dinner: ["Veg + moong dal khichdi (1.5 cups)", 420, 16],
  },
  0: {
    bfast: ["Upma (1 cup) + 2 boiled eggs", 400, 18],
    lunch: ["FREE MEAL — biryani/what you love. Stop at satisfied.", 850, 35],
    snack: ["Any 1 fruit", 90, 1],
    dinner: ["Light: 2 phulkas + dal (1 cup) + salad", 350, 15],
  },
};

const buildMeals = (dow, phaseN) => {
  const d = WEEK_DIET[dow];
  const shred = phaseN === 3 && dow !== 0;
  const meals = [];
  if (dow !== 0) meals.push(PRE);
  meals.push({ id: "bfast", label: "Breakfast", food: d.bfast[0], kcal: d.bfast[1], p: d.bfast[2] });
  if (dow !== 0) meals.push(POST);
  meals.push({
    id: "lunch", label: "Lunch",
    food: shred ? d.lunch[0].replace("1.5 cups", "1.25 cups") + " (Shred portion)" : d.lunch[0],
    kcal: shred ? d.lunch[1] - 60 : d.lunch[1], p: d.lunch[2],
  });
  meals.push({ id: "snack", label: "Snack", food: d.snack[0], kcal: d.snack[1], p: d.snack[2] });
  meals.push({
    id: "dinner", label: "Dinner",
    food: shred ? d.dinner[0].replace("3 phulkas", "2 phulkas") + (d.dinner[0].includes("phulka") ? " (Shred portion)" : "") : d.dinner[0],
    kcal: shred && d.dinner[0].includes("3 phulkas") ? d.dinner[1] - 90 : d.dinner[1], p: d.dinner[2],
  });
  return meals;
};

// ---------- date helpers ----------
const toKey = (dt) =>
  `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
const startDate = () => new Date(START.y, START.m, START.d);
const endDate = () => new Date(END.y, END.m, END.d);
const clampDate = (dt) => { const s = startDate(), e = endDate(); return dt < s ? s : dt > e ? e : dt; };
const dayNumber = (dt) =>
  Math.floor((new Date(dt.getFullYear(), dt.getMonth(), dt.getDate()) - startDate()) / 86400000) + 1;
const phaseOf = (dt) => {
  const m = dt.getMonth(), y = dt.getFullYear();
  if (y === 2026 && (m === 6 || m === 7)) return { n: 1, name: "FOUNDATION", note: "Master form. Learn the stance. Cardio: 20-min walk ×4/wk." };
  if (y === 2026 && m >= 8 && m <= 10) return { n: 2, name: "BUILD", note: "Heavier lifts (6–8 reps). Bag work begins. +1 HIIT/wk." };
  return { n: 3, name: "SHRED", note: "~1,900 kcal (portions auto-adjusted below). Fight days = HIIT. 8–10k steps daily." };
};
const fmtDate = (dt) =>
  dt.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });

const emptyDay = () => ({ meals: {}, workout: false, fight: false, water: 0, weight: "" });

const isDayComplete = (rec, dow) => {
  if (!rec) return false;
  const needed = buildMeals(dow, 1).map((m) => m.id);
  const mealsDone = needed.every((id) => rec.meals && rec.meals[id]);
  const workoutDone = dow === 0 ? true : rec.workout;
  return mealsDone && workoutDone;
};

// ---------- app ----------
export default function GrindLog() {
  const [data, setData] = useState({ days: {} });
  const [loaded, setLoaded] = useState(false);
  const [saveErr, setSaveErr] = useState(false);
  const [view, setView] = useState(() => clampDate(new Date()));
  const [showLifts, setShowLifts] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await window.storage.get(STORAGE_KEY);
        if (res && res.value) setData(JSON.parse(res.value));
      } catch (e) { /* first run */ }
      setLoaded(true);
    })();
  }, []);

  const persist = useCallback(async (next) => {
    setData(next);
    try {
      await window.storage.set(STORAGE_KEY, JSON.stringify(next));
      setSaveErr(false);
    } catch (e) { setSaveErr(true); }
  }, []);

  const key = toKey(view);
  const rec = data.days[key] || emptyDay();
  const dow = view.getDay();
  const dayNum = dayNumber(view);
  const phase = phaseOf(view);
  const workout = WORKOUTS[dow];
  const lifts = workout.key ? LIFTS[workout.key][liftPhase(phase.n)] : [];
  const isFightDay = FIGHT_DAYS.includes(dow);
  const fight = FIGHT[phase.n];
  const meals = buildMeals(dow, phase.n);
  const daysLeft = TOTAL_DAYS - dayNumber(clampDate(new Date()));

  const update = (patch) => {
    const nextRec = { ...emptyDay(), ...rec, ...patch };
    persist({ ...data, days: { ...data.days, [key]: nextRec } });
  };
  const toggleMeal = (id) => update({ meals: { ...rec.meals, [id]: !rec.meals?.[id] } });

  // ----- stats -----
  const today = clampDate(new Date());
  const elapsed = dayNumber(today);
  let completedDays = 0, workoutsDone = 0, fightsDone = 0;
  Object.entries(data.days).forEach(([k, r]) => {
    const [y, m, d] = k.split("-").map(Number);
    const dt = new Date(y, m - 1, d);
    if (r.workout) workoutsDone++;
    if (r.fight) fightsDone++;
    if (isDayComplete(r, dt.getDay())) completedDays++;
  });
  let streak = 0;
  for (let i = 0; i < TOTAL_DAYS; i++) {
    const dt = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
    if (dt < startDate()) break;
    const r = data.days[toKey(dt)];
    if (isDayComplete(r, dt.getDay())) streak++;
    else if (i === 0) continue;
    else break;
  }

  const proteinIn = meals.reduce((s, m) => s + (rec.meals?.[m.id] ? m.p : 0), 0);
  const kcalIn = meals.reduce((s, m) => s + (rec.meals?.[m.id] ? m.kcal : 0), 0);

  const weights = Object.entries(data.days)
    .filter(([, r]) => r.weight !== "" && r.weight != null && !isNaN(parseFloat(r.weight)))
    .map(([k, r]) => ({ k, w: parseFloat(r.weight) }))
    .sort((a, b) => (a.k < b.k ? -1 : 1));
  const latestW = weights.length ? weights[weights.length - 1].w : null;

  const move = (delta) =>
    setView((v) => clampDate(new Date(v.getFullYear(), v.getMonth(), v.getDate() + delta)));

  if (!loaded)
    return (
      <div style={{ minHeight: "100vh", background: C.bg, color: C.dim, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT_BODY }}>
        Loading your grind log…
      </div>
    );

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.bone, fontFamily: FONT_BODY, paddingBottom: 48 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=IBM+Plex+Sans:wght@400;600;700&display=swap');
        button { cursor: pointer; }
        button:focus-visible, input:focus-visible { outline: 2px solid ${C.gold}; outline-offset: 2px; }
        @media (prefers-reduced-motion: reduce) { * { transition: none !important; } }
      `}</style>

      <div style={{ maxWidth: 520, margin: "0 auto", padding: "20px 16px" }}>
        {/* ---- header ---- */}
        <div style={{ borderBottom: `1px solid ${C.line}`, paddingBottom: 16, marginBottom: 16 }}>
          <div style={{ fontSize: 11, letterSpacing: "0.25em", color: C.dim, fontWeight: 700 }}>
            GRIND LOG — GOVARDHAN · LIFT + FIGHT · DAIRY-FREE
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginTop: 6 }}>
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
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6, marginBottom: 16 }}>
          <Stat label="STREAK" value={`${streak}d`} color={streak >= 7 ? C.gold : C.bone} />
          <Stat label="LIFTS" value={workoutsDone} color={C.bone} />
          <Stat label="FIGHTS" value={fightsDone} color={C.bone} />
          <Stat label="ADHERE" value={`${elapsed > 0 ? Math.round((completedDays / elapsed) * 100) : 0}%`} color={C.bone} />
        </div>

        {/* ---- nav ---- */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <NavBtn onClick={() => move(-1)} disabled={dayNum <= 1}>◀ Prev</NavBtn>
          <NavBtn onClick={() => setView(clampDate(new Date()))} accent>Today</NavBtn>
          <NavBtn onClick={() => move(1)} disabled={dayNum >= TOTAL_DAYS}>Next ▶</NavBtn>
        </div>

        {/* ---- gym session ---- */}
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 11, letterSpacing: "0.2em", color: C.dim, fontWeight: 700 }}>GYM SESSION</div>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 26, marginTop: 4, color: workout.rest ? C.dim : C.bone }}>
                {workout.name}
              </div>
            </div>
            {!workout.rest && (
              <button
                onClick={() => update({ workout: !rec.workout })}
                style={{
                  background: rec.workout ? C.green : "transparent",
                  color: rec.workout ? "#0B0F15" : C.bone,
                  border: `2px solid ${rec.workout ? C.green : C.line}`,
                  borderRadius: 8, padding: "12px 16px", fontWeight: 700, fontSize: 13, minWidth: 92, transition: "all .15s",
                }}
              >
                {rec.workout ? "✓ DONE" : "Mark done"}
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
                {showLifts ? "▾ Hide exercises" : "▸ Show exercises"}
              </button>
              {showLifts && (
                <div style={{ marginTop: 6, borderTop: `1px solid ${C.line}`, paddingTop: 8 }}>
                  {lifts.map(([name, sets], i) =>
                    sets === "" ? (
                      <div key={i} style={{ fontSize: 10, letterSpacing: "0.2em", color: C.ember, fontWeight: 700, margin: "10px 0 2px" }}>{name}</div>
                    ) : (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "5px 0", borderBottom: `1px dashed ${C.line}` }}>
                        <span>{name}</span>
                        <span style={{ color: C.dim, flexShrink: 0, marginLeft: 12 }}>{sets}</span>
                      </div>
                    )
                  )}
                  <div style={{ fontSize: 11, color: C.dim, marginTop: 8 }}>
                    Overload rule: hit the top reps on all sets → +2.5 kg next time. Log every lift in your notebook.
                  </div>
                </div>
              )}
            </>
          )}
        </Card>

        {/* ---- fight session ---- */}
        {isFightDay && (
          <Card highlight>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: 11, letterSpacing: "0.2em", color: C.ember, fontWeight: 700 }}>🥊 FIGHT TRAINING (evening / after gym)</div>
                <div style={{ fontFamily: FONT_DISPLAY, fontSize: 22, marginTop: 4 }}>{fight.title}</div>
              </div>
              <button
                onClick={() => update({ fight: !rec.fight })}
                style={{
                  background: rec.fight ? C.green : "transparent",
                  color: rec.fight ? "#0B0F15" : C.bone,
                  border: `2px solid ${rec.fight ? C.green : C.line}`,
                  borderRadius: 8, padding: "12px 16px", fontWeight: 700, fontSize: 13, minWidth: 92, transition: "all .15s",
                }}
              >
                {rec.fight ? "✓ DONE" : "Mark done"}
              </button>
            </div>
            <div style={{ marginTop: 8, borderTop: `1px solid ${C.line}`, paddingTop: 8 }}>
              {fight.drills.map(([name, sets], i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "5px 0", borderBottom: `1px dashed ${C.line}` }}>
                  <span>{name}</span>
                  <span style={{ color: C.dim, flexShrink: 0, marginLeft: 12 }}>{sets}</span>
                </div>
              ))}
              <div style={{ fontSize: 11, color: C.gold, marginTop: 8 }}>{fight.note}</div>
            </div>
          </Card>
        )}

        {/* ---- meals ---- */}
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <div style={{ fontSize: 11, letterSpacing: "0.2em", color: C.dim, fontWeight: 700 }}>
              MEALS — {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"][dow]} (dairy-free)
            </div>
            <div style={{ fontSize: 12, color: C.dim }}>{kcalIn} kcal logged</div>
          </div>
          {meals.map((m) => {
            const done = !!rec.meals?.[m.id];
            return (
              <button
                key={m.id}
                onClick={() => toggleMeal(m.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 12, width: "100%", textAlign: "left",
                  background: done ? C.panel2 : "transparent", border: `1px solid ${done ? C.green : C.line}`,
                  borderRadius: 8, padding: "10px 12px", marginTop: 10, color: C.bone, transition: "all .15s",
                }}
              >
                <span style={{
                  width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                  border: `2px solid ${done ? C.green : C.dim}`,
                  background: done ? C.green : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#0B0F15", fontWeight: 700, fontSize: 14,
                }}>{done ? "✓" : ""}</span>
                <span style={{ flex: 1 }}>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{m.label}</span>
                  <span style={{ display: "block", fontSize: 11, color: C.dim, lineHeight: 1.4 }}>{m.food}</span>
                </span>
                <span style={{ fontSize: 11, color: C.dim, textAlign: "right", flexShrink: 0 }}>
                  {m.kcal} kcal<br />{m.p}g P
                </span>
              </button>
            );
          })}
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
            <div style={{ fontSize: 11, letterSpacing: "0.2em", color: C.dim, fontWeight: 700 }}>WATER</div>
            <div style={{ fontSize: 12, color: C.dim }}>{((rec.water || 0) * 0.5).toFixed(1)} / 4.0 L</div>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
            {Array.from({ length: 8 }).map((_, i) => {
              const filled = i < (rec.water || 0);
              return (
                <button
                  key={i}
                  aria-label={`Glass ${i + 1}`}
                  onClick={() => update({ water: filled && i === (rec.water || 0) - 1 ? i : i + 1 })}
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
          <div style={{ fontSize: 11, letterSpacing: "0.2em", color: dow === 6 ? C.gold : C.dim, fontWeight: 700 }}>
            {dow === 6 ? "★ SATURDAY WEIGH-IN (empty stomach)" : "WEIGHT (optional — Saturdays official)"}
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 10, alignItems: "center" }}>
            <input
              type="number" inputMode="decimal" step="0.1" placeholder="e.g. 81.0"
              value={rec.weight}
              onChange={(e) => update({ weight: e.target.value })}
              style={{ background: C.panel2, border: `1px solid ${C.line}`, borderRadius: 8, color: C.bone, padding: "10px 12px", fontSize: 16, width: 120, fontFamily: FONT_BODY }}
            />
            <span style={{ fontSize: 13, color: C.dim }}>kg · target 72–74</span>
          </div>
          {weights.length > 0 && (
            <div style={{ marginTop: 12, borderTop: `1px solid ${C.line}`, paddingTop: 10 }}>
              <div style={{ fontSize: 11, color: C.dim, fontWeight: 700, letterSpacing: "0.15em" }}>LOG</div>
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

        {saveErr && (
          <div style={{ background: "#3A1B1B", border: `1px solid ${C.ember}`, borderRadius: 8, padding: 10, fontSize: 12, marginTop: 4 }}>
            Couldn't save your last change. Check your connection and tap anything again to retry.
          </div>
        )}

        <div style={{ textAlign: "center", fontSize: 11, color: C.dim, marginTop: 20, lineHeight: 1.7 }}>
          Never miss two in a row. Discipline &gt; motivation.<br />
          If any pain feels sharp (not sore), rest it and see a doctor — heroes recover, they don't break.<br />
          Data saves automatically to your Claude account.
        </div>
      </div>
    </div>
  );
}

// ---------- components ----------
function Card({ children, highlight }) {
  return (
    <div style={{ background: C.panel, border: `1px solid ${highlight ? C.gold : C.line}`, borderRadius: 12, padding: 16, marginBottom: 14 }}>
      {children}
    </div>
  );
}
function Stat({ label, value, color }) {
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 10, padding: "10px 4px", textAlign: "center" }}>
      <div style={{ fontFamily: FONT_DISPLAY, fontSize: 18, color }}>{value}</div>
      <div style={{ fontSize: 8, letterSpacing: "0.2em", color: C.dim, fontWeight: 700, marginTop: 2 }}>{label}</div>
    </div>
  );
}
function NavBtn({ children, onClick, disabled, accent }) {
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
