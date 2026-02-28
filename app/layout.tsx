import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import Link from "next/link";
import "./globals.css";
import { Toaster } from "sonner";
import { StorageStatus } from "@/components/StorageStatus";
import { ExportData } from "@/components/ExportData";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Valmo Cassa - Offline First",
  description: "Sistema di gestione cassa locale per Valmo Festival",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <header className="border-b bg-white/50 backdrop-blur-md sticky top-0 z-50">
            <div className=" mx-auto px-8 h-16 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <Link
                  href="/"
                  className="font-bold text-xl tracking-tight text-primary whitespace-nowrap"
                >
                  Valmo Cassa
                </Link>
              </div>
              <nav className="flex items-center gap-6">
                <Link
                  href="/"
                  className="text-sm font-medium hover:text-primary transition-colors"
                >
                  Cassa
                </Link>
                <Link
                  href="/dashboard"
                  className="text-sm font-medium hover:text-primary transition-colors"
                >
                  Dashboard
                </Link>
              </nav>
              <div className="flex items-center gap-2">
                <StorageStatus />
                <ExportData />
              </div>
            </div>
          </header>
          {children}
        </ThemeProvider>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
