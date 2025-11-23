import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "../styles/pokemon-theme.css";
import { Providers } from "./providers";
import { ToastProvider } from "../components/Toast";
import { Navigation } from "../components/Navigation";
import { PageLoadingWrapper } from "../components/PageLoadingWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PokéChain Battles - GameFi on OneChain",
  description: "Capture, train, and battle Pokémon as NFTs on the blockchain",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-gray-50 dark:bg-gray-900`}
      >
        <Providers>
          <PageLoadingWrapper>
            <Navigation />
            <main className="min-h-[calc(100vh-4rem)]">
              {children}
            </main>
          </PageLoadingWrapper>
          <ToastProvider />
        </Providers>
      </body>
    </html>
  );
}
