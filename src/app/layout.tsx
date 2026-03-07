import type { Metadata } from "next";
import { Geist, Geist_Mono, MedievalSharp, UnifrakturMaguntia } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { TodayProvider } from "@/lib/today-provider";
import { Navigation } from "@/components/navigation";
import { MedievalEffects } from "@/components/medieval-effects";
import { ParchmentOverlay } from "@/components/parchment-overlay";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const medievalSharp = MedievalSharp({
  weight: "400",
  variable: "--font-medieval",
  subsets: ["latin"],
});

const unifraktur = UnifrakturMaguntia({
  weight: "400",
  variable: "--font-fraktur",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NextWave Dashboard",
  description: "Client management dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${medievalSharp.variable} ${unifraktur.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TodayProvider>
            <div className="min-h-screen text-foreground">
              <Navigation />
              <MedievalEffects />
              <ParchmentOverlay />
              <div className="relative z-10">
                {children}
              </div>
            </div>
          </TodayProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
