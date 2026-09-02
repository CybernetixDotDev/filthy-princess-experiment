import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Filthy Princess",
  description: "Enter Filthy Princess.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-black text-white">{children}</body>
    </html>
  );
}
