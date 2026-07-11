import { useState, useEffect, useCallback, useRef } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, onSnapshot, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./firebase";
import { C, FONT_BODY, FONT_DISPLAY } from "./theme";
import AuthScreen from "./components/AuthScreen";
import GrindLog from "./components/GrindLog";
import Transform from "./components/Transform";

const saveErrText = (e) =>
  e?.code === "permission-denied"
    ? "Firestore rejected the save (permission denied). Publish the rules from firestore.rules in Firebase console → Firestore Database → Rules."
    : "Couldn't save your last change. Check your connection and tap it again.";

export default function App() {
  const [user, setUser] = useState(undefined); // undefined = auth still loading
  const [profile, setProfile] = useState(null); // Firestore users/{uid} doc
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [tab, setTab] = useState("today");
  const [saveErr, setSaveErr] = useState("");
  const initialized = useRef(false);

  useEffect(() => onAuthStateChanged(auth, (u) => setUser(u)), []);

  // Live-sync the user's document (all progress lives in users/{uid}).
  useEffect(() => {
    if (!user) { setProfile(null); setProfileLoaded(false); initialized.current = false; return; }
    const ref = doc(db, "users", user.uid);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) {
          setProfile(snap.data());
        } else if (!snap.metadata.fromCache && !initialized.current) {
          // Server-confirmed brand-new user (e.g. first Google sign-in) — create the doc.
          initialized.current = true;
          setDoc(ref, {
            name: user.displayName || user.email?.split("@")[0] || "Fighter",
            email: user.email || "",
            createdAt: serverTimestamp(),
          }, { merge: true }).catch((e) => setSaveErr(saveErrText(e)));
        }
        setProfileLoaded(true);
      },
      (e) => { setSaveErr(saveErrText(e)); setProfileLoaded(true); }
    );
    return unsub;
  }, [user]);

  // Fire-and-forget merge write: with the offline cache enabled, the local
  // snapshot updates instantly and the promise resolves only on server ack.
  const save = useCallback((patch) => {
    if (!auth.currentUser) return;
    setSaveErr("");
    setDoc(doc(db, "users", auth.currentUser.uid), patch, { merge: true })
      .catch((e) => setSaveErr(saveErrText(e)));
  }, []);

  if (user === undefined || (user && !profileLoaded)) {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, color: C.dim, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT_BODY }}>
        Loading your grind log…
      </div>
    );
  }

  if (!user) return <AuthScreen />;

  const name = (profile?.name || user.displayName || user.email?.split("@")[0] || "FIGHTER").toUpperCase();

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.bone, fontFamily: FONT_BODY }}>
      {/* top bar */}
      <div style={{ maxWidth: 520, margin: "0 auto", padding: "14px 16px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 11, letterSpacing: "0.25em", color: C.dim, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          GRIND LOG — <span style={{ color: C.gold }}>{name}</span>
        </div>
        <button
          onClick={() => signOut(auth)}
          style={{ background: "none", border: `1px solid ${C.line}`, color: C.dim, borderRadius: 6, padding: "4px 10px", fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", fontFamily: FONT_BODY, flexShrink: 0, marginLeft: 10 }}
        >
          SIGN OUT
        </button>
      </div>

      {/* active page */}
      <div style={{ paddingBottom: 86 }}>
        {tab === "today"
          ? <GrindLog profile={profile} save={save} />
          : <Transform profile={profile} save={save} name={name} />}
      </div>

      {/* save error toast */}
      {saveErr && (
        <div
          role="alert"
          onClick={() => setSaveErr("")}
          style={{
            position: "fixed", bottom: 76, left: "50%", transform: "translateX(-50%)",
            width: "calc(100% - 32px)", maxWidth: 488, zIndex: 20,
            background: "#3A1B1B", border: `1px solid ${C.ember}`, borderRadius: 8,
            padding: 10, fontSize: 12, lineHeight: 1.5, cursor: "pointer",
          }}
        >
          {saveErr} <span style={{ color: C.dim }}>(tap to dismiss)</span>
        </div>
      )}

      {/* bottom tab bar */}
      <nav style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 10,
        background: "rgba(15,20,28,0.97)", borderTop: `1px solid ${C.line}`,
        paddingBottom: "env(safe-area-inset-bottom)",
      }}>
        <div style={{ maxWidth: 520, margin: "0 auto", display: "flex" }}>
          {[
            { id: "today", icon: "🔥", label: "TODAY" },
            { id: "transform", icon: "📸", label: "TRANSFORM" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              aria-current={tab === t.id ? "page" : undefined}
              style={{
                flex: 1, background: "none", border: "none", padding: "10px 0 12px",
                color: tab === t.id ? C.ember : C.dim, fontFamily: FONT_BODY,
                borderTop: `2px solid ${tab === t.id ? C.ember : "transparent"}`,
              }}
            >
              <div style={{ fontSize: 18, filter: tab === t.id ? "none" : "grayscale(1) opacity(.6)" }}>{t.icon}</div>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.2em", marginTop: 2 }}>{t.label}</div>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
