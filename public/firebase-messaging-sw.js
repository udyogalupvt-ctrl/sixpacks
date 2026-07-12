/* global firebase, importScripts, clients */
// Background push handler. Firebase web config is public by design —
// security lives in Firestore rules, not here.
importScripts("https://www.gstatic.com/firebasejs/12.16.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/12.16.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyABy_mojC3QV4TTHSarCdB6Yv-Qmhm2_JI",
  authDomain: "govardhan-cc8d0.firebaseapp.com",
  projectId: "govardhan-cc8d0",
  storageBucket: "govardhan-cc8d0.firebasestorage.app",
  messagingSenderId: "422224048757",
  appId: "1:422224048757:web:3560936b765ca2477d7e3c",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const n = payload.notification || {};
  self.registration.showNotification(n.title || "🔥 Grind Log", {
    body: n.body || "",
    icon: "/icon.png",
    badge: "/icon.png",
    data: { url: "/" },
  });
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const c of list) if ("focus" in c) return c.focus();
      return clients.openWindow("/");
    })
  );
});
