import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import ErrorBoundary from "@/components/ErrorBoundary";

export const metadata: Metadata = {
  title: "PlatePal Delivery - Deliver Orders",
  description: "Delivery partner app for PlatePal - Track deliveries, manage tasks, and view earnings",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  },
  themeColor: "#00B894",
  robots: "noindex, nofollow", // Internal app
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ErrorBoundary>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-md focus:shadow-lg skip-link"
            aria-label="Skip to main content"
          >
            Skip to main content
          </a>
          <main id="main-content">
            {children}
          </main>
          <Toaster position="top-center" richColors />
        </ErrorBoundary>
      </body>
    </html>
  );
}

