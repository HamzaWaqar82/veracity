import { ImageResponse } from "next/og";
import fs from "node:fs";
import path from "node:path";

// Build-time PNG via satori. woff2 is unsupported - subset TTFs are committed
// under src/assets/fonts (OFL, ~40-56 KB each). The route is statically
// prerendered at build, so fonts are read from disk rather than fetched (the
// `new URL(..., import.meta.url)` fetch pattern rewrites to a host-relative
// static path that fetch cannot parse during prerender).
const fontDir = path.join(process.cwd(), "src", "assets", "fonts");
const readFont = (name: string) => fs.readFileSync(path.join(fontDir, name));

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Veracity - workforce analytics for remote teams, without surveillance";

export default async function OpengraphImage() {
  const figtree400 = readFont("Figtree-400.ttf");
  const figtree600 = readFont("Figtree-600.ttf");
  const spectral600 = readFont("Spectral-600.ttf");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "72px 80px",
          backgroundColor: "#1B4332",
          color: "#D8F3DC",
          fontFamily: "Figtree",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "40px",
          }}
        >
          <div
            style={{
              width: "18px",
              height: "18px",
              borderRadius: "9999px",
              backgroundColor: "#B7E4C7",
            }}
          />
          <div
            style={{
              display: "flex",
              fontSize: "30px",
              fontWeight: 600,
              fontFamily: "Spectral",
              letterSpacing: "0.02em",
            }}
          >
            Veracity
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            maxWidth: "900px",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: "64px",
              fontFamily: "Spectral",
              fontWeight: 600,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
            }}
          >
            Workforce analytics for remote teams, without surveillance
          </div>
          <div
            style={{
              display: "flex",
              fontSize: "26px",
              fontWeight: 400,
              lineHeight: 1.45,
              color: "#B7E4C7",
              maxWidth: "760px",
            }}
          >
            Verifiable productivity data your employees can see. No keystroke logging, no
            stealth mode - built for compliance from day one.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            marginTop: "auto",
            alignItems: "center",
            gap: "12px",
            fontSize: "18px",
            fontWeight: 600,
            color: "#D8F3DC",
          }}
        >
          <div style={{ display: "flex", width: "64px", height: "3px", borderRadius: "9999px", backgroundColor: "#40916C" }} />
          veracity.dev
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Figtree", data: figtree400, weight: 400 },
        { name: "Figtree", data: figtree600, weight: 600 },
        { name: "Spectral", data: spectral600, weight: 600 },
      ],
    },
  );
}
