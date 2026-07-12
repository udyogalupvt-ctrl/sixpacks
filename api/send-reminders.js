// Scheduled push sender — hit this every 10–15 min by a cron
// (GitHub Actions workflow included: .github/workflows/reminders.yml).
//
// Required env vars (Vercel → Project Settings → Environment Variables):
//   FIREBASE_SERVICE_ACCOUNT  — full service-account JSON (one line)
//   CRON_SECRET               — any long random string; the cron must send it
//
// For each schedule entry whose start/end fell in the last WINDOW minutes:
//   start → push "time to start" to every registered device
//   end   → push ONLY if the task is not marked done in Firestore
// Every send is logged in users/{uid}/meta/notifLog so retries never duplicate.

import crypto from "node:crypto";
// Modular imports — the `import admin from "firebase-admin"` default leaves
// admin.credential/.firestore/.messaging undefined under ESM (which Vercel runs).
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getMessaging } from "firebase-admin/messaging";
import { REMINDERS, toMins, isEntryDone, startMessage, endMessage } from "../src/schedule.js";
import { emptyDay } from "../src/plan.js";

const WINDOW_MIN = 16;
const IST_OFFSET_MS = 330 * 60000; // UTC+5:30

function initAdmin() {
  if (!getApps().length) {
    const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    initializeApp({ credential: cert(sa) });
  }
}

export default async function handler(req, res) {
  // Header-only auth (a ?key= fallback would leak the secret into request
  // logs) with a constant-time comparison via fixed-length digests.
  const secret = process.env.CRON_SECRET;
  const header = req.headers.authorization || "";
  const given = header.startsWith("Bearer ") ? header.slice(7) : "";
  const digest = (s) => crypto.createHash("sha256").update(s).digest();
  if (!secret || !given || !crypto.timingSafeEqual(digest(given), digest(secret))) {
    return res.status(401).json({ error: "unauthorized" });
  }
  if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
    return res.status(500).json({ error: "FIREBASE_SERVICE_ACCOUNT env var not set" });
  }

  initAdmin();
  const db = getFirestore();
  const messaging = getMessaging();

  // Vercel functions run in UTC, so a UTC+5:30-shifted Date reads out IST
  // components through plan.js's local getters.
  const now = new Date(Date.now() + IST_OFFSET_MS);
  const dow = now.getUTCDay();
  const mins = now.getUTCHours() * 60 + now.getUTCMinutes();
  const pad = (n) => String(n).padStart(2, "0");
  const dateKey = `${now.getUTCFullYear()}-${pad(now.getUTCMonth() + 1)}-${pad(now.getUTCDate())}`;

  const due = [];
  for (const entry of REMINDERS) {
    if (!entry.days.includes(dow)) continue;
    for (const phase of ["start", "end"]) {
      if (phase === "start" && entry.endOnly) continue;
      const t = entry[phase];
      if (!t) continue;
      const tm = toMins(t);
      if (mins >= tm && mins - tm < WINDOW_MIN) due.push({ entry, phase });
    }
  }
  if (!due.length) return res.json({ ok: true, due: 0, sent: 0 });

  const users = await db.collection("users").get();
  let sent = 0;

  for (const snap of users.docs) {
    const u = snap.data();
    const tokens = Array.isArray(u.fcmTokens) ? u.fcmTokens : [];
    if (!tokens.length) continue;

    const rec = { ...emptyDay(), ...(u.days?.[dateKey] || {}) };
    const logRef = db.doc(`users/${snap.id}/meta/notifLog`);
    const log = (await logRef.get()).data() || {};
    const updates = {};

    for (const { entry, phase } of due) {
      const k = `${dateKey}:${entry.id}:${phase}`;
      if (log[k]) continue;
      if (phase === "end" && isEntryDone(entry, now, rec)) { updates[k] = "done"; continue; }

      const msg = phase === "start" ? startMessage(entry, now) : endMessage(entry);
      for (const token of tokens) {
        try {
          await messaging.send({
            token,
            notification: { title: msg.title, body: msg.body },
            webpush: {
              fcmOptions: { link: "/" },
              notification: { icon: "/icon.png", badge: "/icon.png" },
            },
          });
          sent++;
        } catch (err) {
          if (
            err.code === "messaging/registration-token-not-registered" ||
            err.code === "messaging/invalid-argument"
          ) {
            await snap.ref.update({ fcmTokens: FieldValue.arrayRemove(token) });
          }
        }
      }
      updates[k] = "sent";
    }

    if (Object.keys(updates).length) await logRef.set(updates, { merge: true });
  }

  res.json({ ok: true, due: due.length, sent });
}
