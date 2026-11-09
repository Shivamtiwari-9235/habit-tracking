import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pulse — Minimal Habit Tracking",
  description: "A calm, minimal habit tracker designed for sustainable personal rhythms.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className="font-sans antialiased bg-canvas text-content-primary min-h-screen selection:bg-pulse/20 selection:text-pulse"
      >
        {children}
      </body>
    </html>
  );
}
