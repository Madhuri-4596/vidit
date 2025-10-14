import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VIDIT - AI-Powered Video Editing Platform",
  description: "Create stunning videos with AI assistance. Professional editing tools, auto-captions, and multi-platform publishing.",
  manifest: "/manifest.json",
  themeColor: "#9333ea",
  icons: {
    icon: "/favicon.ico",
    apple: "/icon.svg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "VIDIT",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
