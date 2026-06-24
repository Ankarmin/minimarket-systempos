import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MiniMarket POS — MiniMarket El Ahorro S.A.C.",
  description: "Sistema POS - Thin Client",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="h-full overflow-hidden">{children}</body>
    </html>
  );
}
