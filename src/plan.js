// ---------- constants ----------
export const START = { y: 2026, m: 6, d: 12 }; // Jul 12 2026
export const END = { y: 2027, m: 0, d: 12 };   // Jan 12 2027
export const TOTAL_DAYS = 185;
export const PROTEIN_TARGET = 150;
export const WATER_TARGET = 8; // glasses of 0.5 L
export const FIGHT_DAYS = [1, 3, 5]; // Mon, Wed, Fri

// ---------- WORKOUT PLAN (full detail, per phase) ----------
export const LIFTS = {
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
export const liftPhase = (n) => (n === 1 ? 1 : 2); // phase 2 & 3 lift the same

// Cardio is part of every gym session (treadmill available in the gym)
export const CARDIO_BY_PHASE = {
  1: "Treadmill 15–20 min (brisk walk / light incline)",
  2: "Treadmill 20 min (steady jog or incline walk)",
  3: "Treadmill 20–25 min (incline / intervals — shred fuel)",
};

export const FIGHT = {
  1: {
    title: "FIGHT BASICS",
    drills: [["Rope skipping", "3 × 3 min"], ["Stance + footwork drills", "10 min"], ["Shadowboxing (jab, cross)", "4 × 2 min rounds"], ["Wall push + neck bridges (light)", "2 × 10"]],
    note: "Learn the stance before the punch. Slow is smooth, smooth is fast.",
  },
  2: {
    title: "FIGHT SKILLS",
    drills: [["Rope skipping", "3 × 3 min"], ["Shadowboxing (add hooks, uppercuts, front kick)", "6 × 2 min rounds"], ["Heavy bag (if available)", "4 × 2 min"], ["Footwork ladder / pivots", "10 min"]],
    note: "Join a local boxing/karate/MMA academy if you can — a coach beats any app.",
  },
  3: {
    title: "FIGHT CONDITIONING",
    drills: [["Rope skipping", "4 × 3 min"], ["Shadowboxing (full combos)", "6 × 2 min rounds"], ["Heavy bag power rounds", "4 × 2 min"], ["Burpee + sprawl finisher", "3 × 10"]],
    note: "This doubles as your Phase-3 HIIT. Spar only under a coach — never untrained.",
  },
};

export const WORKOUTS = {
  0: { name: "REST DAY", key: null, rest: true, detail: "Recovery. Walk, stretch, sleep. Gapryong rested too." },
  1: { name: "PUSH", key: "push" },
  2: { name: "PULL", key: "pull" },
  3: { name: "LEGS + ABS", key: "legs" },
  4: { name: "PUSH", key: "push" },
  5: { name: "PULL", key: "pull" },
  6: { name: "LEGS + ABS", key: "legs" },
};

// ---------- DIET (100% dairy-free) ----------
const PRE = { id: "pre", label: "Pre-workout", food: "1 banana + black coffee (no sugar)", kcal: 110, p: 1, gym: true };
const POST = { id: "post", label: "Post-workout", food: "Plant protein scoop (pea/soy, water) + 1 banana — OR 4 egg whites + 1 egg + banana", kcal: 225, p: 24, gym: true };

export const WEEK_DIET = {
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

export const buildMeals = (dow, phaseN) => {
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
export const toKey = (dt) =>
  `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
export const startDate = () => new Date(START.y, START.m, START.d);
export const endDate = () => new Date(END.y, END.m, END.d);
export const clampDate = (dt) => { const s = startDate(), e = endDate(); return dt < s ? s : dt > e ? e : dt; };
export const dayNumber = (dt) =>
  Math.floor((new Date(dt.getFullYear(), dt.getMonth(), dt.getDate()) - startDate()) / 86400000) + 1;
export const phaseOf = (dt) => {
  const m = dt.getMonth(), y = dt.getFullYear();
  if (y === 2026 && (m === 6 || m === 7)) return { n: 1, name: "FOUNDATION", note: "Master form. Learn the stance. Cardio: 20-min walk ×4/wk." };
  if (y === 2026 && m >= 8 && m <= 10) return { n: 2, name: "BUILD", note: "Heavier lifts (6–8 reps). Bag work begins. +1 HIIT/wk." };
  return { n: 3, name: "SHRED", note: "~1,900 kcal (portions auto-adjusted below). Fight days = HIIT. 8–10k steps daily." };
};
export const fmtDate = (dt) =>
  dt.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });

export const emptyDay = () => ({ meals: {}, gym: {}, fight: {}, water: 0, weight: "", gymWeights: {} });

// Stable Firestore-safe key for an exercise name (used to log kg per lift
// and to look up the last weight used across days/phases).
export const slugOf = (name) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");

// ---------- per-day session item lists ----------
// Gym session items (lifts + cardio) for a given date. Header rows have id: null.
export const gymItemsFor = (dt) => {
  const workout = WORKOUTS[dt.getDay()];
  if (!workout.key) return [];
  const phase = phaseOf(dt);
  const items = LIFTS[workout.key][liftPhase(phase.n)].map(([name, sets], i) =>
    sets === "" ? { id: null, header: name } : { id: `g${i}`, name, sets }
  );
  items.push({ id: "cardio", name: "🏃 Cardio — Treadmill", sets: null, sub: CARDIO_BY_PHASE[phase.n] });
  return items;
};

// Fight training drills for a given date ([] on non-fight days).
export const fightItemsFor = (dt) => {
  if (!FIGHT_DAYS.includes(dt.getDay())) return [];
  const phase = phaseOf(dt);
  return FIGHT[phase.n].drills.map(([name, sets], i) => ({ id: `f${i}`, name, sets }));
};

const allChecked = (ids, map) => ids.length > 0 && ids.every((id) => map?.[id]);

export const gymDoneFor = (dt, rec) => {
  const ids = gymItemsFor(dt).filter((x) => x.id).map((x) => x.id);
  return ids.length === 0 ? true : allChecked(ids, rec?.gym);
};
export const fightDoneFor = (dt, rec) => {
  const ids = fightItemsFor(dt).map((x) => x.id);
  return ids.length === 0 ? true : allChecked(ids, rec?.fight);
};

// A day counts toward progress when meals + gym session (incl. cardio) +
// fight training (on fight days) + water are all done. Weight is optional.
export const isDayComplete = (rec, dt) => {
  if (!rec) return false;
  const mealIds = buildMeals(dt.getDay(), 1).map((m) => m.id);
  const mealsDone = mealIds.every((id) => rec.meals && rec.meals[id]);
  const waterDone = (rec.water || 0) >= WATER_TARGET;
  return mealsDone && gymDoneFor(dt, rec) && fightDoneFor(dt, rec) && waterDone;
};

// ---------- transformation photo slots ----------
export const PHOTO_MONTHS = [
  { key: "2026-07", label: "JUL 2026" },
  { key: "2026-08", label: "AUG 2026" },
  { key: "2026-09", label: "SEP 2026" },
  { key: "2026-10", label: "OCT 2026" },
  { key: "2026-11", label: "NOV 2026" },
  { key: "2026-12", label: "DEC 2026" },
  { key: "2027-01", label: "JAN 2027" },
];

export const IDEALS = [
  { key: "gapryong", label: "GAPRYONG KIM", tag: "The God of Fists" },
  { key: "gun", label: "GUN PARK", tag: "Unmatched pressure" },
  { key: "james", label: "JAMES LEE", tag: "Perfected body" },
];
