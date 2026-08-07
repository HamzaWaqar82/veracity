import type { Metadata } from "next";
import Script from "next/script";
import { Figtree, Spectral } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CursorRing } from "@/components/CursorRing";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { nav, SITE_URL } from "@/lib/site";

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const spectral = Spectral({
  subsets: ["latin"],
  variable: "--font-spectral",
  display: "swap",
  weight: ["500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Workforce Analytics for Remote Teams | Veracity",
    template: "%s | Veracity",
  },
  description:
    "Workforce analytics for small-to-medium businesses with remote and hybrid teams. Verifiable productivity data your employees can see, with no keystroke logging, no stealth mode, and no surveillance.",
  openGraph: {
    siteName: "Veracity",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${figtree.variable} ${spectral.variable}`}>
      <body className="bg-bg text-ink antialiased">
        <Script id="js-detection" strategy="beforeInteractive">
          {`document.documentElement.classList.add("js")`}
        </Script>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-skip focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>
        <Header nav={nav.main} />
        <main id="main">{children}</main>
        <Footer />
        <ChatWidget />
        <CursorRing />
      </body>
    </html>
  );
}
