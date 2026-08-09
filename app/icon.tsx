import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        gap: 5,
        padding: 13,
        borderRadius: 15,
        background: "#10271f",
      }}
    >
      {[16, 34, 25].map((height, index) => (
        <span
          key={height}
          style={{
            width: 8,
            height,
            display: "flex",
            borderRadius: 4,
            background: index === 1 ? "#c7f06b" : "#70b98f",
          }}
        />
      ))}
    </div>,
    size,
  );
}
