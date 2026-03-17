import type { Metadata } from "next";
import Link from "next/link";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import "./globals.css";

export const metadata: Metadata = {
  title: "SolarDados BR — Simulador de Energia Solar com Dados Reais",
  description:
    "Simulador gratuito de energia solar com dados reais por cidade. Calcule payback, economia e custo de instalação em São Paulo, Curitiba, BH, Campinas e Porto Alegre.",
  metadataBase: new URL("https://solardados.com.br"),
  alternates: { canonical: "https://solardados.com.br" },
  verification: {
    google: "rbYhYnjEJOWZHxNzfQgfqcj3VfVcD-ZyNFro5NnuX6k",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen flex flex-col">
        <GoogleAnalytics />

        <header className="border-b border-gray-200 bg-white">
          <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
            <Link href="/" className="text-xl font-bold text-yellow-600">
              SolarDados
            </Link>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t border-gray-200 bg-gray-50 py-8">
          <div className="mx-auto max-w-5xl px-4 text-sm text-gray-500 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>
              &copy; 2026 SolarDados BR &middot; Dados de CRESESB, ANEEL e IBGE
            </span>
            <Link
              href="/privacidade"
              className="underline hover:text-gray-700"
            >
              Política de privacidade
            </Link>
          </div>
        </footer>
      </body>
    </html>
  );
}
