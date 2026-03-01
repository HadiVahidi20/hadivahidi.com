import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const title = searchParams.get("title") || "Hadi Vahidi";
  const description = searchParams.get("description") || "Full-Stack Developer";
  const type = searchParams.get("type") || "default";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "60px 80px",
          backgroundColor: "#0f172a",
          fontFamily: "sans-serif",
        }}
      >
        {/* Accent gradient bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "6px",
            background: "linear-gradient(90deg, #6366f1, #8b5cf6, #a78bfa)",
          }}
        />

        {/* Type badge */}
        {type !== "default" && (
          <div
            style={{
              display: "flex",
              marginBottom: "24px",
            }}
          >
            <span
              style={{
                backgroundColor: "rgba(99, 102, 241, 0.2)",
                color: "#a78bfa",
                padding: "6px 16px",
                borderRadius: "9999px",
                fontSize: "18px",
                fontWeight: 600,
              }}
            >
              {type === "project" ? "Project" : type === "article" ? "Article" : type}
            </span>
          </div>
        )}

        {/* Title */}
        <div
          style={{
            fontSize: title.length > 40 ? "48px" : "64px",
            fontWeight: 700,
            color: "#f8fafc",
            lineHeight: 1.2,
            marginBottom: "16px",
            display: "flex",
          }}
        >
          {title}
        </div>

        {/* Description */}
        {description && (
          <div
            style={{
              fontSize: "24px",
              color: "#94a3b8",
              lineHeight: 1.5,
              display: "flex",
            }}
          >
            {description.length > 120
              ? description.slice(0, 120) + "..."
              : description}
          </div>
        )}

        {/* Footer */}
        <div
          style={{
            position: "absolute",
            bottom: "40px",
            left: "80px",
            right: "80px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "9999px",
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: 700,
                fontSize: "18px",
              }}
            >
              H
            </div>
            <span style={{ color: "#e2e8f0", fontSize: "20px", fontWeight: 600 }}>
              Hadi Vahidi
            </span>
          </div>
          <span style={{ color: "#64748b", fontSize: "18px" }}>
            hadivahidi.com
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
