import "./globals.css";

export const metadata = {
  metadataBase: new URL("https://tikidoc.xyz"),
  title: "TikiDoc — 클리닉 전용 AI 운영 도구",
  description: "진료 전부터 사후 케어까지 — Tiki Paste, My Tiki, Tiki Room으로 클리닉 운영을 하나의 흐름으로 연결합니다.",
  openGraph: {
    title: "TikiDoc — 클리닉 전용 AI 운영 도구",
    description: "진료 전부터 사후 케어까지 — Tiki Paste, My Tiki, Tiki Room으로 클리닉 운영을 하나의 흐름으로 연결합니다.",
    url: "https://tikidoc.xyz",
    siteName: "TikiDoc",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
