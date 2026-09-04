import type { Metadata } from "next";
import "@/styles/globals.css";
import Providers from "./providers";

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
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}