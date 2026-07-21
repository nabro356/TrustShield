import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ShieldNet - Digital Public Safety AI Platform",
  description:
    "Multi-agent AI platform for counterfeit detection, digital arrest scam analysis, and fraud network intelligence. Supporting 10 Indian languages. Built for ET AI Hackathon 2.0.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}
