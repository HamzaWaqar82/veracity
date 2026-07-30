import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FSMS — Fair Screen Monitoring",
  description: "Transparent, privacy-respecting employee monitoring for modern teams.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
