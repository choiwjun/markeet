import type { Metadata } from "next";
import "./globals.css";
import { QueryProvider } from '@/lib/providers/QueryProvider';

export const metadata: Metadata = {
  title: "마케트 (Markeet) - AI 기반 마케팅 데이터 통합 플랫폼",
  description: "이커머스 셀러를 위한 AI 기반 마케팅 데이터 통합 플랫폼입니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          as="style"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css"
        />
        <link
          rel="stylesheet"
          as="style"
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap"
        />
      </head>
      <body className="antialiased">
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
