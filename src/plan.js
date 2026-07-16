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

// ---------- FIGHT TRAINING (morning session, ~05:30–07:30) ----------
// A real 27-week curriculum: the block changes every 3 weeks, and each fight
// day trains a different quality — Mon = technique, Wed = drills & bag,
// Fri = conditioning. You are never repeating "FIGHT BASICS" for two months.
// Every session = WARM-UP → MAIN WORK → COOL-DOWN.

export const SESSION_TYPE = { 1: "technique", 3: "drills", 5: "conditioning" };
export const SESSION_LABEL = {
  technique: "TECHNIQUE",
  drills: "DRILLS & BAG",
  conditioning: "CONDITIONING",
};

// Warm-up scales with the block tier (1 = early, 2 = mid, 3 = late).
const FIGHT_WARMUP = {
  1: [["Rope skipping", "3 × 2 min"], ["Neck + joint rotations", "3 min"], ["Dynamic stretch (hips, shoulders)", "5 min"], ["Loose shadowboxing", "2 × 2 min"]],
  2: [["Rope skipping", "4 × 3 min"], ["Neck bridges (light) + rotations", "4 min"], ["Dynamic stretch + hip openers", "5 min"], ["Shadowboxing (loose)", "3 × 2 min"]],
  3: [["Rope skipping (add double-unders)", "5 × 3 min"], ["Neck + core activation", "5 min"], ["Dynamic stretch", "5 min"], ["Shadowboxing (fast hands)", "3 × 3 min"]],
};

const COOLDOWN = [["Cool-down: stretch + breathing", "10 min"]];

