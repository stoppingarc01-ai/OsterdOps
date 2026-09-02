import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    "AI cost management",
    "AI operations",
    "AI governance",
    "LLM cost tracking",
    "AI infrastructure",
  ],
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
