import Link from "next/link";
import { prisma } from "@/lib/db";

export const revalidate = 86400;

export default async function Home() {
  const municipios = await prisma.municipio.findMany({
    where: { ativa: true },
    include: { distribuidora: true },
    orderBy: { populacao: "desc" },
  });

  return (
    <>
      <section className="bg-gradient-to-b from-yellow-50 to-white py-16 px-4">
        <div className="mx-auto max-w-5xl text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
            SolarDados BR — Simulador de Energia Solar com Dados Reais
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Descubra se energia solar vale a pena para a sua casa. Simulação
            gratuita com dados reais de irradiação, tarifa e custo de instalação
            da sua cidade.
          </p>
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Cidades disponíveis
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {municipios.map((m) => (
              <Link
                key={m.id}
                href={`/energia-solar/${m.estado.toLowerCase()}/${m.slug}`}
                className="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:border-yellow-300 hover:shadow-md transition-all"
              >
                <h3 className="text-lg font-semibold text-gray-900">
                  {m.nome}, {m.estado}
                </h3>

                <div className="mt-3 space-y-1 text-sm text-gray-600">
                  <p>
                    Irradiação:{" "}
                    <span className="font-medium text-gray-900">
                      {m.irradiacaoMedia.toFixed(1).replace(".", ",")} kWh/m²/dia
                    </span>
                  </p>
                  <p>
                    Tarifa:{" "}
                    <span className="font-medium text-gray-900">
                      R${" "}
                      {m.distribuidora.tarifaResidencial
                        .toFixed(2)
                        .replace(".", ",")}
                      /kWh
                    </span>
                  </p>
                </div>

                <p className="mt-4 text-sm font-medium text-yellow-600 group-hover:text-yellow-700">
                  Simular em {m.nome} &rarr;
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