export const FIGHT_BLOCKS = [
  {
    weeks: [1, 3], tier: 1, title: "FOUNDATION — STANCE & GUARD",
    note: "Gapryong didn't start with a knockout. Learn to stand before you learn to strike.",
    technique: [["Orthodox stance holds", "5 × 1 min"], ["Guard position (elbows in, chin down)", "10 min"], ["Jab from stance", "4 × 20"], ["Step-drag footwork", "10 min"]],
    drills: [["Mirror footwork (fwd/back/lateral)", "4 × 2 min"], ["Jab–cross on air", "5 × 20"], ["Pivot drills", "3 × 10 / side"], ["Shadowbox (jab only)", "4 × 2 min"]],
    conditioning: [["Shadowbox rounds", "5 × 2 min"], ["Burpees", "3 × 10"], ["Plank", "3 × 45 s"], ["Bodyweight squats", "3 × 20"]],
  },
  {
    weeks: [4, 6], tier: 1, title: "THE JAB & CROSS",
    note: "The jab wins fights. Snap it out, snap it back — never leave it hanging.",
    technique: [["Jab mechanics (snap + return)", "5 × 20"], ["Cross with hip rotation", "5 × 20"], ["1–2 combo", "6 × 15"], ["Range finding vs wall", "10 min"]],
    drills: [["1–2 on bag / air", "6 × 2 min"], ["Jab while circling", "4 × 2 min"], ["Double jab → cross", "5 × 15"], ["Shadowbox (1–2 focus)", "5 × 2 min"]],
    conditioning: [["Sprawls", "4 × 10"], ["Shadowbox rounds", "6 × 2 min"], ["Push-up + shoulder tap", "3 × 20"], ["Mountain climbers", "3 × 30 s"]],
  },
  {
    weeks: [7, 9], tier: 1, title: "HOOKS, UPPERCUTS & COMBOS",
    note: "Now the arsenal opens. Power comes from the ground and the hips — not the arm.",
    technique: [["Lead hook mechanics", "5 × 15"], ["Rear uppercut", "5 × 15"], ["1–2–3 combo", "6 × 12"], ["Body hook", "4 × 15"]],
    drills: [["1–2–3–2 combos", "6 × 2 min"], ["Bag work (combinations)", "5 × 2 min"], ["Level change + body shot", "4 × 12"], ["Shadowbox (full arsenal)", "5 × 2 min"]],
    conditioning: [["Heavy bag power rounds", "5 × 2 min"], ["Burpee + sprawl", "4 × 10"], ["Russian twists", "3 × 30"], ["Jump squats", "3 × 15"]],
  },
  {
    weeks: [10, 12], tier: 2, title: "DEFENSE — SLIP, ROLL, COUNTER",
    note: "Gun Park doesn't get hit. Hitting is half the game — not being there is the other half.",
    technique: [["Slip (inside / outside)", "5 × 20"], ["Roll under", "5 × 20"], ["Parry + counter", "5 × 15"], ["Catch + return", "4 × 15"]],
    drills: [["Slip-rope drill", "4 × 3 min"], ["Slip → counter 1–2", "6 × 12"], ["Bag defense circle", "5 × 2 min"], ["Shadowbox (defense focus)", "6 × 2 min"]],
    conditioning: [["Defensive rounds (slip + move)", "6 × 2 min"], ["Burpees", "4 × 12"], ["Plank + shoulder tap", "3 × 45 s"], ["Sprint intervals", "6 × 30 s"]],
  },
  {
    weeks: [13, 15], tier: 2, title: "KICKS & DISTANCE",
    note: "Control the distance and you control the fight. Check the kick or wear it.",
    technique: [["Teep / front kick", "5 × 15 / leg"], ["Low roundhouse kick", "5 × 15 / leg"], ["Checking kicks", "4 × 10"], ["Distance in-and-out drill", "10 min"]],
    drills: [["Kick–punch combos", "6 × 2 min"], ["Bag kicks (power)", "5 × 2 min"], ["Distance management (in-out)", "5 × 2 min"], ["Shadowbox with kicks", "5 × 2 min"]],
    conditioning: [["Kick rounds on bag", "6 × 2 min"], ["Jump lunges", "3 × 20"], ["Burpees", "4 × 12"], ["Core circuit", "3 rounds"]],
  },
  {
    weeks: [16, 18], tier: 2, title: "POWER — HEAVY BAG",
    note: "James Lee built the body. Now build the shot that ends it. Drive from the floor.",
    technique: [["Power cross (hip drive)", "5 × 12"], ["Hook power mechanics", "5 × 12"], ["Body–head combination", "6 × 12"], ["Clinch posture basics", "10 min"]],
    drills: [["Heavy bag power rounds", "6 × 3 min"], ["Combo ladder (2→4→6 punches)", "5 × 2 min"], ["Bag + footwork", "5 × 2 min"], ["Knee strikes in clinch", "4 × 15"]],
    conditioning: [["All-out bag rounds", "6 × 2 min"], ["Burpee finisher", "4 × 15"], ["Weighted core", "3 × 20"], ["Farmer walk", "3 × 40 m"]],
  },
  {
    weeks: [19, 21], tier: 3, title: "SPEED & REACTION",
    note: "Slow is smooth, smooth is fast — you earned smooth. Now get fast.",
    technique: [["Speed jabs", "6 × 30 s"], ["Reaction drill (wall ball / partner)", "10 min"], ["Counter off the jab", "6 × 12"], ["Feint + strike", "5 × 15"]],
    drills: [["Speed rounds (hands only)", "6 × 2 min"], ["Shadowbox sprint rounds", "6 × 90 s"], ["Combo reaction on bag", "5 × 2 min"], ["Footwork ladder", "10 min"]],
    conditioning: [["HIIT rounds (30 s on / 30 s off)", "10 rounds"], ["Burpee + sprawl", "4 × 15"], ["Core circuit", "4 rounds"], ["Skipping sprints", "5 × 1 min"]],
  },
  {
    weeks: [22, 24], tier: 3, title: "FIGHT CONDITIONING",
    note: "Technique dies when the lungs die. Train tired — that's where the real fight lives.",
    technique: [["Technique under fatigue", "5 × 2 min"], ["Clinch + knees", "5 × 15"], ["Counter combinations", "6 × 12"], ["Movement drills", "10 min"]],
    drills: [["Bag rounds (high volume)", "8 × 2 min"], ["Combo + defense flow", "6 × 2 min"], ["Sprawl + strike", "5 × 10"], ["Shadowbox rounds", "6 × 3 min"]],
    conditioning: [["Fight-pace rounds", "8 × 3 min"], ["Burpees", "5 × 15"], ["Sprints", "8 × 30 s"], ["Core finisher", "4 rounds"]],
  },
  {
    weeks: [25, 27], tier: 3, title: "PEAK — ROUNDS & SPARRING",
    note: "This is the man you set out to become. Spar ONLY under a coach — never untrained.",
    technique: [["Full-round shadow (all tools)", "6 × 3 min"], ["Space / ring control", "10 min"], ["Counters + angles", "6 × 12"], ["Clinch escapes", "5 × 10"]],
    drills: [["Controlled sparring (COACH ONLY)", "5 × 3 min"], ["Heavy bag championship rounds", "6 × 3 min"], ["Pad work", "6 × 3 min"], ["Reaction + counter", "5 × 2 min"]],
    conditioning: [["Fight simulation rounds", "5 × 3 min"], ["Max burpees", "5 × 20"], ["Sprint finisher", "10 × 30 s"], ["Full core circuit", "5 rounds"]],
  },
];

