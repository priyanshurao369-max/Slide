import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Slide — 2D Physics Arena",
  description: "Minimalist 2D physics party game built on Next.js and Matter.js",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full overflow-auto antialiased bg-white text-neutral-900">
        {children}
      </body>
    </html>
  );
}
