import { ImageResponse } from "next/og";
import fs from "node:fs";
import path from "node:path";
import { BLOG_FILES, getEssay } from "@/lib/blog";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Veracity resource article";

const fontDir = path.join(process.cwd(), "src", "assets", "fonts");
const readFont = (name: string) => fs.readFileSync(path.join(fontDir, name));

export const dynamicParams = false;

export function generateStaticParams() {
  return BLOG_FILES.map((slug) => ({ slug }));
}

type Props = { params: Promise<{ slug: string }> };

export default async function EssayOpengraphImage({ params }: Props) {
  const { slug } = await params;
  const essay = getEssay(slug);

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
            maxWidth: "980px",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: essay && essay.title.length > 60 ? "46px" : "58px",
              fontFamily: "Spectral",
              fontWeight: 600,
              lineHeight: 1.12,
              letterSpacing: "-0.02em",
            }}
          >
            {essay?.title ?? "Veracity"}
          </div>
          {essay?.deck && (
            <div
              style={{
                display: "flex",
                fontSize: "24px",
                fontWeight: 400,
                lineHeight: 1.45,
                color: "#B7E4C7",
                maxWidth: "800px",
              }}
            >
              {essay.deck}
            </div>
          )}
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
          veracity.dev/resources
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
