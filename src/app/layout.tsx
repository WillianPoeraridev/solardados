import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SolarDados BR",
  description:
    "Plataforma de dados e simuladores de energia solar para o mercado brasileiro",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
