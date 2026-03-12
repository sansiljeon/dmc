import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingKakaoWidget from "@/components/FloatingKakaoWidget";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: "대동메디칼컨설팅 | 의료기관 컨설팅 전문",
  description: "의료기관 개원, 관리, M&A 컨설팅 전문 기업",
  openGraph: {
    title: "대동메디칼컨설팅",
    description: "의료기관 컨설팅 전문",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
        <FloatingKakaoWidget />
      </body>
    </html>
  );
}
