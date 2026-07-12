import { useState, useEffect } from "react";
import { C, FONT_DISPLAY, FONT_BODY } from "../theme";
import { REMINDERS, TIMEZONE } from "../schedule";
import { notificationsSupported, enablePush, notify } from "../push";
import { Card, SectionLabel } from "./ui";

const BYDAY = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];
const DAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const UNTIL = "20270112T235959Z"; // end of the 185-day grind

const pad = (n) => String(n).padStart(2, "0");
const ymd = (d) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;

// First occurrence of this entry on/after today.
function nextOccurrence(entry) {
  const d = new Date();
  for (let i = 0; i < 7; i++) {
    if (entry.days.includes(d.getDay())) return new Date(d);
    d.setDate(d.getDate() + 1);
  }
  return d;
}

function daysText(days) {
  if (days.length === 7) return "Daily";
  if (days.length === 6 && !days.includes(0)) return "Mon–Sat";
  return days.map((d) => DAY_SHORT[d]).join("/");
}

function gcalUrl(entry) {
  const first = ymd(nextOccurrence(entry));
  const dates = `${first}T${entry.start.replace(":", "")}00/${first}T${entry.end.replace(":", "")}00`;
  const recur = `RRULE:FREQ=WEEKLY;BYDAY=${entry.days.map((d) => BYDAY[d]).join(",")};UNTIL=${UNTIL}`;
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `${entry.icon} ${entry.label} — Grind Log`,
    dates,
    ctz: TIMEZONE,
    recur,
    details: "Do it, then mark it done in Grind Log.",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function buildIcs() {
  const stamp = `${ymd(new Date())}T000000Z`;
  const events = REMINDERS.map((e) => {
    const first = ymd(nextOccurrence(e));
    return [
      "BEGIN:VEVENT",
      `UID:grindlog-${e.id}@grindlog`,
      `DTSTAMP:${stamp}`,
      `DTSTART;TZID=${TIMEZONE}:${first}T${e.start.replace(":", "")}00`,
      `DTEND;TZID=${TIMEZONE}:${first}T${e.end.replace(":", "")}00`,
      `RRULE:FREQ=WEEKLY;BYDAY=${e.days.map((d) => BYDAY[d]).join(",")};UNTIL=${UNTIL}`,
      `SUMMARY:${e.icon} ${e.label} — Grind Log`,
      "DESCRIPTION:Do it\\, then mark it done in Grind Log.",
      "BEGIN:VALARM", "ACTION:DISPLAY", "DESCRIPTION:Starts now", "TRIGGER:-PT0M", "END:VALARM",
      "BEGIN:VALARM", "ACTION:DISPLAY", "DESCRIPTION:Finished? Mark it done in Grind Log", "TRIGGER;RELATED=END:PT0M", "END:VALARM",
      "END:VEVENT",
    ].join("\r\n");
  }).join("\r\n");
  return `BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Grind Log//Reminders//EN\r\nCALSCALE:GREGORIAN\r\n${events}\r\nEND:VCALENDAR\r\n`;
}

export default function Reminders({ user, onClose }) {
  const supported = notificationsSupported();
  const [perm, setPerm] = useState(supported ? Notification.permission : "unsupported");
  const [pushState, setPushState] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (supported && Notification.permission === "granted") {
      enablePush(user.uid).then(setPushState);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const enable = async () => {
    setBusy(true);
    const res = await enablePush(user.uid);
    setPushState(res);
    setPerm(supported ? Notification.permission : "unsupported");
    setBusy(false);
  };

  const downloadIcs = () => {
    const blob = new Blob([buildIcs()], { type: "text/calendar;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "grind-log-reminders.ics";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const statusText =
    !supported ? "This browser doesn't support notifications."
    : perm === "denied" ? "Notifications are blocked — allow them for this site in your browser settings."
    : perm !== "granted" ? "Turn on reminders: start-of-task alerts + a warning when a finished window isn't marked done."
    : pushState === "push" ? "✓ Reminders ON — including background push when the app is closed."
    : "✓ Reminders ON while the app is open. Background push (app closed) needs the one-time FCM setup — see README.";

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 40, background: C.bg, overflowY: "auto", fontFamily: FONT_BODY, color: C.bone }}>
      <div style={{ maxWidth: 520, margin: "0 auto", padding: "14px 16px 40px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 30 }}>REMINDERS<span style={{ color: C.ember }}>.</span></div>
          <button
            onClick={onClose}
            aria-label="Close reminders"
            style={{ background: "none", border: `1px solid ${C.line}`, color: C.bone, borderRadius: 8, padding: "8px 14px", fontWeight: 700, fontSize: 13, fontFamily: FONT_BODY }}
          >
            ✕ Close
          </button>
        </div>

        {/* notifications */}
        <Card highlight={perm !== "granted"}>
          <SectionLabel color={C.gold}>WEB NOTIFICATIONS</SectionLabel>
          <div style={{ fontSize: 13, color: perm === "granted" ? C.green : C.dim, marginTop: 8, lineHeight: 1.6 }}>
            {statusText}
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            {perm !== "granted" && supported && (
              <PanelBtn onClick={enable} accent disabled={busy}>
                {busy ? "Enabling…" : "🔔 Enable notifications"}
              </PanelBtn>
            )}
            {perm === "granted" && (
              <PanelBtn onClick={() => notify("🔥 Grind Log", "Reminders are working. No excuses now.")}>
                Send test notification
              </PanelBtn>
            )}
          </div>
          <div style={{ fontSize: 11, color: C.dim, marginTop: 10, lineHeight: 1.6 }}>
            How it works: an alert when each task starts, and if the window ends while the task is
            still unticked in Grind Log, you get called out. Fully-logged tasks stay silent.
          </div>
        </Card>

        {/* schedule */}
        <Card>
          <SectionLabel>YOUR DAY — FOUNDER SCHEDULE (IST)</SectionLabel>
          <div style={{ fontSize: 11, color: C.dim, marginTop: 6 }}>
            Fight before work · work 10–6 · gym 6–9 · Sunday rest.
          </div>
          {REMINDERS.map((e) => (
            <div key={e.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: `1px dashed ${C.line}` }}>
              <span style={{ fontSize: 16, width: 22, textAlign: "center", flexShrink: 0 }}>{e.icon}</span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{e.label}</span>
                <span style={{ display: "block", fontSize: 10, color: C.dim }}>{daysText(e.days)}</span>
              </span>
              <span style={{ fontSize: 12, color: C.dim, flexShrink: 0 }}>{e.start}–{e.end}</span>
              <a
                href={gcalUrl(e)} target="_blank" rel="noreferrer"
                title="Add to Google Calendar"
                style={{ flexShrink: 0, fontSize: 10, fontWeight: 700, letterSpacing: "0.05em", color: C.blue, border: `1px solid ${C.line}`, borderRadius: 6, padding: "5px 8px", textDecoration: "none" }}
              >
                ＋ GCal
              </a>
            </div>
          ))}
        </Card>

        {/* google calendar */}
        <Card>
          <SectionLabel color={C.blue}>GOOGLE CALENDAR</SectionLabel>
          <div style={{ fontSize: 12, color: C.dim, marginTop: 8, lineHeight: 1.6 }}>
            Tap <b style={{ color: C.blue }}>＋ GCal</b> on any row to add it as a repeating event
            (until Jan 12, 2027), or import everything at once:
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <PanelBtn onClick={downloadIcs} accent>⬇ Download all (.ics)</PanelBtn>
          </div>
          <div style={{ fontSize: 11, color: C.dim, marginTop: 10, lineHeight: 1.6 }}>
            Import: Google Calendar → ⚙ Settings → Import &amp; export → select the file.
            Set your calendar's default notification to "At time of event" to get pinged on time.
          </div>
        </Card>
      </div>
    </div>
  );
}

function PanelBtn({ children, onClick, accent, disabled }) {
  return (
    <button
      onClick={onClick} disabled={disabled}
      style={{
        flex: 1, padding: "12px 0", borderRadius: 8, fontWeight: 700, fontSize: 13, fontFamily: FONT_BODY,
        background: accent ? C.ember : "transparent",
        color: accent ? "#0B0F15" : C.bone,
        border: `1px solid ${accent ? C.ember : C.line}`,
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {children}
    </button>
  );
}
