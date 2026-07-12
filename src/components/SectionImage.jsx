import { useState, useRef } from "react";
import { deleteField } from "firebase/firestore";
import { C, FONT_BODY } from "../theme";
import { uploadImage, thumb } from "../cloudinary";
import { Spinner } from "./ui";

// Tiny per-section image slot (AI visualization of gym/fight/meals).
// Renders as a 26px icon/thumbnail next to the section label; tap to
// upload, or to open a lightbox with view / replace / remove.
export default function SectionImage({ imgKey, url, save, label }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const fileRef = useRef(null);

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    setErr("");
    try {
      const uploaded = await uploadImage(file, "sections");
      save({ sectionImages: { [imgKey]: uploaded } });
      setOpen(true); // show what was just uploaded so a wrong pick is obvious
    } catch (ex) {
      setErr(ex.message || "Upload failed");
      setOpen(true);
    } finally {
      setBusy(false);
    }
  };

  const remove = () => {
    save({ sectionImages: { [imgKey]: deleteField() } });
    setOpen(false);
  };

  return (
    <>
      <input ref={fileRef} type="file" accept="image/*" onChange={onFile} style={{ display: "none" }} />
      <button
        onClick={() => (url ? setOpen(true) : fileRef.current?.click())}
        aria-label={url ? `View ${label} image` : `Add ${label} image`}
        title={url ? "View image" : "Add an image for this section"}
        style={{
          width: 26, height: 26, borderRadius: 6, padding: 0, flexShrink: 0,
          border: `1px ${url ? "solid" : "dashed"} ${C.line}`,
          background: C.panel2, overflow: "hidden", color: C.dim,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          fontSize: 12, verticalAlign: "middle",
        }}
      >
        {busy ? <Spinner size={12} />
          : url ? <img src={thumb(url, 60)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : "🖼"}
      </button>

      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 50, background: "rgba(9,12,18,0.92)",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            padding: 20, fontFamily: FONT_BODY,
          }}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 420 }}>
            <div style={{ fontSize: 11, letterSpacing: "0.2em", color: C.dim, fontWeight: 700, marginBottom: 8 }}>
              {label.toUpperCase()} — IMAGE
            </div>
            {url ? (
              <img
                src={url} alt={label}
                style={{ width: "100%", maxHeight: "60vh", objectFit: "contain", borderRadius: 10, border: `1px solid ${C.line}`, background: C.panel }}
              />
            ) : (
              <div style={{ padding: 40, textAlign: "center", color: C.dim, fontSize: 13, border: `2px dashed ${C.line}`, borderRadius: 10 }}>
                No image yet
              </div>
            )}
            {err && (
              <div role="alert" style={{ background: "#3A1B1B", border: `1px solid ${C.ember}`, borderRadius: 8, padding: 10, fontSize: 12, marginTop: 10 }}>
                {err}
              </div>
            )}
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <LightboxBtn onClick={() => fileRef.current?.click()} accent disabled={busy}>
                {busy ? "Uploading…" : url ? "↻ Replace" : "＋ Upload"}
              </LightboxBtn>
              {url && <LightboxBtn onClick={remove}>🗑 Remove</LightboxBtn>}
              <LightboxBtn onClick={() => setOpen(false)}>Close</LightboxBtn>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function LightboxBtn({ children, onClick, accent, disabled }) {
  return (
    <button
      onClick={onClick} disabled={disabled}
      style={{
        flex: 1, padding: "11px 0", borderRadius: 8, fontWeight: 700, fontSize: 12, fontFamily: FONT_BODY,
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
