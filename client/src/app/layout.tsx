import type { Metadata } from "next";
// Importing the Metadata type from Next.js for defining the page's metadata.

import { DM_Sans } from "next/font/google";
// Importing the DM Sans font utility from Next.js's Google Fonts integration.

import "./globals.css";
// Importing global CSS styles for the application.

// collect logs to vercel analytics
import { SpeedInsights } from "@vercel/speed-insights/next"

import Providers from "./providers";
// Importing a custom Providers component, likely used to wrap the app with context providers (e.g., Redux, Theme).

import { ClerkProvider } from "@clerk/nextjs";
// Importing ClerkProvider for authentication features using Clerk.

import { Toaster } from "sonner";
// Importing Toaster for displaying toast notifications using the Sonner library.

import { Suspense } from "react";
// Importing Suspense from React for lazy loading and fallback UI handling.

const dmSans = DM_Sans({
  subsets: ["latin"], // Specifies the subset of the DM Sans font to load (e.g., Latin characters).
  display: "swap", // Ensures the font swaps seamlessly when it loads.
  variable: "--font-dm-sans", // CSS custom property for the font, useful for styling.
});

// Metadata for the application
export const metadata: Metadata = {
  title: "CognitechX Academy",
  description: "A place for learning and teaching",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode; // Declares the type for `children` prop as a React node.
}>) {
  return (
    <ClerkProvider>
      {/* Wrapping the entire application with ClerkProvider for authentication context */}
      <html lang="en">
        {/* Setting the language attribute for the HTML element */}
        <body className={`${dmSans.className}`}>
          {/* Applying the DM Sans font class to the body element */}
          <Providers>
            {/* Wrapping the app with custom providers (e.g., for theme, Redux, etc.) */}
            <Suspense fallback={null}>
              {/* Enables lazy loading of components with a fallback of `null` */}
              <div className="root-layout">{children}</div>
              {/* Main layout wrapper for the app's children */}
            </Suspense>
            <Toaster richColors closeButton />
            {/* Toaster component for displaying toast notifications with enhanced styling */}
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}