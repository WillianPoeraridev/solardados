import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { calcularSimulacao } from "@/lib/solar-calc";
import SimuladorSolar from "@/components/SimuladorSolar";
import TabelaCenarios from "@/components/TabelaCenarios";
import ComparativoLocal from "@/components/ComparativoLocal";

export const revalidate = 86400;

type Params = { estado: string; cidade: string };

async function getCidadeData(estado: string, slug: string) {
  const municipio = await prisma.municipio.findUnique({
    where: { slug },
    include: { distribuidora: true },
  });

  if (
    !municipio ||
    !municipio.ativa ||
    municipio.estado.toLowerCase() !== estado
  ) {
    return null;
  }

  return municipio;
}

export async function generateStaticParams(): Promise<Params[]> {
  const municipios = await prisma.municipio.findMany({
    where: { ativa: true },
    select: { estado: true, slug: true },
  });

  return municipios.map((m) => ({
    estado: m.estado.toLowerCase(),
    cidade: m.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { estado, cidade } = await params;
  const data = await getCidadeData(estado, cidade);
  if (!data) return {};

  const uf = data.estado.toUpperCase();
  const title = `Simulador de Energia Solar em ${data.nome} - ${uf} | Calcule Custo e Payback | SolarDados`;
  const description = `Simule seu sistema de energia solar em ${data.nome}. Calcule custo de instalação, payback e economia mensal com dados reais: irradiação ${data.irradiacaoMedia.toFixed(1).replace(".", ",")} kWh/m²/dia, tarifa ${data.distribuidora.nome} R$ ${data.distribuidora.tarifaResidencial.toFixed(2).replace(".", ",")}/kWh.`;

  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
    alternates: {
      canonical: `https://solardados.com.br/simulador/${estado}/${cidade}`,
    },
  };
}

export default async function SimuladorPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { estado, cidade } = await params;
  const data = await getCidadeData(estado, cidade);
  if (!data) notFound();

  const uf = data.estado.toUpperCase();
  const dist = data.distribuidora;
  const irr = data.irradiacaoMedia;
  const tarifa = dist.tarifaResidencial;
  const custoMin = data.custoKwpMinimo ?? 0;
  const custoMedio = data.custoKwpMedio ?? 0;
  const custoMax = data.custoKwpMaximo ?? 0;

  // Calcular payback médio da cidade para o ComparativoLocal
  const simMedia = calcularSimulacao({
    valorContaMensal: (data.consumoMedioKwh ?? 250) * tarifa,
    tipoImovel: "casa_terrea",
    irradiacaoMedia: irr,
    tarifaResidencial: tarifa,
    custoKwpMinimo: custoMin,
    custoKwpMedio: custoMedio,
    custoKwpMaximo: custoMax,
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: `Como funciona o simulador de energia solar para ${data.nome}?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: `O simulador usa dados reais de irradiação solar (${irr.toFixed(1)} kWh/m²/dia) e a tarifa da ${dist.nome} (R$ ${tarifa.toFixed(2)}/kWh) para calcular a potência ideal do sistema, custo de instalação, economia mensal e payback.`,
            },
          },
          {
            "@type": "Question",
            name: `Qual o tamanho de sistema solar ideal para minha casa em ${data.nome}?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: `O tamanho depende do seu consumo mensal. Para uma conta de R$ 300/mês em ${data.nome}, o sistema recomendado é de aproximadamente ${calcularSimulacao({ valorContaMensal: 300, tipoImovel: "casa_terrea", irradiacaoMedia: irr, tarifaResidencial: tarifa, custoKwpMinimo: custoMin, custoKwpMedio: custoMedio, custoKwpMaximo: custoMax }).sistemaKwp.toFixed(1)} kWp. Use o simulador acima para calcular com o valor exato da sua conta.`,
            },
          },
          {
            "@type": "Question",
            name: `Qual a economia mensal com energia solar em ${data.nome}?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: `A economia depende do consumo e da tarifa local. Com a tarifa da ${dist.nome} a R$ ${tarifa.toFixed(2)}/kWh, um sistema solar pode reduzir sua conta de luz em até 85%, considerando o fator de compensação da Lei 14.300/2022.`,
            },
          },
        ],
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Brasil",
            item: "https://solardados.com.br",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: uf,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: data.nome,
            item: `https://solardados.com.br/energia-solar/${estado}/${cidade}`,
          },
          {
            "@type": "ListItem",
            position: 4,
            name: "Simulador Solar",
            item: `https://solardados.com.br/simulador/${estado}/${cidade}`,
          },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <section className="bg-gradient-to-b from-yellow-50 to-white py-10 px-4">
        <div className="mx-auto max-w-5xl">
          <nav className="text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-1">
              <li>
                <Link href="/" className="hover:text-gray-700">
                  Brasil
                </Link>
              </li>
              <li>&rsaquo;</li>
              <li>{uf}</li>
              <li>&rsaquo;</li>
              <li>
                <Link
                  href={`/energia-solar/${estado}/${cidade}`}
                  className="hover:text-gray-700"
                >
                  {data.nome}
                </Link>
              </li>
              <li>&rsaquo;</li>
              <li className="text-gray-900 font-medium">Simulador Solar</li>
            </ol>
          </nav>

          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Simulador de Energia Solar em {data.nome}, {uf}
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Calcule custo, payback e economia com dados reais da{" "}
            {dist.nome} — tarifa de R${" "}
            {tarifa.toFixed(2).replace(".", ",")}/kWh
          </p>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-white border border-gray-200 p-5 shadow-sm">
              <p className="text-sm font-medium text-gray-500">Irradiação</p>
              <p className="text-3xl font-bold text-yellow-600 mt-1">
                {irr.toFixed(1).replace(".", ",")} kWh/m²/dia
              </p>
              <p className="text-xs text-gray-400 mt-1">Fonte: CRESESB</p>
            </div>

            <div className="rounded-xl bg-white border border-gray-200 p-5 shadow-sm">
              <p className="text-sm font-medium text-gray-500">Tarifa</p>
              <p className="text-3xl font-bold text-yellow-600 mt-1">
                R$ {tarifa.toFixed(2).replace(".", ",")}/kWh
              </p>
              <p className="text-xs text-gray-400 mt-1">{dist.nome}</p>
            </div>

            <div className="rounded-xl bg-white border border-gray-200 p-5 shadow-sm">
              <p className="text-sm font-medium text-gray-500">Custo médio</p>
              <p className="text-3xl font-bold text-yellow-600 mt-1">
                R$ {custoMedio.toLocaleString("pt-BR")}/kWp
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Instalação na região
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Simulador */}
      <SimuladorSolar
        cidade={data.nome}
        estado={uf}
        distribuidora={dist.nome}
        municipioId={data.id}
        irradiacaoMedia={irr}
        tarifaResidencial={tarifa}
        custoKwpMinimo={custoMin}
        custoKwpMedio={custoMedio}
        custoKwpMaximo={custoMax}
      />

      {/* Tabela de cenários */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Cenários de instalação em {data.nome}
          </h2>
          <TabelaCenarios
            cidade={data.nome}
            estado={uf}
            irradiacaoMedia={irr}
            tarifaResidencial={tarifa}
            custoKwpMinimo={custoMin}
            custoKwpMedio={custoMedio}
            custoKwpMaximo={custoMax}
          />
        </div>
      </section>

      {/* Comparativo local */}
      <section className="py-12 px-4">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {data.nome} vs. média nacional
          </h2>
          <ComparativoLocal
            cidade={data.nome}
            irradiacaoMedia={irr}
            tarifaResidencial={tarifa}
            paybackMedioCidade={simMedia.paybackMeses}
          />
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="mx-auto max-w-5xl space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Perguntas frequentes sobre o simulador
          </h2>

          <div className="space-y-4">
            <div className="rounded-xl bg-white border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                Como funciona o simulador de energia solar para {data.nome}?
              </h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                O simulador usa dados reais de irradiação solar (
                {irr.toFixed(1).replace(".", ",")} kWh/m²/dia do CRESESB) e a
                tarifa da {dist.nome} (R${" "}
                {tarifa.toFixed(2).replace(".", ",")}/kWh) para calcular a
                potência ideal do sistema, custo de instalação, economia mensal
                e payback. Basta informar o valor da sua conta de luz.
              </p>
            </div>

            <div className="rounded-xl bg-white border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                Qual o tamanho de sistema solar ideal para minha casa em{" "}
                {data.nome}?
              </h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                O tamanho depende do seu consumo mensal. Para uma conta de R$
                300/mês em {data.nome}, o sistema recomendado é de
                aproximadamente{" "}
                {calcularSimulacao({
                  valorContaMensal: 300,
                  tipoImovel: "casa_terrea",
                  irradiacaoMedia: irr,
                  tarifaResidencial: tarifa,
                  custoKwpMinimo: custoMin,
                  custoKwpMedio: custoMedio,
                  custoKwpMaximo: custoMax,
                })
                  .sistemaKwp.toFixed(1)
                  .replace(".", ",")}{" "}
                kWp. Use o simulador acima para calcular com o valor exato da
                sua conta.
              </p>
            </div>

            <div className="rounded-xl bg-white border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                Qual a economia mensal com energia solar em {data.nome}?
              </h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                A economia depende do consumo e da tarifa local. Com a tarifa da{" "}
                {dist.nome} a R$ {tarifa.toFixed(2).replace(".", ",")}/kWh, um
                sistema solar pode reduzir sua conta de luz em até 85%,
                considerando o fator de compensação da Lei 14.300/2022.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Link de volta ao Cluster 1 */}
      <section className="py-8 px-4">
        <div className="mx-auto max-w-5xl text-center">
          <Link
            href={`/energia-solar/${estado}/${cidade}`}
            className="text-yellow-600 hover:text-yellow-700 font-medium"
          >
            Saiba mais sobre energia solar em {data.nome} &rarr;
          </Link>
        </div>
      </section>
    </>
  );
}
