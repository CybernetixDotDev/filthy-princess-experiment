import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Descent",
  description: "Experimental visual R&D playground.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-black text-white">{children}</body>
    </html>
  );
}
