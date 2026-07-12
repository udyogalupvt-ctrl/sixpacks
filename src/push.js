import { doc, setDoc, arrayUnion } from "firebase/firestore";
import { app, db } from "./firebase";

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

export const notificationsSupported = () =>
  typeof window !== "undefined" && "Notification" in window && "serviceWorker" in navigator;

export async function registerSW() {
  if (!("serviceWorker" in navigator)) return null;
  try {
    return await navigator.serviceWorker.register("/firebase-messaging-sw.js");
  } catch {
    return null; // dev without SW support — in-page notifications still work
  }
}

// Show a notification NOW (used by the in-app reminder engine + test button).
export async function notify(title, body) {
  if (!notificationsSupported() || Notification.permission !== "granted") return false;
  const opts = { body, icon: "/icon.png", badge: "/icon.png" };
  try {
    const reg = await navigator.serviceWorker.getRegistration();
    if (reg) { await reg.showNotification(title, opts); return true; }
  } catch { /* fall through */ }
  try { new Notification(title, opts); return true; } catch { return false; }
}

// Ask permission + register the device for background FCM push (needs the
// VAPID key from Firebase console → Cloud Messaging → Web Push certificates).
// Returns a status string for the UI.
export async function enablePush(uid) {
  if (!notificationsSupported()) return "unsupported";
  const permission = await Notification.requestPermission();
  if (permission !== "granted") return "denied";

  const reg = await registerSW();
  if (!VAPID_KEY) return "no-vapid"; // local reminders only

  try {
    const { getMessaging, getToken, onMessage, isSupported } = await import("firebase/messaging");
    if (!(await isSupported())) return "no-vapid";
    const messaging = getMessaging(app);
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: reg || undefined,
    });
    if (!token) return "no-vapid";
    await setDoc(doc(db, "users", uid), { fcmTokens: arrayUnion(token) }, { merge: true });
    // Push received while the app is open → show it ourselves.
    onMessage(messaging, (payload) => {
      const n = payload.notification;
      if (n?.title) notify(n.title, n.body || "");
    });
    return "push";
  } catch (e) {
    console.warn("FCM setup failed:", e);
    return "no-vapid";
  }
}
