import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Three-Tier Application",
  description: "A reference implementation of a three-tier web application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
