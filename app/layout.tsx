import type { Metadata, Viewport } from "next";
import "./globals.css";
import { QueryProvider } from '@/lib/providers/QueryProvider';
import { ServiceWorkerRegistration } from '@/components/pwa/ServiceWorkerRegistration';

export const metadata: Metadata = {
  title: "마케트 (Markeet) - AI 기반 마케팅 데이터 통합 플랫폼",
  description: "이커머스 셀러를 위한 AI 기반 마케팅 데이터 통합 플랫폼입니다.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "마케트",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
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
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
