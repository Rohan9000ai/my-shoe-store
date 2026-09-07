import type { Metadata } from "next";
import "@/styles/globals.css";
import Providers from "./providers";
import { buildOrganizationJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Luxe Sole — Handcrafted Luxury Footwear",
  description:
    "Handcrafted shoes for the modern connoisseur, tailored from premium selected calfskin and designed in Milan.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const organizationJsonLd = buildOrganizationJsonLd();

  return (
    <html lang="en">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}