import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "W-Future Leader — Management Trainee 2026",
  description: "Management Trainee Screening Test — Wilmar CLV",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
