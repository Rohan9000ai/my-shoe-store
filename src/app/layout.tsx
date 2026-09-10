import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "@/styles/globals.css";
import Providers from "./providers";
import { buildOrganizationJsonLd } from "@/lib/seo";

// ✅ Use the installed fonts
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  preload: true,
  weight: ["400", "600", "700"],
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-playfair",
  preload: true,
  weight: ["700"],
});

export const metadata: Metadata = {
  title: "Luxe Sole — Luxury Footwear",
  description:
    "Handcrafted shoes for the modern connoisseur, tailored from premium selected calfskin and designed in Milan.",
  openGraph: {
    title: "Luxe Sole — Luxury Footwear",
    description: "Handcrafted shoes for the modern connoisseur",
    url: "https://luxesole.com",
    siteName: "Luxe Sole",
    images: [
      {
        url: "https://luxesole.com/og-image.jpg",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Luxe Sole — Luxury Footwear",
    description: "Handcrafted shoes for the modern connoisseur",
    images: ["https://luxesole.com/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const organizationJsonLd = buildOrganizationJsonLd();

  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        {/* ✅ Preconnect to external resources */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        
        {/* ✅ Preconnect to image CDN */}
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        
        {/* ✅ Preload hero image for LCP (only if images exist) */}
        {/* <link
          rel="preload"
          href="/hero-1-mobile.jpg"
          as="image"
          fetchPriority="high"
          media="(max-width: 768px)"
        />
        <link
          rel="preload"
          href="/hero-1.jpg"
          as="image"
          fetchPriority="high"
          media="(min-width: 769px)"
        /> */}
        
        {/* ✅ Viewport meta tag for mobile optimization */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover"
        />
        
        {/* ✅ Theme color for mobile browsers */}
        <meta name="theme-color" content="#6B4226" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="antialiased bg-[#F5E6D3]">
        {/* ✅ JSON-LD for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}