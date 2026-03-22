import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { FATOR_COMPENSACAO } from "@/lib/constants";
import SimuladorSolar from "@/components/SimuladorSolar";

export const revalidate = 86400;

type Params = { estado: string; cidade: string };

async function getCidadeData(estado: string, slug: string) {
  const municipio = await prisma.municipio.findUnique({
    where: { slug },
    include: { distribuidora: true },
  });

  if (!municipio || !municipio.ativa || municipio.estado.toLowerCase() !== estado) {
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
  const title = `Energia Solar em ${data.nome} - ${uf} | Simulador e Dados Reais | SolarDados`;
  const description = `Descubra se energia solar vale a pena em ${data.nome}. Simulador com dados reais: irradiação de ${data.irradiacaoMedia.toFixed(1).replace(".", ",")} kWh/m²/dia, tarifa ${data.distribuidora.nome} R$ ${data.distribuidora.tarifaResidencial.toFixed(2).replace(".", ",")}/kWh. Calcule seu payback em 2 minutos.`;

  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
    alternates: {
      canonical: `https://solardados.com.br/energia-solar/${estado}/${cidade}`,
    },
  };
}

function formatarData(date: Date | null): string {
  if (!date) return "—";
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function nomeBandeira(bandeira: string): string {
  const map: Record<string, string> = {
    verde: "Verde",
    amarela: "Amarela",
    vermelha1: "Vermelha (patamar 1)",
    vermelha2: "Vermelha (patamar 2)",
  };
  return map[bandeira] ?? bandeira;
}

export default async function CidadePage({
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
  const custoMedio = data.custoKwpMedio ?? 0;
  const consumoMedio = data.consumoMedioKwh ?? 250;
  const contaMedia = Math.round(consumoMedio * tarifa);
  const economiaMensalMedia = Math.round(consumoMedio * tarifa * FATOR_COMPENSACAO);
  const comparacaoNacional = irr >= 4.9 ? "acima" : "abaixo";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: `Quanto custa instalar energia solar em ${data.nome}?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: `Em ${data.nome}, o custo de instalação varia de R$ ${data.custoKwpMinimo?.toLocaleString("pt-BR")} a R$ ${data.custoKwpMaximo?.toLocaleString("pt-BR")} por kWp, com média de R$ ${custoMedio.toLocaleString("pt-BR")}/kWp.`,
            },
          },
          {
            "@type": "Question",
            name: `Qual o payback de energia solar em ${data.nome}?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: `O payback estimado para sistemas residenciais em ${data.nome} é de 5 a 8 anos, dependendo do consumo e do custo de instalação. Com irradiação de ${irr.toFixed(1)} kWh/m²/dia, ${data.nome} tem bom potencial solar.`,
            },
          },
          {
            "@type": "Question",
            name: `Qual a distribuidora de energia em ${data.nome}?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: `A distribuidora que atende ${data.nome} é a ${dist.nome}, com tarifa residencial de R$ ${tarifa.toFixed(2)}/kWh.`,
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
            item: `https://solardados.com.br/energia-solar/${estado}`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: data.nome,
            item: `https://solardados.com.br/energia-solar/${estado}/${cidade}`,
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

      {/* Seção 1 — Hero */}
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
              <li>{data.nome}</li>
              <li>&rsaquo;</li>
              <li className="text-gray-900 font-medium">Energia Solar</li>
            </ol>
          </nav>

          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Energia Solar em {data.nome}, {uf}
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Dados atualizados de irradiação, tarifa e custo de instalação para{" "}
            {data.nome}
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

      {/* Seção 2 — Simulador */}
      <SimuladorSolar
        cidade={data.nome}
        estado={uf}
        distribuidora={dist.nome}
        municipioId={data.id}
        irradiacaoMedia={irr}
        tarifaResidencial={tarifa}
        custoKwpMinimo={data.custoKwpMinimo ?? 0}
        custoKwpMedio={custoMedio}
        custoKwpMaximo={data.custoKwpMaximo ?? 0}
      />

      {/* Seção 3 — Sobre energia solar na cidade */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="mx-auto max-w-5xl space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Vale a pena instalar energia solar em {data.nome}?
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {data.nome} recebe em média{" "}
              <strong>
                {irr.toFixed(1).replace(".", ",")} kWh/m²/dia
              </strong>{" "}
              de irradiação solar, {comparacaoNacional} da média nacional de 4,9
              kWh/m²/dia. Com a tarifa da {dist.nome} a{" "}
              <strong>R$ {tarifa.toFixed(2).replace(".", ",")}/kWh</strong>, uma
              residência com conta de R$ {contaMedia}/mês pode economizar até{" "}
              <strong>R$ {economiaMensalMedia}/mês</strong> instalando um
              sistema fotovoltaico.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Distribuidora de energia em {data.nome}
            </h3>
            <p className="text-gray-700 leading-relaxed">
              A distribuidora que atende {data.nome} é a{" "}
              <strong>{dist.nome}</strong>. A tarifa residencial vigente é de{" "}
              <strong>R$ {tarifa.toFixed(2).replace(".", ",")}/kWh</strong>, com
              último reajuste em{" "}
              <strong>{formatarData(dist.dataUltimoReajuste)}</strong>. Bandeira
              tarifária atual:{" "}
              <strong>{nomeBandeira(dist.bandeiraTarifaria)}</strong>.
            </p>
          </div>
        </div>
      </section>

      {/* Seção 4 — Ferramentas (links cruzados Cluster 2) */}
      <section className="py-12 px-4">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Ferramentas para {data.nome}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Link
              href={`/simulador/${estado}/${cidade}`}
              className="group rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:border-yellow-300 hover:shadow-md transition-all"
            >
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-yellow-700">
                Simulador de Energia Solar &rarr;
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Calcule custo e payback com dados da sua conta de luz
              </p>
            </Link>
            <Link
              href={`/quanto-custa-energia-solar/${cidade}`}
              className="group rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:border-yellow-300 hover:shadow-md transition-all"
            >
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-yellow-700">
                Quanto custa energia solar? &rarr;
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Veja cenários de instalação e preços em {data.nome}
              </p>
            </Link>
          </div>
        </div>
      </section>

    </>
  );
}
