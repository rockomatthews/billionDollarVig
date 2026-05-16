import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/lib/seo/site";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "linear-gradient(135deg, #000 0%, #120b02 55%, #000 100%)",
          color: "#fff7dc",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          justifyContent: "center",
          padding: 64,
          width: "100%",
        }}
      >
        <div
          style={{
            border: "2px solid #d7a83f",
            display: "flex",
            flexDirection: "column",
            gap: 28,
            height: "100%",
            justifyContent: "center",
            padding: 56,
            width: "100%",
          }}
        >
          <div style={{ color: "#d7a83f", fontSize: 38, letterSpacing: 8 }}>
            CRYPTO PIXEL ADS
          </div>
          <div style={{ fontSize: 94, fontWeight: 900, lineHeight: 0.95 }}>
            {SITE_NAME}
          </div>
          <div style={{ color: "#f8edc7", fontSize: 42, lineHeight: 1.2, maxWidth: 920 }}>
            Buy 10x10 ad cells on a billion-dollar internet billboard.
          </div>
        </div>
      </div>
    ),
    size,
  );
}
