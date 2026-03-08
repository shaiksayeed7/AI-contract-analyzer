import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LexiScan AI – Smart Contract Analyzer",
  description:
    "AI-powered contract analysis platform. Understand any contract in under 2 minutes. Visual risk maps, clause highlights, and AI chatbot.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
