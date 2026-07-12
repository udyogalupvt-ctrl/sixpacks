import { useEffect, useRef } from "react";
import { REMINDERS, toMins, isEntryDone, startMessage, endMessage } from "./schedule";
import { toKey, emptyDay } from "./plan";
import { notify } from "./push";

const GRACE_MIN = 12; // fire only within N minutes of the scheduled time
const firedKey = (dateKey, id, phase) => `gl-notif:${dateKey}:${id}:${phase}`;

// In-app reminder engine: while the app is open it checks every 30 s and
// fires start-of-task notifications plus end-of-task "not marked done"
// notifications straight from live Firestore state. (Background push for a
// closed app is handled server-side by api/send-reminders.js via FCM.)
export default function useReminders(profile) {
  const profileRef = useRef(profile);
  profileRef.current = profile;

  useEffect(() => {
    const check = () => {
      if (!("Notification" in window) || Notification.permission !== "granted") return;
      const now = new Date();
      const dateKey = toKey(now);
      const dow = now.getDay();
      const mins = now.getHours() * 60 + now.getMinutes();
      const rec = { ...emptyDay(), ...(profileRef.current?.days?.[dateKey] || {}) };

      for (const entry of REMINDERS) {
        if (!entry.days.includes(dow)) continue;
        for (const phase of ["start", "end"]) {
          if (phase === "start" && entry.endOnly) continue;
          const t = entry[phase];
          if (!t) continue;
          const tm = toMins(t);
          if (mins < tm || mins - tm >= GRACE_MIN) continue;
          const k = firedKey(dateKey, entry.id, phase);
          if (localStorage.getItem(k)) continue;
          if (phase === "end" && isEntryDone(entry, now, rec)) {
            localStorage.setItem(k, "done");
            continue;
          }
          const msg = phase === "start" ? startMessage(entry, now) : endMessage(entry);
          notify(msg.title, msg.body);
          localStorage.setItem(k, "sent");
        }
      }
    };

    check();
    const t = setInterval(check, 30000);
    return () => clearInterval(t);
  }, []);
}
