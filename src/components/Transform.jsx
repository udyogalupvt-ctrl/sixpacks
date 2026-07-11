import { useState, useRef } from "react";
import { C, FONT_DISPLAY, FONT_BODY } from "../theme";
import { PHOTO_MONTHS, IDEALS, toKey } from "../plan";
import { uploadImage, thumb } from "../cloudinary";
import { Card, SectionLabel, Spinner } from "./ui";

export default function Transform({ profile, save, name }) {
  const monthly = profile?.monthlyPhotos || {};
  const ideals = profile?.ideals || {};

  const [uploading, setUploading] = useState(null); // slot id currently uploading
  const [err, setErr] = useState("");
  const [selectedIdeal, setSelectedIdeal] = useState(null);
  const fileRef = useRef(null);
  const targetRef = useRef(null); // { type: 'month' | 'ideal', key }

  const thisMonth = toKey(new Date()).slice(0, 7);
  const withPhotos = PHOTO_MONTHS.filter((m) => monthly[m.key]);
  const latest = withPhotos.length ? withPhotos[withPhotos.length - 1] : null;

  const idealKey = selectedIdeal || IDEALS.find((i) => ideals[i.key])?.key || IDEALS[0].key;
  const ideal = IDEALS.find((i) => i.key === idealKey);

  const pick = (type, key) => {
    targetRef.current = { type, key };
    setErr("");
    fileRef.current?.click();
  };

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-picking the same file later
    const target = targetRef.current;
    if (!file || !target) return;
    const slotId = `${target.type}:${target.key}`;
    setUploading(slotId);
    try {
      const url = await uploadImage(file, target.type === "month" ? "progress" : "ideals");
      if (target.type === "month") save({ monthlyPhotos: { [target.key]: url } });
      else save({ ideals: { [target.key]: url } });
    } catch (ex) {
      setErr(ex.message || "Upload failed — try again.");
    } finally {
      setUploading(null);
    }
  };

  return (
    <div style={{ maxWidth: 520, margin: "0 auto", padding: "8px 16px 20px", color: C.bone, fontFamily: FONT_BODY }}>
      <input ref={fileRef} type="file" accept="image/*" onChange={onFile} style={{ display: "none" }} />

      {/* ---- header ---- */}
      <div style={{ borderBottom: `1px solid ${C.line}`, paddingBottom: 16, marginBottom: 16 }}>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 40, lineHeight: 1 }}>
          TRANSFORM<span style={{ color: C.ember }}>.</span>
        </div>
        <div style={{ fontSize: 12, color: C.dim, marginTop: 8, lineHeight: 1.6 }}>
          One photo every month. In <b style={{ color: C.gold }}>JAN 2027</b> you'll see the whole journey —
          {" "}{name}, the proof will be undeniable.
        </div>
      </div>

      {err && (
        <div role="alert" onClick={() => setErr("")} style={{ background: "#3A1B1B", border: `1px solid ${C.ember}`, borderRadius: 8, padding: 10, fontSize: 12, marginBottom: 14, cursor: "pointer", lineHeight: 1.5 }}>
          {err} <span style={{ color: C.dim }}>(tap to dismiss)</span>
        </div>
      )}

      {/* ---- you vs ideal ---- */}
      <Card highlight>
        <SectionLabel color={C.gold}>YOU vs THE IDEAL — DAILY FUEL</SectionLabel>
        <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
          {/* you */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <Frame
              url={latest ? monthly[latest.key] : null}
              onClick={() => pick("month", latest ? latest.key : thisMonth)}
              uploading={uploading === `month:${latest ? latest.key : thisMonth}`}
              emptyText="Add this month's photo"
              tall
            />
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", color: C.ember, marginTop: 6, textAlign: "center" }}>
              YOU {latest ? `· ${latest.label}` : ""}
            </div>
          </div>
          {/* vs */}
          <div style={{ display: "flex", alignItems: "center", fontFamily: FONT_DISPLAY, color: C.dim, fontSize: 14, flexShrink: 0 }}>VS</div>
          {/* ideal */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <Frame
              url={ideals[idealKey] || null}
              onClick={() => pick("ideal", idealKey)}
              uploading={uploading === `ideal:${idealKey}`}
              emptyText={`Add ${ideal.label}`}
              tall
            />
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", color: C.gold, marginTop: 6, textAlign: "center", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {ideal.label}
            </div>
          </div>
        </div>
        {/* ideal switcher */}
        <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
          {IDEALS.map((i) => (
            <button
              key={i.key}
              onClick={() => setSelectedIdeal(i.key)}
              style={{
                flex: 1, padding: "8px 4px", borderRadius: 8, fontFamily: FONT_BODY,
                fontSize: 10, fontWeight: 700, letterSpacing: "0.08em",
                background: idealKey === i.key ? "rgba(217,164,65,0.12)" : "transparent",
                color: idealKey === i.key ? C.gold : C.dim,
                border: `1px solid ${idealKey === i.key ? C.gold : C.line}`,
                transition: "all .15s",
              }}
            >
              {i.label}
            </button>
          ))}
        </div>
        <div style={{ fontSize: 11, color: C.dim, marginTop: 10, textAlign: "center" }}>
          They weren't born like that. They built it. So will you.
        </div>
      </Card>

      {/* ---- monthly progress photos ---- */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <SectionLabel>MONTHLY PROGRESS — JUL '26 → JAN '27</SectionLabel>
          <span style={{ fontSize: 12, color: C.dim }}>{withPhotos.length}/{PHOTO_MONTHS.length}</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 }}>
          {PHOTO_MONTHS.map((m) => {
            const isNow = m.key === thisMonth;
            return (
              <div key={m.key}>
                <Frame
                  url={monthly[m.key] || null}
                  onClick={() => pick("month", m.key)}
                  uploading={uploading === `month:${m.key}`}
                  emptyText={isNow ? "📸 Add this month" : "+ Add"}
                  highlight={isNow}
                />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 5 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", color: monthly[m.key] ? C.bone : C.dim }}>
                    {m.label}
                  </span>
                  {isNow && (
                    <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.1em", color: C.ember, border: `1px solid ${C.ember}`, borderRadius: 3, padding: "1px 5px" }}>
                      THIS MONTH
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ fontSize: 11, color: C.dim, marginTop: 12 }}>
          Same pose, same light, same mirror every month. Tap a photo to replace it.
        </div>
      </Card>

      {/* ---- the ideals ---- */}
      <Card>
        <SectionLabel color={C.ember}>THE IDEALS — WHY YOU GRIND</SectionLabel>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 12 }}>
          {IDEALS.map((i) => (
            <div key={i.key}>
              <Frame
                url={ideals[i.key] || null}
                onClick={() => pick("ideal", i.key)}
                uploading={uploading === `ideal:${i.key}`}
                emptyText="+ Add"
                small
              />
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", color: C.bone, marginTop: 5, textAlign: "center" }}>
                {i.label}
              </div>
              <div style={{ fontSize: 8, color: C.dim, textAlign: "center", marginTop: 1 }}>{i.tag}</div>
            </div>
          ))}
        </div>
      </Card>

      <div style={{ textAlign: "center", fontSize: 11, color: C.dim, marginTop: 20, lineHeight: 1.7 }}>
        Look at them when it's heavy. Look at your Day-1 photo when you doubt.<br />
        Photos are stored securely and only visible to your account.
      </div>
    </div>
  );
}

// Photo slot: shows the image, an upload placeholder, or a spinner.
function Frame({ url, onClick, uploading, emptyText, highlight, tall, small }) {
  const ratio = tall ? "3 / 4" : small ? "3 / 4" : "3 / 4";
  return (
    <button
      onClick={onClick}
      disabled={uploading}
      aria-label={url ? "Replace photo" : emptyText}
      style={{
        display: "block", width: "100%", aspectRatio: ratio, borderRadius: 10, overflow: "hidden",
        border: url ? `1px solid ${C.line}` : `2px dashed ${highlight ? C.ember : C.line}`,
        background: C.panel2, padding: 0, position: "relative", color: C.dim, fontFamily: FONT_BODY,
      }}
    >
      {url && (
        <img
          src={thumb(url, small ? 300 : 600)}
          alt=""
          loading="lazy"
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", opacity: uploading ? 0.4 : 1 }}
        />
      )}
      {!url && !uploading && (
        <span style={{ fontSize: small ? 10 : 12, fontWeight: 600, padding: 4, display: "inline-block" }}>{emptyText}</span>
      )}
      {uploading && (
        <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(15,20,28,0.5)" }}>
          <Spinner size={22} />
        </span>
      )}
    </button>
  );
}
