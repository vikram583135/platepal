import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ErrorBoundary from "@/components/ErrorBoundary";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PlatePal - Food Delivery Made Easy",
  description: "Order delicious food from your favorite restaurants with fast delivery. Discover amazing cuisines and enjoy exclusive deals.",
  keywords: ["food delivery", "restaurants", "online ordering", "food ordering"],
  authors: [{ name: "PlatePal" }],
  openGraph: {
    title: "PlatePal - Food Delivery Made Easy",
    description: "Order delicious food from your favorite restaurants",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PlatePal - Food Delivery Made Easy",
    description: "Order delicious food from your favorite restaurants",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  },
  themeColor: "#FF6B35",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ErrorBoundary>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-md focus:shadow-lg"
          >
            Skip to main content
          </a>
          <main id="main-content">{children}</main>
        </ErrorBoundary>
      </body>
    </html>
  );
}
