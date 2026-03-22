/**
 * Scraping de instaladoras de energia solar via Google Places API (Text Search).
 * Executar com: pnpm scrape:instaladoras
 *
 * Requisitos: GOOGLE_PLACES_API_KEY no .env
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const API_KEY = process.env.GOOGLE_PLACES_API_KEY;
if (!API_KEY) {
  console.error("❌ GOOGLE_PLACES_API_KEY não configurada no .env");
  process.exit(1);
}

const DETAILS_DELAY_MS = 200;
const PAGE_TOKEN_DELAY_MS = 2000;
const MAX_PAGES = 3;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface PlaceResult {
  place_id: string;
  name: string;
  formatted_address: string;
  rating?: number;
  user_ratings_total?: number;
  geometry?: {
    location: { lat: number; lng: number };
  };
}

interface TextSearchResponse {
  results: PlaceResult[];
  next_page_token?: string;
  status: string;
}

interface PlaceDetailsResponse {
  result?: {
    formatted_phone_number?: string;
    website?: string;
  };
  status: string;
}

async function textSearch(
  query: string,
  pageToken?: string
): Promise<TextSearchResponse> {
  const url = new URL(
    "https://maps.googleapis.com/maps/api/place/textsearch/json"
  );
  url.searchParams.set("query", query);
  url.searchParams.set("key", API_KEY!);
  url.searchParams.set("language", "pt-BR");
  if (pageToken) {
    url.searchParams.set("pagetoken", pageToken);
  }

  const res = await fetch(url.toString());
  return res.json() as Promise<TextSearchResponse>;
}

async function getPlaceDetails(
  placeId: string
): Promise<PlaceDetailsResponse> {
  const url = new URL(
    "https://maps.googleapis.com/maps/api/place/details/json"
  );
  url.searchParams.set("place_id", placeId);
  url.searchParams.set("fields", "formatted_phone_number,website");
  url.searchParams.set("key", API_KEY!);

  const res = await fetch(url.toString());
  return res.json() as Promise<PlaceDetailsResponse>;
}

function extrairEstadoDoEndereco(address: string): string {
  // Tenta extrair UF do formato "..., Estado - XX, ..."
  const match = address.match(
    /\b(AC|AL|AP|AM|BA|CE|DF|ES|GO|MA|MT|MS|MG|PA|PB|PR|PE|PI|RJ|RN|RS|RO|RR|SC|SP|SE|TO)\b/
  );
  return match ? match[1] : "";
}

function extrairCidadeDoEndereco(address: string): string {
  // Formato típico: "Rua X, 123 - Bairro, Cidade - UF, CEP, Brasil"
  const parts = address.split(",").map((p) => p.trim());
  for (const part of parts) {
    const cityMatch = part.match(/^(.+?)\s*-\s*[A-Z]{2}$/);
    if (cityMatch) return cityMatch[1].trim();
  }
  return parts.length >= 2 ? parts[parts.length - 3] || "" : "";
}

async function main() {
  const municipios = await prisma.municipio.findMany({
    where: { ativa: true },
    include: { distribuidora: true },
  });

  console.log(`📍 ${municipios.length} cidades ativas encontradas\n`);

  let totalUpserts = 0;
  let totalEncontradas = 0;

  for (const municipio of municipios) {
    const query = `instaladora energia solar em ${municipio.nome} ${municipio.estado}`;
    console.log(`🔍 Buscando: ${municipio.nome}/${municipio.estado}...`);

    try {
      const allResults: PlaceResult[] = [];
      let pageToken: string | undefined;

      for (let page = 0; page < MAX_PAGES; page++) {
        if (page > 0 && pageToken) {
          await delay(PAGE_TOKEN_DELAY_MS);
        }

        const response = await textSearch(query, pageToken);

        if (response.status !== "OK" && response.status !== "ZERO_RESULTS") {
          console.warn(
            `   ⚠️ Status ${response.status} para ${municipio.nome}`
          );
          break;
        }

        allResults.push(...response.results);
        pageToken = response.next_page_token;

        if (!pageToken) break;
      }

      totalEncontradas += allResults.length;
      console.log(`   ${allResults.length} resultados encontrados`);

      for (const place of allResults) {
        await delay(DETAILS_DELAY_MS);

        let telefone: string | null = null;
        let website: string | null = null;

        try {
          const details = await getPlaceDetails(place.place_id);
          telefone = details.result?.formatted_phone_number ?? null;
          website = details.result?.website ?? null;
        } catch {
          // Continuar sem detalhes se falhar
        }

        const estadoExtraido =
          extrairEstadoDoEndereco(place.formatted_address) || municipio.estado;
        const cidadeExtraida =
          extrairCidadeDoEndereco(place.formatted_address) || municipio.nome;

        await prisma.instaladora.upsert({
          where: { googlePlaceId: place.place_id },
          update: {
            nome: place.name,
            googleRating: place.rating ?? null,
            googleReviews: place.user_ratings_total ?? null,
            telefone,
            website,
            latitude: place.geometry?.location.lat ?? null,
            longitude: place.geometry?.location.lng ?? null,
          },
          create: {
            nome: place.name,
            cidade: cidadeExtraida,
            estado: estadoExtraido,
            municipioId: municipio.id,
            distribuidoraId: municipio.distribuidoraId,
            googlePlaceId: place.place_id,
            googleRating: place.rating ?? null,
            googleReviews: place.user_ratings_total ?? null,
            telefone,
            website,
            latitude: place.geometry?.location.lat ?? null,
            longitude: place.geometry?.location.lng ?? null,
            ativa: true,
          },
        });

        totalUpserts++;
      }
    } catch (error) {
      console.error(`   ❌ Erro em ${municipio.nome}:`, error);
      // Continua para a próxima cidade
    }
  }

  console.log(
    `\n✅ Scraping concluído — ${totalEncontradas} encontradas, ${totalUpserts} upserts realizados`
  );
}

main()
  .catch((error) => {
    console.error("❌ Erro no scraping:", error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
