import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Veracity",
  description: "Workforce Analytics Built on Trust, Not Surveillance.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
