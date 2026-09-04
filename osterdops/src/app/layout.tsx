import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { ToastProvider } from "@/components/ui/Toast";
import { siteConfig } from "@/config/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-serif-luxury",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-sans-main",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

import { CustomCursor } from "@/components/ui/CustomCursor";
import { ThemeCustomizerProvider } from "@/context/ThemeCustomizerContext";
import { AuthProvider } from "@/context/AuthContext";
import { CustomizeThemeModal } from "@/components/ui/CustomizeThemeModal";
import { FirebaseAnalyticsProvider } from "@/components/analytics/FirebaseAnalyticsProvider";

export const viewport: Viewport = {
  themeColor: "#080808",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://osterdops.com"),
  title: {
    default: "OsterdOps — The AI Financial Firewall & Sub-Millisecond Gateway",
    template: `%s — ${siteConfig.name}`,
  },
  description:
    "Stop runaway LLM spend before tokens generate. Sub-microsecond pre-flight firewall, automated model downgrades, and zero data retention.",
  alternates: {
    canonical: "https://osterdops.com",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://osterdops.com",
    siteName: "OsterdOps",
    title: "OsterdOps — The AI Financial Firewall & Sub-Millisecond Gateway",
    description:
      "Stop runaway LLM spend before tokens generate. Sub-microsecond pre-flight firewall, automated model downgrades, and zero data retention.",
    images: [
      {
        url: "/osterdops-logo.png",
        width: 1200,
        height: 630,
        alt: "OsterdOps — The AI Financial Firewall & Sub-Millisecond Gateway",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "OsterdOps — The AI Financial Firewall & Sub-Millisecond Gateway",
    description:
      "Stop runaway LLM spend before tokens generate. Sub-microsecond pre-flight firewall, automated model downgrades, and zero data retention.",
    images: ["/osterdops-logo.png"],
    creator: "@osterdops",
  },
  icons: {
    icon: "/osterdops-logo.png",
    apple: "/osterdops-logo.png",
  },
  keywords: [
    "AI cost management",
    "AI financial firewall",
    "Sub-millisecond LLM proxy",
    "LLM token governance",
    "automated model downgrade",
    "zero prompt retention",
    "AI infrastructure",
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} ${jakarta.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <FirebaseAnalyticsProvider />
        <AuthProvider>
          <ThemeCustomizerProvider>
            <ThemeProvider>
              <ToastProvider>
                {children}
                <CustomCursor />
                <CustomizeThemeModal />
              </ToastProvider>
            </ThemeProvider>
          </ThemeCustomizerProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
