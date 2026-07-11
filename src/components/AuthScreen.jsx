import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, googleProvider } from "../firebase";
import { C, FONT_DISPLAY, FONT_BODY } from "../theme";
import { TOTAL_DAYS } from "../plan";
import { Spinner } from "./ui";

const ERROR_TEXT = {
  "auth/invalid-credential": "Wrong email or password.",
  "auth/user-not-found": "No account with this email — sign up first.",
  "auth/wrong-password": "Wrong email or password.",
  "auth/email-already-in-use": "This email already has an account — log in instead.",
  "auth/invalid-email": "That email address doesn't look right.",
  "auth/weak-password": "Password must be at least 6 characters.",
  "auth/too-many-requests": "Too many attempts — wait a minute and try again.",
  "auth/network-request-failed": "Network error — check your connection.",
  "auth/operation-not-allowed":
    "This sign-in method is not enabled yet. In Firebase console → Authentication → Sign-in method, enable Email/Password and Google.",
  "auth/popup-closed-by-user": "Google sign-in was closed before finishing.",
  "auth/unauthorized-domain":
    "This domain isn't authorized in Firebase. Add it in Firebase console → Authentication → Settings → Authorized domains.",
};
const friendly = (e) => ERROR_TEXT[e?.code] || e?.message || "Something went wrong — try again.";

const inputStyle = {
  width: "100%", background: C.panel2, border: `1px solid ${C.line}`, borderRadius: 8,
  color: C.bone, padding: "12px 14px", fontSize: 16, fontFamily: FONT_BODY, marginTop: 8,
};

export default function AuthScreen() {
  const [mode, setMode] = useState("login"); // 'login' | 'signup'
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    if (mode === "signup" && !name.trim()) { setErr("Enter your name — the app is built around it."); return; }
    setBusy(true);
    try {
      if (mode === "signup") {
        const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        await updateProfile(cred.user, { displayName: name.trim() });
        // Persist the name right away — the whole app is personalized around it.
        setDoc(doc(db, "users", cred.user.uid), {
          name: name.trim(),
          email: email.trim(),
          createdAt: serverTimestamp(),
        }, { merge: true }).catch(() => {});
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      }
    } catch (ex) {
      setErr(friendly(ex));
      setBusy(false);
    }
  };

  const google = async () => {
    setErr("");
    setBusy(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (ex) {
      // Mobile browsers often block popups — fall back to a full redirect.
      if (ex?.code === "auth/popup-blocked" || ex?.code === "auth/operation-not-supported-in-this-environment") {
        try { await signInWithRedirect(auth, googleProvider); return; }
        catch (ex2) { setErr(friendly(ex2)); }
      } else {
        setErr(friendly(ex));
      }
      setBusy(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.bone, fontFamily: FONT_BODY, display: "flex", flexDirection: "column" }}>
      <div style={{ maxWidth: 440, width: "100%", margin: "0 auto", padding: "48px 20px 32px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>

        {/* brand */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 11, letterSpacing: "0.3em", color: C.ember, fontWeight: 700 }}>
            {TOTAL_DAYS} DAYS · LIFT + FIGHT
          </div>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 56, lineHeight: 0.95, marginTop: 8 }}>
            GRIND<br /><span style={{ color: C.ember }}>LOG</span>
          </div>
          <div style={{ fontSize: 13, color: C.dim, marginTop: 12, lineHeight: 1.6 }}>
            Meals. Gym. Fight training. Water. Weight.<br />
            Every day logged until <b style={{ color: C.gold }}>Jan 12, 2027</b>.
          </div>
        </div>

        {/* mode tabs */}
        <div style={{ display: "flex", background: C.panel, border: `1px solid ${C.line}`, borderRadius: 10, padding: 4, marginBottom: 16 }}>
          {["login", "signup"].map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setErr(""); }}
              style={{
                flex: 1, padding: "10px 0", borderRadius: 7, border: "none", fontWeight: 700, fontSize: 13,
                letterSpacing: "0.1em", fontFamily: FONT_BODY, transition: "all .15s",
                background: mode === m ? C.ember : "transparent",
                color: mode === m ? "#0B0F15" : C.dim,
              }}
            >
              {m === "login" ? "LOG IN" : "SIGN UP"}
            </button>
          ))}
        </div>

        {/* form */}
        <form onSubmit={submit} style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 12, padding: 16 }}>
          {mode === "signup" && (
            <label style={{ display: "block", fontSize: 11, letterSpacing: "0.15em", color: C.dim, fontWeight: 700 }}>
              YOUR NAME
              <input
                value={name} onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Govardhan" autoComplete="name" style={inputStyle}
              />
            </label>
          )}
          <label style={{ display: "block", fontSize: 11, letterSpacing: "0.15em", color: C.dim, fontWeight: 700, marginTop: mode === "signup" ? 14 : 0 }}>
            EMAIL
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com" autoComplete="email" required style={inputStyle}
            />
          </label>
          <label style={{ display: "block", fontSize: 11, letterSpacing: "0.15em", color: C.dim, fontWeight: 700, marginTop: 14 }}>
            PASSWORD
            <input
              type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="min 6 characters" autoComplete={mode === "signup" ? "new-password" : "current-password"}
              required minLength={6} style={inputStyle}
            />
          </label>

          {err && (
            <div role="alert" style={{ background: "#3A1B1B", border: `1px solid ${C.ember}`, borderRadius: 8, padding: 10, fontSize: 12, marginTop: 14, lineHeight: 1.5 }}>
              {err}
            </div>
          )}

          <button
            type="submit" disabled={busy}
            style={{
              width: "100%", marginTop: 16, padding: "14px 0", borderRadius: 8, border: "none",
              background: C.ember, color: "#0B0F15", fontWeight: 700, fontSize: 15, letterSpacing: "0.08em",
              fontFamily: FONT_BODY, opacity: busy ? 0.6 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            }}
          >
            {busy ? <Spinner /> : mode === "login" ? "ENTER THE GRIND" : "START DAY 001"}
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "16px 0" }}>
            <div style={{ flex: 1, height: 1, background: C.line }} />
            <span style={{ fontSize: 11, color: C.dim, fontWeight: 700, letterSpacing: "0.15em" }}>OR</span>
            <div style={{ flex: 1, height: 1, background: C.line }} />
          </div>

          <button
            type="button" onClick={google} disabled={busy}
            style={{
              width: "100%", padding: "13px 0", borderRadius: 8, border: `1px solid ${C.line}`,
              background: C.bone, color: "#1a1a1a", fontWeight: 700, fontSize: 14, fontFamily: FONT_BODY,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10, opacity: busy ? 0.6 : 1,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
            </svg>
            Continue with Google
          </button>
        </form>

        <div style={{ textAlign: "center", fontSize: 11, color: C.dim, marginTop: 20, lineHeight: 1.7 }}>
          Your progress is saved to your account —<br />log in on any phone and it's all there.
        </div>
      </div>
    </div>
  );
}
