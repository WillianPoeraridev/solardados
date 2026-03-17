import Link from "next/link";

export default function EnergiaSolarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
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
          <span>&copy; 2026 SolarDados BR &middot; Dados de CRESESB, ANEEL e IBGE</span>
          <Link href="/privacidade" className="underline hover:text-gray-700">
            Política de privacidade
          </Link>
        </div>
      </footer>
    </div>
  );
}
