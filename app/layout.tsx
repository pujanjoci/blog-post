import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "GitBlog — Serverless CMS",
  description: "A beautiful, Git-based headless CMS blog platform powered by GitHub and Next.js.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-[#0a0a0f] text-gray-100 transition-colors">
        <Navbar />
        <main className="flex-1 w-full pt-16">
          {children}
        </main>
      </body>
    </html>
  );
}
