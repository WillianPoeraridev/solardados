import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { calcularSimulacao } from "@/lib/solar-calc";
import SimuladorSolar from "@/components/SimuladorSolar";
import TabelaCenarios from "@/components/TabelaCenarios";
import ComparativoLocal from "@/components/ComparativoLocal";

export const revalidate = 86400;

type Params = { cidade: string };

async function getCidadeData(slug: string) {
  const municipio = await prisma.municipio.findUnique({
    where: { slug },
    include: { distribuidora: true },
  });

  if (!municipio || !municipio.ativa) {
    return null;
  }

  return municipio;
}

export async function generateStaticParams(): Promise<Params[]> {
  const municipios = await prisma.municipio.findMany({
    where: { ativa: true },
    select: { slug: true },
  });

  return municipios.map((m) => ({ cidade: m.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { cidade } = await params;
  const data = await getCidadeData(cidade);
  if (!data) return {};

  const uf = data.estado.toUpperCase();
  const ano = new Date().getFullYear();
  const title = `Quanto Custa Energia Solar em ${data.nome} (${uf})? Preços e Payback ${ano} | SolarDados`;
  const description = `Veja quanto custa instalar energia solar em ${data.nome}. Preços de R$ ${data.custoKwpMinimo?.toLocaleString("pt-BR")} a R$ ${data.custoKwpMaximo?.toLocaleString("pt-BR")}/kWp, tarifa ${data.distribuidora.nome} R$ ${data.distribuidora.tarifaResidencial.toFixed(2).replace(".", ",")}/kWh. Compare cenários e calcule seu payback.`;

  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
    alternates: {
      canonical: `https://solardados.com.br/quanto-custa-energia-solar/${cidade}`,
    },
  };
}

export default async function QuantoCustaPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { cidade } = await params;
  const data = await getCidadeData(cidade);
  if (!data) notFound();

  const uf = data.estado.toUpperCase();
  const estado = data.estado.toLowerCase();
  const dist = data.distribuidora;
  const irr = data.irradiacaoMedia;
  const tarifa = dist.tarifaResidencial;
  const custoMin = data.custoKwpMinimo ?? 0;
  const custoMedio = data.custoKwpMedio ?? 0;
  const custoMax = data.custoKwpMaximo ?? 0;

  const simMedia = calcularSimulacao({
    valorContaMensal: (data.consumoMedioKwh ?? 250) * tarifa,
    tipoImovel: "casa_terrea",
    irradiacaoMedia: irr,
    tarifaResidencial: tarifa,
    custoKwpMinimo: custoMin,
    custoKwpMedio: custoMedio,
    custoKwpMaximo: custoMax,
  });

  const ano = new Date().getFullYear();

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: `Quanto custa a instalação de energia solar em ${data.nome} em ${ano}?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: `Em ${data.nome}, o custo de instalação de energia solar varia de R$ ${custoMin.toLocaleString("pt-BR")} a R$ ${custoMax.toLocaleString("pt-BR")} por kWp instalado, com média de R$ ${custoMedio.toLocaleString("pt-BR")}/kWp. Para uma casa com conta de R$ 300/mês, o investimento total fica entre R$ ${calcularSimulacao({ valorContaMensal: 300, tipoImovel: "casa_terrea", irradiacaoMedia: irr, tarifaResidencial: tarifa, custoKwpMinimo: custoMin, custoKwpMedio: custoMedio, custoKwpMaximo: custoMax }).custoEstimadoMin.toLocaleString("pt-BR")} e R$ ${calcularSimulacao({ valorContaMensal: 300, tipoImovel: "casa_terrea", irradiacaoMedia: irr, tarifaResidencial: tarifa, custoKwpMinimo: custoMin, custoKwpMedio: custoMedio, custoKwpMaximo: custoMax }).custoEstimadoMax.toLocaleString("pt-BR")}.`,
            },
          },
          {
            "@type": "Question",
            name: `Vale a pena investir em energia solar em ${data.nome}?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: `Sim. Com irradiação de ${irr.toFixed(1)} kWh/m²/dia e tarifa da ${dist.nome} a R$ ${tarifa.toFixed(2)}/kWh, o payback médio em ${data.nome} é de aproximadamente ${simMedia.paybackMeses} meses. O retorno sobre investimento em 25 anos supera ${simMedia.retornoInvestimento.toFixed(0)}%.`,
            },
          },
          {
            "@type": "Question",
            name: `Quais fatores influenciam o preço de energia solar em ${data.nome}?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: `Os principais fatores são: irradiação solar local (${irr.toFixed(1)} kWh/m²/dia em ${data.nome}), tarifa da distribuidora (${dist.nome}: R$ ${tarifa.toFixed(2)}/kWh), tamanho do sistema necessário (baseado no consumo), tipo de telhado e complexidade da instalação.`,
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
            name: "Quanto Custa Energia Solar",
            item: `https://solardados.com.br/quanto-custa-energia-solar/${cidade}`,
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
              <li className="text-gray-900 font-medium">
                Quanto Custa Energia Solar
              </li>
            </ol>
          </nav>

          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Quanto Custa Energia Solar em {data.nome}?
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Preços atualizados de instalação, cenários de investimento e payback
            para {data.nome}, {uf}
          </p>
        </div>
      </section>

      {/* Tabela de cenários como conteúdo principal */}
      <section className="py-12 px-4">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Cenários de custo em {data.nome}
          </h2>
          <p className="text-gray-600 mb-6">
            Estimativas baseadas na tarifa da {dist.nome} (R${" "}
            {tarifa.toFixed(2).replace(".", ",")}/kWh) e preços de instalação da
            região
          </p>
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

      {/* Texto SEO sobre fatores de custo */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="mx-auto max-w-5xl space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">
            O que influencia o preço de energia solar em {data.nome}?
          </h2>
          <div className="text-gray-700 leading-relaxed space-y-4">
            <p>
              O custo de um sistema fotovoltaico em {data.nome} depende de três
              fatores principais: a <strong>irradiação solar local</strong>, que
              em {data.nome} é de{" "}
              <strong>
                {irr.toFixed(1).replace(".", ",")} kWh/m²/dia
              </strong>{" "}
              (
              {irr >= 4.9
                ? "acima da média nacional de 4,9"
                : "abaixo da média nacional de 4,9"}
              ), a <strong>tarifa da distribuidora</strong> ({dist.nome}:{" "}
              <strong>R$ {tarifa.toFixed(2).replace(".", ",")}/kWh</strong>) e o{" "}
              <strong>preço por kWp instalado</strong> na região (de R${" "}
              {custoMin.toLocaleString("pt-BR")} a R${" "}
              {custoMax.toLocaleString("pt-BR")}/kWp).
            </p>
            <p>
              Cidades com maior irradiação precisam de sistemas menores para
              gerar a mesma quantidade de energia, o que reduz o custo total.
              Já tarifas mais altas aumentam a economia mensal, acelerando o
              retorno do investimento. Em {data.nome}, o payback médio é de
              aproximadamente{" "}
              <strong>
                {Math.floor(simMedia.paybackMeses / 12)} anos
                {simMedia.paybackMeses % 12 > 0 &&
                  ` e ${simMedia.paybackMeses % 12} meses`}
              </strong>
              .
            </p>
          </div>
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

      {/* CTA + Simulador */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="mx-auto max-w-5xl text-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Quer calcular com o valor exato da sua conta?
          </h2>
          <p className="text-gray-600">
            Use o simulador abaixo com os dados reais de {data.nome}
          </p>
        </div>
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
      </section>

      {/* FAQ */}
      <section className="py-12 px-4">
        <div className="mx-auto max-w-5xl space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Perguntas frequentes sobre preços
          </h2>

          <div className="space-y-4">
            <div className="rounded-xl bg-white border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                Quanto custa a instalação de energia solar em {data.nome} em{" "}
                {ano}?
              </h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                Em {data.nome}, o custo por kWp instalado varia de R${" "}
                {custoMin.toLocaleString("pt-BR")} a R${" "}
                {custoMax.toLocaleString("pt-BR")}, com média de R${" "}
                {custoMedio.toLocaleString("pt-BR")}/kWp. Para uma casa com
                conta de R$ 300/mês, o investimento total fica entre R${" "}
                {calcularSimulacao({
                  valorContaMensal: 300,
                  tipoImovel: "casa_terrea",
                  irradiacaoMedia: irr,
                  tarifaResidencial: tarifa,
                  custoKwpMinimo: custoMin,
                  custoKwpMedio: custoMedio,
                  custoKwpMaximo: custoMax,
                }).custoEstimadoMin.toLocaleString("pt-BR")}{" "}
                e R${" "}
                {calcularSimulacao({
                  valorContaMensal: 300,
                  tipoImovel: "casa_terrea",
                  irradiacaoMedia: irr,
                  tarifaResidencial: tarifa,
                  custoKwpMinimo: custoMin,
                  custoKwpMedio: custoMedio,
                  custoKwpMaximo: custoMax,
                }).custoEstimadoMax.toLocaleString("pt-BR")}
                .
              </p>
            </div>

            <div className="rounded-xl bg-white border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                Vale a pena investir em energia solar em {data.nome}?
              </h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                Sim. Com irradiação de{" "}
                {irr.toFixed(1).replace(".", ",")} kWh/m²/dia e tarifa da{" "}
                {dist.nome} a R$ {tarifa.toFixed(2).replace(".", ",")}/kWh, o
                payback médio em {data.nome} é de aproximadamente{" "}
                {simMedia.paybackMeses} meses. O retorno sobre investimento em
                25 anos supera {simMedia.retornoInvestimento.toFixed(0)}%.
              </p>
            </div>

            <div className="rounded-xl bg-white border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                Quais fatores influenciam o preço em {data.nome}?
              </h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                Os principais fatores são: irradiação solar local (
                {irr.toFixed(1).replace(".", ",")} kWh/m²/dia), tarifa da
                distribuidora ({dist.nome}: R${" "}
                {tarifa.toFixed(2).replace(".", ",")}/kWh), tamanho do sistema
                necessário (baseado no seu consumo), tipo de telhado e
                complexidade da instalação.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Links cruzados */}
      <section className="py-8 px-4 bg-gray-50">
        <div className="mx-auto max-w-5xl flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-center">
          <Link
            href={`/simulador/${estado}/${cidade}`}
            className="text-yellow-600 hover:text-yellow-700 font-medium"
          >
            Simule seu sistema &rarr;
          </Link>
          <Link
            href={`/energia-solar/${estado}/${cidade}`}
            className="text-yellow-600 hover:text-yellow-700 font-medium"
          >
            Energia solar em {data.nome} &rarr;
          </Link>
          <Link
            href={`/instaladoras/${estado}/${cidade}`}
            className="text-yellow-600 hover:text-yellow-700 font-medium"
          >
            Encontre instaladoras verificadas em {data.nome} &rarr;
          </Link>
        </div>
      </section>
    </>
  );
}
