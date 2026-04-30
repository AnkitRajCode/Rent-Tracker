import type { Metadata, Viewport } from "next";
import "./globals.css";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://renttracker.nextgenui.in";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "RentTracker - Smart Rent Management",
    template: "%s | RentTracker",
  },
  description:
    "RentTracker helps property owners manage houses, tenants, and rent payments with ease. Tenants get a secure read-only portal to view their payment history and deposit details.",
  keywords: [
    "rent tracker",
    "rent management",
    "property management",
    "tenant portal",
    "rent payment",
    "house rent",
    "landlord software",
    "NextGenUI",
  ],
  authors: [
    { name: "Ankit Raj" },
    { name: "Satyajeet Ramnit" },
  ],
  creator: "NextGenUI",
  publisher: "NextGenUI",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: BASE_URL,
    siteName: "RentTracker",
    title: "RentTracker - Smart Rent Management",
    description:
      "Manage properties, tenants, and rent payments. Secure tenant portal with payment history.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "RentTracker" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "RentTracker - Smart Rent Management",
    description: "Manage properties, tenants, and rent payments.",
    images: ["/og-image.png"],
    creator: "@nextgenui",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  alternates: {
    canonical: BASE_URL,
  },
};

export const viewport: Viewport = {
  themeColor: "#F7931A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full bg-[#030304] text-white antialiased">
        {children}
      </body>
    </html>
  );
}
