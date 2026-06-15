import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ServiceWorkerRegister } from "@/components/app/ServiceWorkerRegister";

export const metadata: Metadata = {
  title: "Coltura — a keeping place",
  description:
    "Coltura is an archive for the things you make and find. Photograph each one, add a few details, and file it on a shelf you can return to.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Coltura",
    statusBarStyle: "default",
  },
  icons: {
    icon: "/brand/orchid-bloom.svg",
    apple: "/brand/coltura-app-icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#1F9AA6",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Fonts: Newsreader (display), Geist (UI/body), Geist Mono (data).
            Loaded at runtime so builds don't depend on a font fetch. Swap to
            next/font/google for self-hosting once you have build-time network. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,400;1,6..72,500&family=Geist:wght@300;400;500;600;700&family=Geist+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
