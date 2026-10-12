import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LittleBrother",
  description: "Information Gathering (OSINT) Framework",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-black">
      <body className="min-h-full m-0 p-0 bg-black text-[#00ff00] selection:bg-[#00ff00] selection:text-black">
        {children}
      </body>
    </html>
  );
}
