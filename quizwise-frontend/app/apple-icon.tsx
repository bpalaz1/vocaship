import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(145deg, #0B0F19 0%, #111936 55%, #0B0F19 100%)",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 146,
            height: 146,
            borderRadius: 36,
            border: "2.5px solid rgba(99, 102, 241, 0.38)",
            background:
              "radial-gradient(circle at 30% 25%, rgba(16, 185, 129, 0.28), rgba(99, 102, 241, 0.16) 55%, rgba(11, 15, 25, 0) 80%)",
            display: "flex",
          }}
        />
        <svg
          width="114"
          height="114"
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="vsAppleGrad" x1="16" y1="14" x2="104" y2="106" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#34D399" />
              <stop offset="50%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#6366F1" />
            </linearGradient>
            <linearGradient id="vsAppleSail" x1="56" y1="18" x2="96" y2="86" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#A5B4FC" />
              <stop offset="100%" stopColor="#6366F1" />
            </linearGradient>
          </defs>
          <path
            d="M22 24L54.5 98C56.7 102.8 63.3 102.8 65.5 98L98 24H81.5L60 75.5L38.5 24H22Z"
            fill="url(#vsAppleGrad)"
          />
          <path
            d="M60 20L82 54H60V20Z"
            fill="url(#vsAppleSail)"
            opacity="0.9"
          />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
