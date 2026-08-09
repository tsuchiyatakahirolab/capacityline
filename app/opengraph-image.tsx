import { ImageResponse } from "next/og";

export const alt = "CapacityLine — AI Supply Recovery Desk";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "60px 68px",
        color: "#eef7f2",
        background: "linear-gradient(120deg, #0d241b 0%, #174433 72%, #236047 100%)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div
          style={{
            width: 54,
            height: 54,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            gap: 4,
            padding: 11,
            border: "1px solid rgba(199,240,107,.35)",
            borderRadius: 13,
            background: "rgba(199,240,107,.08)",
          }}
        >
          {[13, 28, 21].map((height, index) => (
            <span key={height} style={{ width: 7, height, display: "flex", borderRadius: 3, background: index === 1 ? "#c7f06b" : "#70b98f" }} />
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <strong style={{ fontSize: 27, letterSpacing: "-.02em" }}>CapacityLine</strong>
          <span style={{ marginTop: 3, color: "#9eb9ac", fontSize: 11, fontWeight: 700, letterSpacing: ".16em" }}>AI SUPPLY RECOVERY DESK</span>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", maxWidth: 920 }}>
        <span style={{ color: "#c7f06b", fontSize: 17, fontWeight: 800, letterSpacing: ".13em" }}>FROM SUPPLY EXCEPTION TO ACTIONABLE FALLBACK</span>
        <h1 style={{ margin: "18px 0 22px", fontFamily: "serif", fontSize: 70, fontWeight: 600, lineHeight: 1.02, letterSpacing: "-.045em" }}>
          Call suppliers. Secure capacity. Keep the line moving.
        </h1>
        <p style={{ margin: 0, color: "#b9cec4", fontSize: 22, lineHeight: 1.45 }}>
          Live commitments · deterministic guardrails · transcript evidence · human authority
        </p>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 24, borderTop: "1px solid rgba(255,255,255,.12)" }}>
        <span style={{ color: "#a7c0b4", fontSize: 15 }}>Powered by CALL-E</span>
        <span style={{ padding: "9px 15px", color: "#173023", borderRadius: 999, background: "#c7f06b", fontSize: 13, fontWeight: 800 }}>MOST PRACTICAL USE CASE</span>
      </div>
    </div>,
    size,
  );
}
