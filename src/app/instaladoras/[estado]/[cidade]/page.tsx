import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import CardInstaladora from "@/components/CardInstaladora";
import MapaInstaladoras from "@/components/MapaInstaladoras";

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
  const instaladoras = await prisma.instaladora.findMany({
    where: { municipioId: data.id, ativa: true },
    select: { googleRating: true },
  });

  const count = instaladoras.length;
  const ratings = instaladoras
    .map((i) => i.googleRating)
    .filter((r): r is number => r != null);
  const ratingMedio =
    ratings.length > 0
      ? (ratings.reduce((a, b) => a + b, 0) / ratings.length)
          .toFixed(1)
          .replace(".", ",")
      : null;

  const title = `Instaladoras de Energia Solar em ${data.nome} - ${uf} | Empresas Verificadas | SolarDados`;
  const description = ratingMedio
    ? `${count} instaladoras de energia solar verificadas em ${data.nome}. Nota média ${ratingMedio}/5 no Google. Compare avaliações, telefones e sites.`
    : `Encontre instaladoras de energia solar verificadas em ${data.nome}. Compare avaliações, telefones e sites.`;

  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
    alternates: {
      canonical: `https://solardados.com.br/instaladoras/${estado}/${cidade}`,
    },
  };
}

export default async function InstaladorasPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { estado, cidade } = await params;
  const data = await getCidadeData(estado, cidade);
  if (!data) notFound();

  const uf = data.estado.toUpperCase();

  const instaladoras = await prisma.instaladora.findMany({
    where: { municipioId: data.id, ativa: true },
    orderBy: [{ leadParceira: "desc" }, { googleRating: "desc" }],
  });

  const comCoordenadas = instaladoras.filter(
    (i) => i.latitude != null && i.longitude != null
  );

  // Coordenada central da cidade (média das instaladoras ou primeira instaladora)
  const cidadeLat =
    comCoordenadas.length > 0
      ? comCoordenadas.reduce((sum, i) => sum + i.latitude!, 0) /
        comCoordenadas.length
      : -23.55; // fallback SP
  const cidadeLng =
    comCoordenadas.length > 0
      ? comCoordenadas.reduce((sum, i) => sum + i.longitude!, 0) /
        comCoordenadas.length
      : -46.63;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
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
            name: "Instaladoras de Energia Solar",
            item: `https://solardados.com.br/instaladoras/${estado}/${cidade}`,
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: `Como escolher uma instaladora de energia solar em ${data.nome}?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: `Verifique as avaliações no Google, solicite pelo menos 3 orçamentos, confirme se a empresa tem registro no CREA e pergunte sobre garantia de performance do sistema. Em ${data.nome}, há ${instaladoras.length} instaladoras verificadas listadas no SolarDados.`,
            },
          },
          {
            "@type": "Question",
            name: `Quantas instaladoras de energia solar existem em ${data.nome}?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: `O SolarDados lista ${instaladoras.length} instaladoras de energia solar verificadas em ${data.nome}, ${uf}. A listagem é atualizada periodicamente com dados do Google Maps.`,
            },
          },
          {
            "@type": "Question",
            name: `Qual o preço médio de instalação de energia solar em ${data.nome}?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: `Em ${data.nome}, o custo de instalação varia de R$ ${(data.custoKwpMinimo ?? 0).toLocaleString("pt-BR")} a R$ ${(data.custoKwpMaximo ?? 0).toLocaleString("pt-BR")} por kWp. Solicite orçamentos de diferentes instaladoras para comparar preços.`,
            },
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
                Instaladoras de Energia Solar
              </li>
            </ol>
          </nav>

          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Instaladoras de Energia Solar em {data.nome}, {uf}
          </h1>
          <p className="text-lg text-gray-600">
            {instaladoras.length > 0
              ? `${instaladoras.length} empresas verificadas listadas`
              : "Nenhuma instaladora listada ainda para esta cidade"}
          </p>
        </div>
      </section>

      {/* Mapa (opcional) */}
      {comCoordenadas.length > 0 && (
        <section className="py-8 px-4">
          <div className="mx-auto max-w-5xl">
            <MapaInstaladoras
              instaladoras={comCoordenadas.map((i) => ({
                nome: i.nome,
                lat: i.latitude!,
                lng: i.longitude!,
              }))}
              cidadeLat={cidadeLat}
              cidadeLng={cidadeLng}
            />
          </div>
        </section>
      )}

      {/* Grid de instaladoras */}
      <section className="py-12 px-4">
        <div className="mx-auto max-w-5xl">
          {instaladoras.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {instaladoras.map((inst) => (
                <CardInstaladora
                  key={inst.id}
                  nome={inst.nome}
                  googleRating={inst.googleRating}
                  googleReviews={inst.googleReviews}
                  telefone={inst.telefone}
                  website={inst.website}
                  anosMercado={inst.anosMercado}
                  leadParceira={inst.leadParceira}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
              <p className="text-gray-600">
                Ainda não temos instaladoras listadas em {data.nome}. Estamos
                atualizando nosso banco de dados periodicamente.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Como verificamos */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-xl bg-white border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Como verificamos as instaladoras
            </h2>
            <p className="text-gray-700 text-sm leading-relaxed">
              As empresas listadas foram encontradas via Google Maps e
              verificadas com base em: avaliações de clientes, presença ativa no
              Google, e dados públicos disponíveis. A listagem não constitui
              recomendação ou garantia de qualidade de serviço.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12 px-4">
        <div className="mx-auto max-w-5xl space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Perguntas frequentes sobre instaladoras
          </h2>

          <div className="space-y-4">
            <div className="rounded-xl bg-white border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                Como escolher uma instaladora de energia solar em {data.nome}?
              </h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                Verifique as avaliações no Google, solicite pelo menos 3
                orçamentos, confirme se a empresa tem registro no CREA e
                pergunte sobre garantia de performance do sistema. Em{" "}
                {data.nome}, há {instaladoras.length} instaladoras verificadas
                listadas no SolarDados.
              </p>
            </div>

            <div className="rounded-xl bg-white border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                Quantas instaladoras de energia solar existem em {data.nome}?
              </h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                O SolarDados lista {instaladoras.length} instaladoras de energia
                solar verificadas em {data.nome}, {uf}. A listagem é atualizada
                periodicamente com dados do Google Maps.
              </p>
            </div>

            <div className="rounded-xl bg-white border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                Qual o preço médio de instalação de energia solar em {data.nome}?
              </h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                Em {data.nome}, o custo de instalação varia de R${" "}
                {(data.custoKwpMinimo ?? 0).toLocaleString("pt-BR")} a R${" "}
                {(data.custoKwpMaximo ?? 0).toLocaleString("pt-BR")} por kWp.
                Solicite orçamentos de diferentes instaladoras para comparar
                preços.
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
            Simule seu sistema solar em {data.nome} &rarr;
          </Link>
          <Link
            href={`/energia-solar/${estado}/${cidade}`}
            className="text-yellow-600 hover:text-yellow-700 font-medium"
          >
            Energia solar em {data.nome} &rarr;
          </Link>
          <Link
            href={`/quanto-custa-energia-solar/${cidade}`}
            className="text-yellow-600 hover:text-yellow-700 font-medium"
          >
            Quanto custa em {data.nome}? &rarr;
          </Link>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-6 px-4">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs text-gray-400 text-center">
            Os dados exibidos são de fontes públicas. A listagem não constitui
            recomendação ou garantia de serviço. Instaladoras podem solicitar
            atualização ou remoção de seus dados entrando em contato.
          </p>
        </div>
      </section>
    </>
  );
}