// Which 3-week block is this date in? (week 1 = days 1–7)
export const fightBlockFor = (dt) => {
  const w = Math.max(1, Math.ceil(dayNumber(dt) / 7));
  return FIGHT_BLOCKS.find((b) => w >= b.weeks[0] && w <= b.weeks[1]) || FIGHT_BLOCKS[FIGHT_BLOCKS.length - 1];
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

export const getGymOffset = (dt, days = {}) => {
  let offset = 0;
  const targetKey = toKey(dt);
  Object.entries(days).forEach(([k, r]) => {
    if (k < targetKey && r.passGym) offset++;
  });
  return offset;
};

export const getFightOffset = (dt, days = {}) => {
  let offset = 0;
  const targetKey = toKey(dt);
  Object.entries(days).forEach(([k, r]) => {
    if (k < targetKey && r.passFight) offset++;
  });
  return offset;
};

// ---------- per-day session item lists ----------
// Gym session items (lifts + cardio) for a given date. Header rows have id: null.
export const gymItemsFor = (dt, days = {}) => {
  const offset = getGymOffset(dt, days);
  const effectiveDt = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate() - offset);
  const workout = WORKOUTS[effectiveDt.getDay()];
  if (!workout.key) return [];
  const phase = phaseOf(dt);
  const items = LIFTS[workout.key][liftPhase(phase.n)].map(([name, sets], i) =>
    sets === "" ? { id: null, header: name } : { id: `g${i}`, name, sets }
  );
  items.push({ id: "cardio", name: "🏃 Cardio — Treadmill", sets: null, sub: CARDIO_BY_PHASE[phase.n] });
  return items;
};

// Fight session for a given date ([] on non-fight days).
// Structure: WARM-UP → today's MAIN work (technique / drills / conditioning)
// → COOL-DOWN. Header rows have id: null, like the gym card.
export const fightItemsFor = (dt, days = {}) => {
  const offset = getFightOffset(dt, days);
  const effectiveDt = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate() - offset);
  if (!FIGHT_DAYS.includes(effectiveDt.getDay())) return [];
  const block = fightBlockFor(dt);
  const type = SESSION_TYPE[effectiveDt.getDay()];
  const rows = [];
  const section = (header, list) => {
    rows.push({ id: null, header });
    list.forEach(([name, sets]) => rows.push({ name, sets }));
  };
  section("WARM-UP", FIGHT_WARMUP[block.tier]);
  section(SESSION_LABEL[type], block[type]);
  section("COOL-DOWN", COOLDOWN);
  return rows.map((r, i) => (r.id === null ? r : { ...r, id: `f${i}` }));
};

const allChecked = (ids, map) => ids.length > 0 && ids.every((id) => map?.[id]);

export const gymDoneFor = (dt, rec, days = {}) => {
  if (rec?.passGym) return true;
  const ids = gymItemsFor(dt, days).filter((x) => x.id).map((x) => x.id);
  return ids.length === 0 ? true : allChecked(ids, rec?.gym);
};
export const fightDoneFor = (dt, rec, days = {}) => {
  if (rec?.passFight) return true;
  const ids = fightItemsFor(dt, days).map((x) => x.id);
  return ids.length === 0 ? true : allChecked(ids, rec?.fight);
};

// A day counts toward progress when meals + gym session (incl. cardio) +
// fight training (on fight days) + water are all done. Weight is optional.
export const isDayComplete = (rec, dt, days = {}) => {
  if (!rec) return false;
  const mealIds = buildMeals(dt.getDay(), 1).map((m) => m.id);
  const mealsDone = mealIds.every((id) => rec.meals && rec.meals[id]);
  const waterDone = (rec.water || 0) >= WATER_TARGET;
  return mealsDone && gymDoneFor(dt, rec, days) && fightDoneFor(dt, rec, days) && waterDone;
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
