// Daily reminder schedule built around the real routine:
//   day starts with fight training → work 10:00–18:00 → gym 18:00–21:00.
// Every entry can fire a notification at its START, and at its END a
// check runs against the logged data — if the task isn't ticked in the
// platform, a "not marked done" reminder fires.
// This module is pure JS (no browser/env references) so the same logic
// runs in the app AND in the server push endpoint (api/send-reminders.js).

import {
  WORKOUTS, buildMeals, phaseOf,
  fightBlockFor, SESSION_TYPE, SESSION_LABEL,
  gymDoneFor, fightDoneFor, isDayComplete,
} from "./plan.js";

const ALL = [0, 1, 2, 3, 4, 5, 6];
const GYM_DAYS = [1, 2, 3, 4, 5, 6]; // Mon–Sat (Sunday = rest)
const FIGHT_DAYS = [1, 3, 5];

export const TIMEZONE = "Asia/Kolkata";

export const REMINDERS = [
  // Morning fight block (5–8 window): warm-up is part of the session.
  { id: "fight",  icon: "🥊", label: "Fight training",   days: FIGHT_DAYS, start: "05:30", end: "07:30", check: "fight" },
  { id: "bfast",  icon: "🍳", label: "Breakfast",        days: ALL,        start: "08:30", end: "09:15", check: "meal:bfast" },
  { id: "lunch",  icon: "🍛", label: "Lunch",            days: ALL,        start: "13:00", end: "14:00", check: "meal:lunch" },
  { id: "snack",  icon: "🥜", label: "Snack",            days: ALL,        start: "16:30", end: "17:00", check: "meal:snack" },
  { id: "pre",    icon: "🍌", label: "Pre-workout fuel", days: GYM_DAYS,   start: "17:15", end: "17:45", check: "meal:pre" },
  { id: "gym",    icon: "🏋️", label: "Gym session",      days: GYM_DAYS,   start: "18:00", end: "21:00", check: "gym" },
  { id: "post",   icon: "🥤", label: "Post-workout fuel", days: GYM_DAYS,  start: "21:00", end: "21:30", check: "meal:post" },
  { id: "dinner", icon: "🍽️", label: "Dinner",           days: ALL,        start: "21:30", end: "22:15", check: "meal:dinner" },
  { id: "daycheck", icon: "🔥", label: "Full-day check", days: ALL,        start: "22:30", end: "22:35", check: "day", endOnly: true },
];

export const toMins = (hhmm) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

// Is this entry's task marked complete in the given day record?
export const isEntryDone = (entry, dt, rec) => {
  if (!entry.check) return true;
  if (entry.check === "gym") return gymDoneFor(dt, rec);
  if (entry.check === "fight") return fightDoneFor(dt, rec);
  if (entry.check === "day") return isDayComplete(rec, dt);
  if (entry.check.startsWith("meal:")) {
    const id = entry.check.slice(5);
    // Meal not on today's plan (e.g. pre-workout on Sunday) counts as done.
    if (!buildMeals(dt.getDay(), phaseOf(dt).n).some((m) => m.id === id)) return true;
    return !!rec?.meals?.[id];
  }
  return true;
};

export const startMessage = (entry, dt) => {
  let body;
  if (entry.check === "gym") {
    body = `${WORKOUTS[dt.getDay()].name} + treadmill cardio. The 6–9 window starts now — log every lift.`;
  } else if (entry.check === "fight") {
    const block = fightBlockFor(dt);
    const label = SESSION_LABEL[SESSION_TYPE[dt.getDay()]];
    body = `${block.title} — ${label} day. Warm up first (rope + mobility), then work. Win the morning before the startup owns your day.`;
  } else if (entry.check?.startsWith("meal:")) {
    const meal = buildMeals(dt.getDay(), phaseOf(dt).n).find((m) => m.id === entry.check.slice(5));
    body = meal ? meal.food : "Fuel on schedule.";
  } else {
    body = "On schedule. Move.";
  }
  return { title: `${entry.icon} ${entry.label} — ${entry.start}`, body };
};

export const endMessage = (entry) => {
  if (entry.check === "day") {
    return {
      title: "🔥 Day check — pillars unchecked",
      body: "Today isn't fully logged in Grind Log. Tick what you did — never miss two in a row.",
    };
  }
  return {
    title: `⚠️ ${entry.label} not logged`,
    body: `${entry.label} window ended and it's not marked done in Grind Log. Finish it or tick it off now.`,
  };
};
