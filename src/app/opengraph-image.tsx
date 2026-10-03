import { ImageResponse } from "next/og";

import { referenceWeekend, site } from "@/config/makeathon";

/*
 * The link preview: the poster's sun rising over the horizon on the night
 * canvas, as in icon.svg. Colours are the sun ramp and the brand black from
 * globals.css, written out because ImageResponse can't read CSS variables.
 */
export const alt = `${site.name}: ${referenceWeekend.hours} hours of AI in Munich`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        background: "#0d0214",
        color: "#ffffff",
        paddingTop: 96,
      }}
    >
      <div style={{ fontSize: 40, letterSpacing: "0.02em", color: "#c9a5ef" }}>TUM.ai</div>
      <div style={{ fontSize: 148, fontWeight: 300, letterSpacing: "-0.05em", lineHeight: 1 }}>
        Makeathon
      </div>
      <div style={{ fontSize: 36, marginTop: 24, color: "#fdd06a" }}>
        {`${referenceWeekend.hours} hours of AI in Munich`}
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 300,
          width: 600,
          height: 170,
          display: "flex",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: 600,
            height: 600,
            borderRadius: 300,
            background: "linear-gradient(180deg, #fff18b 0%, #febc5c 18%, #d9905b 40%)",
          }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          height: 6,
          background: "#c9a5ef",
        }}
      />
    </div>,
    size,
  );
}
